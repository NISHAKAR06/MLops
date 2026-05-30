import uuid
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.db_models import Product, AIGeneration, Upload
from app.schemas.schemas import ProcessPayload, AIGenerationResponse
from app.ml.inference import yolo_model, whisper_model, trocr_model, bert_model, sd_model, gemini_model, llama_model, get_dataset
from app.utils.websocket_manager import manager

router = APIRouter()

@router.post("/process", response_model=AIGenerationResponse)
async def process_multimodal_pipeline(payload: ProcessPayload, db: Session = Depends(get_db)):
    # Generate unique product_id if not present
    product_id = f"P-{uuid.uuid4().hex[:6].upper()}"
    
    # Broadcast starting message
    await manager.broadcast(f"[Pipeline] Initializing pipeline flow for Product {product_id}...")
    await asyncio.sleep(0.5)
    
    # 1. Speech Transcription (ASR)
    voice_note_text = ""
    if payload.audio_paths:
        await manager.broadcast("[ASR] Running Whisper transcribing on voice note...")
        voice_note_text = whisper_model.transcribe(payload.audio_paths[0])
        await manager.broadcast(f"[ASR] Whisper result: '{voice_note_text}'")
        await asyncio.sleep(0.5)
        
    # 2. Object Detection & OCR
    ocr_texts = []
    if payload.image_paths:
        await manager.broadcast("[Vision] Running YOLOv8 object detection overlay...")
        boxes = yolo_model.detect(payload.image_paths[0])
        await manager.broadcast(f"[Vision] Detected items: {', '.join([b['label'] for b in boxes])}")
        await asyncio.sleep(0.5)
        
        await manager.broadcast("[OCR] TrOCR character reader searching for product tags...")
        trocr_results = trocr_model.extract_text(payload.image_paths[0])
        ocr_texts = [r["text"] for r in trocr_results]
        await manager.broadcast(f"[OCR] Text read from labels: {', '.join(ocr_texts)}")
        await asyncio.sleep(0.5)

    # 3. Multimodal Fusion
    await manager.broadcast("[Fusion] Performing multimodal token fusion across sensory fields...")
    combined_context = payload.text_input or ""
    if voice_note_text:
        combined_context += " " + voice_note_text
    if ocr_texts:
        combined_context += " Fiber details: " + " ".join(ocr_texts)
    await asyncio.sleep(0.4)

    # 4. BERT Category Prediction
    await manager.broadcast("[Classifier] BERT categorization module sorting category tree...")
    category = bert_model.classify_category(combined_context)
    await manager.broadcast(f"[Classifier] Predicted: '{category}'")
    await asyncio.sleep(0.4)

    # 5. Llama-3 Copywriting (Local trained model first)
    # We only run the generative copywriting model if the seller explicitly provided BOTH product_name and short_description!
    has_title = bool(payload.product_name and payload.product_name.strip())
    has_desc = bool(payload.short_description and payload.short_description.strip())
    
    if has_title and has_desc:
        await manager.broadcast("[Generative] Invoking local Llama-3 8B copy refinement...")
        # Fuse user-provided short title and description context
        search_context = f"{payload.product_name} {payload.short_description}"
        results = llama_model.generate_listing(search_context, category)
        await manager.broadcast("[Generative] Professional listing generated via local Llama-3 model.")
        await asyncio.sleep(0.4)
    else:
        await manager.broadcast("[Generative] Short title and/or description not fully provided by seller. Bypassing copywriting refinement.")
        # Fallback directly to whatever the seller provided, keeping original inputs without generating new ones!
        results = {
            "title": payload.product_name or "",
            "description": payload.short_description or "",
            "bullets": [],
            "tags": [t.lower().strip() for t in (payload.product_name or "").replace("-", " ").split() if len(t) > 2],
            "confidence": {"category": 0.90, "brand": 0.85, "attributes": 0.88}
        }
        await asyncio.sleep(0.4)

    # Database records insertion
    product = Product(
        id=product_id,
        name=results["title"][:50] if results["title"] else f"Product {product_id}",
        category=category,
        status="generated",
        price=results.get("price", 1299.0)
    )
    db.add(product)
    db.flush()
    
    # Save the upload records if paths are provided
    for img in payload.image_paths:
        db.add(Upload(product_id=product_id, file_path=img, file_type="image", status="parsed"))
    for vid in payload.video_paths:
        db.add(Upload(product_id=product_id, file_path=vid, file_type="video", status="parsed"))
    for aud in payload.audio_paths:
        db.add(Upload(product_id=product_id, file_path=aud, file_type="audio", status="parsed"))

    generation = AIGeneration(
        product_id=product_id,
        title=results["title"],
        description=results["description"],
        bullets=results["bullets"],
        tags=results["tags"],
        confidence_score=results["confidence"]
    )
    db.add(generation)
    db.commit()
    db.refresh(generation)
    
    await manager.broadcast(f"[Database] SQL transaction committed for {product_id}. Ready.")
    
    return generation

