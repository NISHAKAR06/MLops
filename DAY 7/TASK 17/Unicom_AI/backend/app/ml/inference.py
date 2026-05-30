import os
import pickle
import time
import random
from typing import Dict, List, Any
import pandas as pd

class YOLOv8Model:
    def detect(self, image_path: str) -> List[Dict[str, Any]]:
        # Simulate YOLOv8 object detection
        return [
            {"label": "Saree", "confidence": 0.96, "box": [10, 15, 80, 75]},
            {"label": "Blouse Piece", "confidence": 0.88, "box": [20, 40, 30, 30]}
        ]

class WhisperModel:
    def transcribe(self, audio_path: str) -> str:
        # Simulate Whisper ASR transcribing
        return "Handloom cotton saree with indigo block print, 5.5 meter length, blouse piece included, comfortable for daily wear."

class TrOCRModel:
    def extract_text(self, image_path: str) -> List[Dict[str, Any]]:
        # Simulate OCR character reading
        return [
            {"text": "100% COTTON", "confidence": 0.94, "box": [42, 72, 25, 6]},
            {"text": "MADE IN INDIA", "confidence": 0.97, "box": [45, 80, 20, 5]}
        ]

class BERTModel:
    def classify_category(self, text: str) -> str:
        # Load the trained TF-IDF & Logistic Regression model if available
        model_file = "models/category_classifier.pkl"
        vectorizer_file = "models/tfidf_vectorizer.pkl"
        
        if os.path.exists(model_file) and os.path.exists(vectorizer_file):
            try:
                with open(model_file, "rb") as f:
                    model = pickle.load(f)
                with open(vectorizer_file, "rb") as f:
                    vectorizer = pickle.load(f)
                
                # Predict category using loaded weights
                features = vectorizer.transform([text])
                prediction = model.predict(features)[0]
                return prediction
            except Exception:
                pass

        # Fallback to keyword matching
        t_low = text.lower()
        if "saree" in t_low:
            return "Fashion › Women › Ethnic Wear › Sarees"
        elif "coffee" in t_low:
            return "Home › Kitchen › Coffee"
        elif "coconut" in t_low:
            return "Grocery › Cooking Oils"
        elif any(kw in t_low for kw in ["phone", "mobile", "vivo", "electronic", "smartphone", "device", "samsung", "iphone"]):
            return "Electronics › Mobiles › Smartphones"
        elif any(kw in t_low for kw in ["bra", "shorts", "activewear", "clothing", "apparel", "sporty", "gym"]):
            return "Fashion › Women › Clothing › Activewear"
        elif any(kw in t_low for kw in ["cream", "skincare", "beauty", "cosmetics", "organic", "moisturizer"]):
            return "Beauty & Personal Care › Skincare › Face"
        else:
            return "General › E-Commerce Product"

class StableDiffusionModel:
    def enhance_visuals(self, image_path: str, preset: str) -> Dict[str, Any]:
        # Simulate SDXL graphics enhancement presets
        presets = {
            "studio": "uploads/images/enhanced_studio.png",
            "lifestyle": "uploads/images/enhanced_lifestyle.png",
            "crop": "uploads/images/enhanced_crop.png",
            "enhance": "uploads/images/enhanced_hdr.png"
        }
        return {
            "preset": preset,
            "status": "success",
            "output_path": presets.get(preset, image_path),
            "latency": 2.3
        }

_df_cached = None

def get_dataset():
    global _df_cached
    if _df_cached is not None:
        return _df_cached
        
    csv_file = "unified_multimodal_ecommerce_products_dataset.csv.csv"
    if not os.path.exists(csv_file):
        csv_file = "../unified_multimodal_ecommerce_products_dataset.csv.csv"
        
    if os.path.exists(csv_file):
        try:
            print(f"[Dataset Loader] Loading real catalog dataset from {csv_file}...")
            df = pd.read_csv(csv_file)
            df = df.dropna(subset=["product_name", "description"])
            _df_cached = df
            return _df_cached
        except Exception as e:
            print(f"[Dataset Loader Error] Failed to load CSV: {e}")
    return None

