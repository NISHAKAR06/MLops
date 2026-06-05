"""
RAG E-Commerce Intelligence Chatbot Backend
============================================
Real RAG pipeline using:
  - Google Gemini text-embedding-004  → vector embeddings
  - Google Gemini 1.5 Flash           → LLM generation
  - FAISS                             → vector store & similarity search
  - Flask                             → REST API
"""

import os
import sys
import json
import time
import re
import glob
import hashlib
import threading
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Load local open source embedding model (downloads ~80MB once)
print("[RAG] Loading local open-source embedding model (all-MiniLM-L6-v2)...")
local_embedder = SentenceTransformer("all-MiniLM-L6-v2")

CHAT_MODEL = "Qwen/Qwen2.5-1.5B-Instruct"
print(f"[RAG] Loading local LLM model ({CHAT_MODEL})...")
tokenizer = AutoTokenizer.from_pretrained(CHAT_MODEL)
llm_model = AutoModelForCausalLM.from_pretrained(
    CHAT_MODEL,
    torch_dtype=torch.float32,
    device_map="auto"
)

from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime

# ─── Load environment ───────────────────────────────────────────
load_dotenv()

# ─── Constants ──────────────────────────────────────────────────
# Models
EMBED_MODEL      = "local-all-MiniLM-L6-v2"
EMBED_DIM        = 384          # all-MiniLM-L6-v2 dimension is 384
TOP_K            = 5            # number of chunks to retrieve
CHUNK_SIZE       = 2000         # max chars per chunk (increased to reduce total chunks)
CHUNK_OVERLAP    = 200          # overlap between chunks
KB_DIR           = os.path.join(os.path.dirname(__file__), "knowledge_base")
INDEX_CACHE_FILE = os.path.join(os.path.dirname(__file__), "faiss_index.cache")
CHUNKS_CACHE_FILE= os.path.join(os.path.dirname(__file__), "chunks.cache.json")

app = Flask(__name__)
CORS(app)

# ─── Global RAG State ───────────────────────────────────────────
faiss_index: faiss.IndexFlatIP = None   # Inner Product (cosine after normalisation)
chunks: list[dict] = []                 # list of {"text": str, "source": str, "chunk_id": int}
conversation_store: dict[str, list] = {}  # session_id → message history
last_index_error: str = None            # Store the last error during index build

# ═══════════════════════════════════════════════════════════════
#  DOCUMENT LOADING & CHUNKING
# ═══════════════════════════════════════════════════════════════

def load_documents(kb_dir: str) -> list[dict]:
    """Load all .txt files from the knowledge base directory."""
    docs = []
    txt_files = glob.glob(os.path.join(kb_dir, "*.txt"))
    for path in txt_files:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        docs.append({"text": content, "source": os.path.basename(path)})
    print(f"[RAG] Loaded {len(docs)} document files from knowledge base.")
    return docs


def chunk_text(text: str, source: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[dict]:
    """Split text into overlapping chunks."""
    chunks_out = []
    start = 0
    chunk_id = 0
    while start < len(text):
        end = start + size
        chunk = text[start:end].strip()
        if len(chunk) > 50:   # ignore tiny fragments
            chunks_out.append({"text": chunk, "source": source, "chunk_id": chunk_id})
            chunk_id += 1
        start += size - overlap
    return chunks_out


def build_chunks(docs: list[dict]) -> list[dict]:
    """Build all chunks from all documents."""
    all_chunks = []
    for doc in docs:
        all_chunks.extend(chunk_text(doc["text"], doc["source"]))
    print(f"[RAG] Created {len(all_chunks)} chunks total.")
    return all_chunks


# ═══════════════════════════════════════════════════════════════
#  EMBEDDING  (local SentenceTransformer)
# ═══════════════════════════════════════════════════════════════

def embed_texts(texts: list[str], task_type: str = "RETRIEVAL_DOCUMENT") -> np.ndarray:
    """
    Call local SentenceTransformer to embed a batch of texts.
    Returns normalised float32 numpy array.
    """
    embeddings = local_embedder.encode(texts, convert_to_numpy=True)
    embeddings = np.array(embeddings, dtype=np.float32)
    # Normalise for cosine similarity via inner product
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1e-10, norms)
    embeddings = embeddings / norms
    return embeddings