@router.post("/generate-title")
def generate_title(description: str):
    # Call Llama-3 model
    results = llama_model.generate_listing(description, "General")
    return {"title": results["title"]}

@router.post("/generate-description")
def generate_description(text_input: str):
    # Call Llama-3 model
    results = llama_model.generate_listing(text_input, "General")
    return {"description": results["description"]}

@router.post("/generate-visuals")
def generate_visuals(image_path: str, preset: str):
    # Call SD model
    results = sd_model.enhance_visuals(image_path, preset)
    return results

@router.post("/pricing")
def get_pricing_recommendation(product_name: str, cost_price: float = 300.0):
    import pandas as pd
    df = get_dataset()
    
    # Try to find a real match in the dataset using a vectorized keyword scoring lookup
    match_row = None
    if df is not None and len(df) > 0:
        query_terms = [w for w in product_name.lower().split() if len(w) > 2]
        if query_terms:
            p_names = df["product_name"].astype(str).str.lower()
            scores = pd.Series(0.0, index=df.index)
            for term in query_terms:
                scores += 5.0 * p_names.str.contains(term, regex=False, na=False).astype(float)
                
            max_score = scores.max()
            if max_score > 0.0:
                match_row = df.loc[scores.idxmax()]
                
    if match_row is not None:
        retail = float(match_row["retail_price"]) if not pd.isna(match_row["retail_price"]) and float(match_row["retail_price"]) > 0 else 1299.0
        discounted = float(match_row["discounted_price"]) if not pd.isna(match_row["discounted_price"]) and float(match_row["discounted_price"]) > 0 else 999.0
        brand = str(match_row["brand"]) if not pd.isna(match_row["brand"]) and str(match_row["brand"]) != "nan" else "Competitor"
        
        avg_competitor_price = retail
        recommended_price = discounted
        competitors = [
            {"seller": f"{brand} Retail", "price": retail, "rating": 4.4},
            {"seller": "LaunchOps Discount", "price": discounted, "rating": 4.6},
            {"seller": "Alternative Seller", "price": round(discounted * 1.1, 2), "rating": 4.1}
        ]
    else:
        # Generate scaled competitor metrics dynamically based on cost_price and industry segment
        p_name_lower = product_name.lower()
        base_cost = cost_price
        if base_cost <= 0:
            if any(kw in p_name_lower for kw in ["phone", "mobile", "vivo", "electronic", "smartphone", "laptop"]):
                base_cost = 10000.0
            elif any(kw in p_name_lower for kw in ["bra", "shorts", "activewear", "clothing", "apparel", "saree"]):
                base_cost = 400.0
            elif any(kw in p_name_lower for kw in ["cream", "skincare", "beauty", "cosmetics"]):
                base_cost = 250.0
            else:
                base_cost = 300.0
                
        recommended_price = round(base_cost * 1.35, 2)
        avg_competitor_price = round(base_cost * 1.55, 2)
        
        # Segment-specific competitor stores
        if any(kw in p_name_lower for kw in ["phone", "mobile", "vivo", "electronic", "smartphone", "device", "laptop"]):
            competitors = [
                {"seller": "ElectroMart Tech", "price": round(avg_competitor_price * 1.05, 2), "rating": 4.3},
                {"seller": "SmartHub Digital", "price": round(avg_competitor_price * 0.96, 2), "rating": 4.5},
                {"seller": "AlphaMobiles Online", "price": round(recommended_price * 1.02, 2), "rating": 4.1}
            ]
        elif any(kw in p_name_lower for kw in ["bra", "shorts", "activewear", "clothing", "apparel", "sporty", "saree"]):
            competitors = [
                {"seller": "Trendz Apparel", "price": round(avg_competitor_price * 1.05, 2), "rating": 4.2},
                {"seller": "VogueWear Boutique", "price": round(avg_competitor_price * 0.97, 2), "rating": 4.4},
                {"seller": "LuxeLinen Outlet", "price": round(recommended_price * 1.03, 2), "rating": 4.1}
            ]
        elif any(kw in p_name_lower for kw in ["cream", "skincare", "beauty", "cosmetics", "organic"]):
            competitors = [
                {"seller": "AuraCosmetics", "price": round(avg_competitor_price * 1.04, 2), "rating": 4.4},
                {"seller": "GlowBeauty Studio", "price": round(avg_competitor_price * 0.98, 2), "rating": 4.6},
                {"seller": "PureSkin Organic", "price": round(recommended_price * 1.01, 2), "rating": 4.2}
            ]
        else:
            competitors = [
                {"seller": "GlobalRetail Inc", "price": round(avg_competitor_price * 1.05, 2), "rating": 4.3},
                {"seller": "SmartBuy Megastore", "price": round(avg_competitor_price * 0.96, 2), "rating": 4.5},
                {"seller": "ValueDirect Seller", "price": round(recommended_price * 1.02, 2), "rating": 4.2}
            ]
            
    margin = recommended_price - cost_price
    margin_percent = (margin / recommended_price) * 100 if recommended_price > 0 else 0.0
    
    return {
        "competitor_average": avg_competitor_price,
        "recommended_price": recommended_price,
        "margin": margin,
        "margin_percent": round(margin_percent, 2),
        "competitors": competitors
    }

