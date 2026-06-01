import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.db_models import Product, MarketplacePreview

router = APIRouter()

@router.post("/preview")
def get_marketplace_preview(product_id: str, platform: str, db: Session = Depends(get_db)):
    # Create or update marketplace preview data
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
        
    preview_data = {
        "title": prod.name,
        "category": prod.category,
        "price": prod.price,
        "bullet_points": ["Pure organic threads", "Traditional stamp block printed"]
    }
    
    existing = db.query(MarketplacePreview).filter(
        MarketplacePreview.product_id == product_id,
        MarketplacePreview.platform == platform
    ).first()
    
    if not existing:
        existing = MarketplacePreview(
            product_id=product_id,
            platform=platform,
            data=preview_data,
            status="draft"
        )
        db.add(existing)
        db.commit()
        db.refresh(existing)
        
    return existing

@router.post("/publish")
def publish_to_marketplace(product_id: str, platform: str, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Update product status to published
    prod.status = "published"
    
    existing = db.query(MarketplacePreview).filter(
        MarketplacePreview.product_id == product_id,
        MarketplacePreview.platform == platform
    ).first()
    
    if not existing:
        existing = MarketplacePreview(
            product_id=product_id,
            platform=platform,
            data={"title": prod.name, "price": prod.price},
            status="published",
            published_at=datetime.datetime.utcnow()
        )
        db.add(existing)
    else:
        existing.status = "published"
        existing.published_at = datetime.datetime.utcnow()
        
    db.commit()
    return {"message": f"Successfully published {product_id} to {platform}!"}