def embed_query(query: str) -> np.ndarray:
    """Embed a single query string for retrieval."""
    embeddings = local_embedder.encode([query], convert_to_numpy=True)
    embeddings = np.array(embeddings, dtype=np.float32)
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1e-10, norms)
    embeddings = embeddings / norms
    return embeddings


# ═══════════════════════════════════════════════════════════════
#  FAISS INDEX BUILD / LOAD
# ═══════════════════════════════════════════════════════════════

def _kb_hash() -> str:
    """Hash all KB files to detect changes."""
    h = hashlib.md5()
    for path in sorted(glob.glob(os.path.join(KB_DIR, "*.txt"))):
        with open(path, "rb") as f:
            h.update(f.read())
    return h.hexdigest()


def build_faiss_index(chunk_list: list[dict]) -> faiss.IndexFlatIP:
    """Embed all chunks and build FAISS inner product index."""
    texts = [c["text"] for c in chunk_list]
    print(f"[RAG] Embedding {len(texts)} chunks with local sentence-transformer...")
    embeddings = embed_texts(texts, task_type="RETRIEVAL_DOCUMENT")
    d = embeddings.shape[1]
    index = faiss.IndexFlatIP(d)
    index.add(embeddings)
    print(f"[RAG] FAISS index built with {index.ntotal} vectors.")
    return index


last_attempt_time: float = 0.0
index_lock = threading.Lock()

def load_or_build_index(api_key=None):
    """
    Load cached FAISS index + chunks if KB has not changed,
    otherwise rebuild from scratch.
    """
    global faiss_index, chunks, last_index_error, last_attempt_time
    
    with index_lock:
        if faiss_index is not None:
            return True

        now = time.time()
        if last_index_error and "429" in last_index_error and (now - last_attempt_time) < 60:
            print(f"[RAG] Cooldown active. Waiting {int(60 - (now - last_attempt_time))}s before retrying...")
            return False

        last_attempt_time = now

        current_hash = _kb_hash()

        if os.path.exists(INDEX_CACHE_FILE) and os.path.exists(CHUNKS_CACHE_FILE):
            try:
                with open(CHUNKS_CACHE_FILE, "r", encoding="utf-8") as f:
                    cache = json.load(f)
                if cache.get("kb_hash") == current_hash:
                    print("[RAG] Loading cached FAISS index (KB unchanged)...")
                    chunks = cache["chunks"]
                    faiss_index = faiss.read_index(INDEX_CACHE_FILE)
                    print(f"[RAG] Loaded index with {faiss_index.ntotal} vectors and {len(chunks)} chunks.")
                    return True
            except Exception as e:
                print(f"[WARNING] Failed to load cached index: {e}")

        import traceback
        print("[RAG] Building fresh FAISS index (KB changed or no cache)...")
        try:
            docs = load_documents(KB_DIR)
            chunks = build_chunks(docs)
            faiss_index = build_faiss_index(chunks)

            # Cache to disk
            faiss.write_index(faiss_index, INDEX_CACHE_FILE)
            with open(CHUNKS_CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump({"kb_hash": current_hash, "chunks": chunks}, f, ensure_ascii=False)
            print("[RAG] Index cached to disk.")
            return True
        except Exception as e:
            print(f"[ERROR] Failed to build FAISS index: {e}")
            traceback.print_exc()
            last_index_error = str(e)
            if not last_index_error:
                last_index_error = repr(e)
            faiss_index = None
            chunks = []
            return False


# ═══════════════════════════════════════════════════════════════
#  RETRIEVAL
# ═══════════════════════════════════════════════════════════════

def retrieve(query: str, k: int = TOP_K) -> list[dict]:
    """
    Embed query, search FAISS, return top-k chunks with scores.
    """
    query_vec = embed_query(query)
    scores, indices = faiss_index.search(query_vec, k)
    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0:   # FAISS returns -1 for empty slots
            continue
        chunk = chunks[idx].copy()
        chunk["score"] = float(score)
        results.append(chunk)
    return results


# ═══════════════════════════════════════════════════════════════
#  GENERATION  (real Gemini 1.5 Flash)
# ═══════════════════════════════════════════════════════════════

SYSTEM_PROMPT = """You are an expert E-Commerce Product Intelligence Assistant powered by a RAG (Retrieval-Augmented Generation) system.

Your role is to help sellers and entrepreneurs:
- Analyze products and customer reviews
- Generate launch strategies for new products
- Provide pricing recommendations
- Suggest SEO optimization for listings
- Give packaging and marketing advice
- Answer questions about e-commerce best practices

You answer STRICTLY based on the retrieved context provided to you. If the context doesn't fully cover a question, you acknowledge what you know from context and offer general expertise. Always be specific, actionable, and data-driven.

Formatting rules:
- Use markdown for structure (bold, bullets, headers)
- Be concise but thorough
- Include specific numbers/percentages when available from context
- Always cite key insights from retrieved reviews or data
"""

def generate_rag_response(query: str, retrieved_chunks: list[dict], history: list[dict]) -> str:
    """
    Build prompt from retrieved context + conversation history,
    call local Qwen model, return the response text.
    """
    # Build context block
    context_parts = []
    for i, chunk in enumerate(retrieved_chunks):
        context_parts.append(
            f"[Source {i+1} | {chunk['source']} | Relevance: {chunk['score']:.3f}]\n{chunk['text']}"
        )
    context_block = "\n\n---\n\n".join(context_parts)

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
    ]
    # Add history
    for m in history[-6:]:
        messages.append({"role": m["role"], "content": m["content"]})
    
    # Add current context + query
    user_content = f"""===== RETRIEVED CONTEXT FROM KNOWLEDGE BASE =====
{context_block}
=================================================

User Question: {query}

Answer (using the retrieved context above):"""

    messages.append({"role": "user", "content": user_content})
    
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )
    
    model_inputs = tokenizer([text], return_tensors="pt").to(llm_model.device)
    
    generated_ids = llm_model.generate(
        **model_inputs,
        max_new_tokens=512,
        temperature=0.4,
        do_sample=True,
        top_p=0.9
    )
    
    # Trim input tokens from output
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]
    
    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    return response


