from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.models.db_models import Product, Upload, AIGeneration, MarketplacePreview

router = APIRouter()

@router.get("/")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    # Format to match the front-end structure
    results = []
    for p in products:
        marketplaces = [prev.platform for prev in p.previews if prev.status == "published"]
        results.append({
            "id": p.id,
            "name": p.name,
            "category": p.category or "General",
            "status": p.status,
            "marketplaces": marketplaces,
            "price": p.price,
            "updated": "Just now"
        })
    return results

@router.get("/{product_id}")
def get_product_detail(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    uploads = db.query(Upload).filter(Upload.product_id == product_id).all()
    generation = db.query(AIGeneration).filter(AIGeneration.product_id == product_id).first()
    previews = db.query(MarketplacePreview).filter(MarketplacePreview.product_id == product_id).all()
    
    # Calculate pricing recommendations dynamically based on category/product type
    price = product.price or 1299.0
    cost_price = round(price * 0.42, 2)  # Assume standard cost is ~42% of selling price
    
    from app.api.endpoints.ai import get_pricing_recommendation
    pricing_data = get_pricing_recommendation(product.name, cost_price)
    
    # Generate segment-specific packaging recommendations
    category = product.category or "General › E-Commerce Product"
    cat_lower = category.lower()
    
    packaging_material = "Recycled Kraft Carton"
    packaging_dimensions = "15 × 15 × 10 cm (Box Format)"
    packaging_detail = "Structural dieline matching: standard double-walled folding carton, minimises excess weight."
    
    if "clothing" in cat_lower or "apparel" in cat_lower or "fashion" in cat_lower:
        packaging_material = "Sustainably Crafted Handloom Linen Sleeve"
        packaging_dimensions = "36 × 28 × 6 cm (Flat Sleeve)"
        packaging_detail = "Structural dieline matching: custom linen enclosure sleeves, reducing shipping volume indices."
    elif "beauty" in cat_lower or "personal care" in cat_lower or "cosmetics" in cat_lower:
        packaging_material = "Artisanal Biodegradable Envelope"
        packaging_dimensions = "12 × 12 × 8 cm (Jar Format)"
        packaging_detail = "Structural dieline matching: standard unstitched pack folds, minimizing excess shipping volume fee indices."
    elif "home" in cat_lower or "furniture" in cat_lower:
        packaging_material = "Flat-pack Double-walled Corrugated Box"
        packaging_dimensions = "60 × 40 × 30 cm (Large Box)"
        packaging_detail = "Structural dieline matching: heavy-duty honeycomb interior padding to protect structural edges."
    elif "electronics" in cat_lower or "mobile" in cat_lower or "phone" in cat_lower or "accessories" in cat_lower:
        packaging_material = "Secure Anti-Static Bubble-wrapped Box"
        packaging_dimensions = "22 × 16 × 8 cm (Device Box)"
        packaging_detail = "Structural dieline matching: customized interior foam slots to protect delicate technology circuits."

    return {
        "product": {
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "status": product.status,
            "price": product.price
        },
        "uploads": [{"file_path": u.file_path, "file_type": u.file_type} for u in uploads],
        "generation": {
            "title": generation.title if generation else "",
            "description": generation.description if generation else "",
            "bullets": generation.bullets if generation else [],
            "tags": generation.tags if generation else []
        } if generation else None,
        "previews": [{"platform": prev.platform, "status": prev.status, "data": prev.data} for prev in previews],
        "pricing": {
            "competitor_avg": pricing_data["competitor_average"],
            "recommended_price": pricing_data["recommended_price"],
            "margin": pricing_data["margin"],
            "margin_percent": pricing_data["margin_percent"]
        },
        "packaging": {
            "material": packaging_material,
            "dimensions": packaging_dimensions,
            "detail": packaging_detail
        }
    }