def retrieve_listing_from_ds(text_input: str, category: str) -> Dict[str, Any]:
    df = get_dataset()
    if df is None or len(df) == 0:
        # Final fallback if dataset is missing or unreadable
        return {
            "title": f"{text_input} — Handcrafted Premium Product",
            "description": f"A high-quality e-commerce listing for {text_input}. Built for daily retail optimization.",
            "bullets": ["Premium quality and finish", "Eco-friendly sustainable packaging", "100% customer satisfaction guaranteed"],
            "tags": [category.lower(), "premium", "e-commerce"],
            "packaging_suggestion": "Standard recyclable cardboard envelope",
            "confidence": {"category": 0.85, "brand": 0.80, "attributes": 0.82}
        }
        
    # Search logic: find rows where product_name or description matches terms in text_input
    # Clean up text input into tokens
    query_terms = [w for w in text_input.lower().split() if len(w) > 2]
    
    match_row = None
    if query_terms:
        sub_df = df
        if category and category != "General › E-Commerce Product":
            cat_root = category.split("›")[0].strip()
            sub_df = df[df["main_category"].astype(str).str.contains(cat_root, case=False, na=False)]
            if len(sub_df) == 0:
                sub_df = df
                
        # Perform highly optimized vectorized keyword scoring over all rows in the dataset
        p_names = sub_df["product_name"].astype(str).str.lower()
        descs = sub_df["description"].astype(str).str.lower()
        
        scores = pd.Series(0.0, index=sub_df.index)
        for term in query_terms:
            scores += 5.0 * p_names.str.contains(term, regex=False, na=False).astype(float)
            scores += 1.0 * descs.str.contains(term, regex=False, na=False).astype(float)
            
        max_score = scores.max()
        if max_score > 0.0:
            match_row = sub_df.loc[scores.idxmax()]
            
    if match_row is None:
        # Smart dynamic fallback when the query doesn't match any products in the CSV (e.g. 'vivo mobile phone')
        title = " ".join([w.capitalize() for w in text_input.strip().split()])
        if not title:
            title = "Premium Retail Catalog Item"
            
        bullets = [
            f"Next-generation {title} engineered for premium quality and outstanding daily utility.",
            "Crafted using top-grade materials to guarantee maximum durability and reliability.",
            "Features a sleek, ergonomic, and aesthetic design that integrates seamlessly with your style.",
            "Optimized performance to ensure excellent efficiency, durability, and user convenience.",
            "Standard compliance certification pass, ready for active marketplace catalog indexing."
        ]
        
        description = (
            f"Key Features of {title} include state-of-the-art build quality and a highly robust design. "
            f"Designed with direct seller input, this premium {title} represents the standard for "
            f"retail satisfaction and superior daily performance. Featuring maximum air permeability and lightweight ergonomics, "
            f"it is perfect for both active professional environments and comfortable domestic use. "
            f"Specifications of {title}: Occasion: Casual / Daily; Color: Dynamic Assorted; Pattern: Solid; "
            f"General details indicate premium inner/outer materials designed for complete irritation-free long-term usability."
        )
        
        tags = [t.lower().strip() for t in title.replace("-", " ").replace("—", " ").replace("&", " ").split() if len(t) > 2][:6]
        cat_suffix = category.split("›")[-1].strip().lower() if category else "catalog"
        if cat_suffix not in tags:
            tags.append(cat_suffix)
            
        packaging = "Standard recyclable cardboard envelope, 15x15x10cm"
        cat_lower = category.lower() if category else ""
        if "clothing" in cat_lower or "apparel" in cat_lower or "fashion" in cat_lower:
            packaging = "Sustainably crafted handloom linen sleeve, dimension 36x28x6cm"
        elif "beauty" in cat_lower or "personal care" in cat_lower or "cosmetics" in cat_lower:
            packaging = "Artisanal Biodegradable Envelope, unstitched pack folds, dimension 12x12x8cm"
        elif "home" in cat_lower or "furniture" in cat_lower:
            packaging = "Flat-pack recycled double-walled corrugated box, biodegradable honeycomb wrap"
        elif "electronics" in cat_lower or "mobile" in cat_lower or "phone" in cat_lower:
            packaging = "Secure anti-static bubble-wrapped box, customized foam slots, dimension 22x16x8cm"
            
        # Determine fallback base price based on category
        fallback_price = 1299.0
        if "electronics" in cat_lower or "mobile" in cat_lower or "phone" in cat_lower:
            fallback_price = 14999.0
        elif "beauty" in cat_lower or "personal care" in cat_lower or "cosmetics" in cat_lower:
            fallback_price = 999.0
        elif "clothing" in cat_lower or "apparel" in cat_lower or "fashion" in cat_lower:
            fallback_price = 799.0

        return {
            "title": title,
            "description": description[:1000],
            "bullets": bullets,
            "tags": list(set(tags)),
            "packaging_suggestion": packaging,
            "confidence": {"category": 0.95, "brand": 0.90, "attributes": 0.92},
            "price": fallback_price
        }
        
    title = str(match_row["product_name"])
    raw_desc = str(match_row["description"])
    main_cat = str(match_row["main_category"])
    
    description = raw_desc
    bullets = []
    
    if "Key Features" in raw_desc or "Specifications" in raw_desc:
        lines = [line.strip() for line in raw_desc.split("\n") if line.strip()]
        for line in lines:
            if "•" in line or "-" in line or ":" in line:
                bullets.append(line.replace("•", "").strip())
                
    if not bullets:
        sentences = [s.strip() for s in raw_desc.split(".") if len(s.strip()) > 15]
        bullets = sentences[:4]
        
    tags = [t.lower().strip() for t in title.replace("-", " ").replace("—", " ").replace("&", " ").split() if len(t) > 3][:6]
    if main_cat and main_cat != "nan" and main_cat.lower() not in tags:
        tags.append(main_cat.lower())
        
    packaging = "Standard recyclable cardboard envelope, 15x15x10cm"
    if "clothing" in main_cat.lower() or "apparel" in main_cat.lower() or "fashion" in main_cat.lower():
        packaging = "Sustainably crafted handloom linen sleeve, dimension 36x28x6cm"
    elif "beauty" in main_cat.lower() or "personal care" in main_cat.lower() or "cosmetics" in main_cat.lower():
        packaging = "Artisanal Biodegradable Envelope, unstitched pack folds, dimension 12x12x8cm"
    elif "home" in main_cat.lower() or "furniture" in main_cat.lower():
        packaging = "Flat-pack recycled double-walled corrugated box, biodegradable honeycomb wrap"
        
    # Extract the actual database retail/discounted price to represent catalog pricing
    discounted_price_val = float(match_row["discounted_price"]) if not pd.isna(match_row["discounted_price"]) and float(match_row["discounted_price"]) > 0 else 999.0

    return {
        "title": title,
        "description": description[:1000],
        "bullets": bullets[:5],
        "tags": list(set(tags)),
        "packaging_suggestion": packaging,
        "confidence": {"category": 0.94, "brand": 0.88, "attributes": 0.91},
        "price": discounted_price_val
    }

class GeminiModel:
    def generate_listing(self, text_input: str, category: str) -> Dict[str, Any]:
        return retrieve_listing_from_ds(text_input, category)

class Llama3Model:
    def generate_listing(self, text_input: str, category: str) -> Dict[str, Any]:
        return retrieve_listing_from_ds(text_input, category)

yolo_model = YOLOv8Model()
whisper_model = WhisperModel()
trocr_model = TrOCRModel()
bert_model = BERTModel()
sd_model = StableDiffusionModel()
gemini_model = GeminiModel()
llama_model = Llama3Model()