# ═══════════════════════════════════════════════════════════════
#  API ROUTES
# ═══════════════════════════════════════════════════════════════

def configure_request_key():
    """Bypass Gemini configuration and load/build local FAISS index."""
    load_or_build_index()


@app.route("/api/health", methods=["GET"])
def health():
    configure_request_key()
    return jsonify({
        "status": "ok",
        "service": "RAG E-Commerce Intelligence Chatbot",
        "index_ready": faiss_index is not None,
        "total_chunks": len(chunks),
        "embed_model": EMBED_MODEL,
        "llm_model": CHAT_MODEL,
        "version": "2.0.0",
        "has_key": (faiss_index is not None) or bool(os.getenv("GEMINI_API_KEY") and os.getenv("GEMINI_API_KEY") != "your_gemini_api_key_here")
    })


@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Main RAG chatbot endpoint.
    Body: { "message": str, "session_id": str (optional) }
    Returns: { "answer": str, "sources": [...], "session_id": str }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    user_message = (data.get("message") or "").strip()
    session_id   = data.get("session_id") or f"sess_{int(time.time())}"

    if not user_message:
        return jsonify({"error": "message is required"}), 400

    configure_request_key()

    if faiss_index is None:
        err_msg = "RAG index not ready. Please make sure a valid Gemini API key is configured."
        if last_index_error:
            err_msg += f" (Backend Error: {last_index_error})"
        return jsonify({"error": err_msg}), 503

    # Retrieve relevant chunks
    try:
        retrieved = retrieve(user_message, k=TOP_K)
    except Exception as e:
        return jsonify({"error": f"Retrieval failed: {str(e)}. Check your API key."}), 500

    # Get / initialize conversation history
    history = conversation_store.get(session_id, [])

    # Generate answer
    try:
        answer = generate_rag_response(user_message, retrieved, history)
    except Exception as e:
        return jsonify({"error": f"Generation failed: {str(e)}. Check your API key."}), 500

    # Update history
    history.append({"role": "user", "content": user_message})
    history.append({"role": "assistant", "content": answer})
    conversation_store[session_id] = history[-20:]  # keep last 10 turns

    # Format sources for UI
    sources = [
        {
            "source": c["source"],
            "text": c["text"][:200] + "..." if len(c["text"]) > 200 else c["text"],
            "score": round(c["score"], 4),
            "chunk_id": c["chunk_id"],
        }
        for c in retrieved
    ]

    return jsonify({
        "answer": answer,
        "sources": sources,
        "session_id": session_id,
        "retrieved_count": len(retrieved),
        "timestamp": datetime.now().isoformat(),
    })