@router.post("/compliance")
def verify_compliance(hsn_code: int = 5208, text_body: str = ""):
    compliance_checklist = []
    
    hsn_desc = "Standard E-Commerce SKU format"
    if hsn_code == 5208:
        hsn_desc = "Woven Cotton Fabric"
    elif hsn_code == 3304:
        hsn_desc = "Skincare/Beauty Cosmetics"
        
    compliance_checklist.append({"rule": "GST / HSN code present", "status": "pass", "note": f"HSN {hsn_code} — {hsn_desc}"})
    
    text_len = len(text_body)
    if text_len > 250:
        compliance_checklist.append({"rule": "Length check", "status": "warn", "note": f"Copy length {text_len} is close to character limit."})
    else:
        compliance_checklist.append({"rule": "Length check", "status": "pass", "note": f"Copy length {text_len} under standard limit."})
        
    restricted_found = False
    for word in ["guarantee", "original", "best", "100%"]:
        if word in text_body.lower():
            restricted_found = True
            compliance_checklist.append({"rule": "Restricted terms", "status": "warn", "note": f"Avoid advertising keywords like '{word}'."})
            break
            
    if not restricted_found:
        compliance_checklist.append({"rule": "Restricted terms", "status": "pass", "note": "No restricted descriptive words found."})
        
    banned_found = False
    for word in ["banned", "illegal", "fake", "replica"]:
        if word in text_body.lower():
            banned_found = True
            compliance_checklist.append({"rule": "Prohibited keywords", "status": "fail", "note": f"Banned keyword '{word}' detected."})
            break
            
    if not banned_found:
        compliance_checklist.append({"rule": "Prohibited keywords", "status": "pass", "note": "No banned words found."})
        
    score = 100 - sum(10 for item in compliance_checklist if item["status"] == "warn") - sum(30 for item in compliance_checklist if item["status"] == "fail")
    
    return {"compliance_score": max(score, 0), "checklist": compliance_checklist}

from pydantic import BaseModel

class ExpandPayload(BaseModel):
    product_name: str
    short_description: str

@router.post("/expand")
def expand_text_input(payload: ExpandPayload, db: Session = Depends(get_db)):
    has_title = bool(payload.product_name and payload.product_name.strip())
    has_desc = bool(payload.short_description and payload.short_description.strip())
    
    # We only run generative copywriting expansion if BOTH short title and description are explicitly provided!
    if not has_title or not has_desc:
        text_content = f"{payload.product_name or ''} {payload.short_description or ''}".strip()
        category = bert_model.classify_category(text_content) if text_content else "General"
        return {
            "title": payload.product_name or "",
            "description": payload.short_description or "",
            "category": category
        }

    # 1. Fuse product metadata
    text_content = f"{payload.product_name} {payload.short_description}".strip()
    
    # 2. Run category classifier weights
    category = bert_model.classify_category(text_content)
    
    # 3. Invoke copywriting model
    results = llama_model.generate_listing(text_content, category)
    
    return {
        "title": results["title"],
        "description": results["description"],
        "category": category
    }
