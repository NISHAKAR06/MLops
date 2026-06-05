# ═══════════════════════════════════════════════════════════════
# RAG E-Commerce Intelligence Chatbot – Dockerfile
# Real RAG: Gemini text-embedding-004 + FAISS + Gemini 1.5 Flash
# ═══════════════════════════════════════════════════════════════

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system deps for FAISS
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (layer caching)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source and knowledge base
COPY backend/ ./

# Expose Flask port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/api/health')"

# Run Flask (production with gunicorn recommended for Docker)
CMD ["python", "app.py"]