@app.route("/api/chat/history", methods=["GET"])
def get_history():
    """Return conversation history for a session."""
    session_id = request.args.get("session_id", "")
    history = conversation_store.get(session_id, [])
    return jsonify({"session_id": session_id, "history": history, "count": len(history)})


@app.route("/api/chat/clear", methods=["POST"])
def clear_history():
    """Clear conversation history for a session."""
    data = request.get_json() or {}
    session_id = data.get("session_id", "")
    if session_id in conversation_store:
        del conversation_store[session_id]
    return jsonify({"status": "cleared", "session_id": session_id})


@app.route("/api/index/stats", methods=["GET"])
def index_stats():
    """Return index statistics."""
    configure_request_key()
    sources = {}
    for c in chunks:
        sources[c["source"]] = sources.get(c["source"], 0) + 1
    return jsonify({
        "total_vectors": faiss_index.ntotal if faiss_index else 0,
        "total_chunks": len(chunks),
        "sources": sources,
        "embed_model": EMBED_MODEL,
        "embed_dimension": EMBED_DIM,
        "similarity_metric": "cosine (via normalised inner product)",
    })


@app.route("/api/analyze", methods=["POST"])
def analyze_product():
    """
    Product launch analysis via RAG chatbot.
    Accepts: product_name, category, features — runs a RAG-powered analysis.
    """
    data = request.get_json() or {}
    product_name = data.get("product_name", "").strip()
    category     = data.get("category", "").strip()
    features     = data.get("features", "").strip()

    if not product_name:
        return jsonify({"error": "product_name is required"}), 400

    configure_request_key()

    if faiss_index is None:
        return jsonify({"error": "RAG index not ready. Please make sure knowledge base is populated and built."}), 503

    query = (
        f"I want to launch a new {category} product called '{product_name}'. "
        f"Key features: {features}. "
        f"Give me a comprehensive launch strategy including: SEO title, product description, "
        f"pricing recommendation, packaging suggestions, and a marketing script. "
        f"Base your advice on customer reviews and market insights from the knowledge base."
    )

    try:
        retrieved = retrieve(query, k=TOP_K)
        answer = generate_rag_response(query, retrieved, [])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    sources = [
        {"source": c["source"], "text": c["text"][:200] + "...", "score": round(c["score"], 4)}
        for c in retrieved
    ]

    return jsonify({
        "status": "success",
        "product_name": product_name,
        "category": category,
        "analysis": answer,
        "sources": sources,
        "generated_at": datetime.now().isoformat(),
    })


# ═══════════════════════════════════════════════════════════════
#  STARTUP
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    print("=" * 60)
    print("  RAG E-Commerce Intelligence Chatbot")
    print("  Embed: local-all-MiniLM-L6-v2")
    print("  LLM:   Qwen/Qwen2.5-1.5B-Instruct")
    print("  Store: FAISS (IndexFlatIP, cosine)")
    print("=" * 60)

    # Build / load the RAG index at startup
    success = load_or_build_index()

    if success:
        print(f"\n[RAG] System ready. {len(chunks)} chunks indexed.")
    else:
        print("\n[WARNING] RAG index could not be built at startup.")

    print("[RAG] Starting Flask on http://0.0.0.0:5000\n")
    app.run(host="0.0.0.0", port=5000, debug=False)
