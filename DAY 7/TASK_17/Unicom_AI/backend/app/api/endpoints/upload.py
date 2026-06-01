import os
import uuid
import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.db_models import Product, Upload
from app.schemas.schemas import UploadResponse
from app.core.config import settings

router = APIRouter()

def get_or_create_product(product_id: str, db: Session) -> Product:
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        # Create a new product instance with default name
        prod = Product(
            id=product_id,
            name=f"Generated Product {product_id}",
            category="General",
            status="draft",
            price=0.0
        )
        db.add(prod)
        db.commit()
        db.refresh(prod)
    return prod

def save_uploaded_file(upload_file: UploadFile, subfolder: str) -> str:
    # Safely write the file locally
    filename = f"{uuid.uuid4()}_{upload_file.filename}"
    folder_path = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(folder_path, exist_ok=True)
    
    file_path = os.path.join(folder_path, filename)
    with open(file_path, "wb") as f:
        f.write(upload_file.file.read())
        
    # Return path relative to project root / public path
    return f"uploads/{subfolder}/{filename}"

@router.post("/image", response_model=UploadResponse)
def upload_image(
    product_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    get_or_create_product(product_id, db)
    file_path = save_uploaded_file(file, "images")
    
    upload = Upload(
        product_id=product_id,
        file_path=file_path,
        file_type="image",
        status="uploaded"
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload

@router.post("/video", response_model=UploadResponse)
def upload_video(
    product_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    get_or_create_product(product_id, db)
    file_path = save_uploaded_file(file, "videos")
    
    upload = Upload(
        product_id=product_id,
        file_path=file_path,
        file_type="video",
        status="uploaded"
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload

@router.post("/audio", response_model=UploadResponse)
def upload_audio(
    product_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    get_or_create_product(product_id, db)
    file_path = save_uploaded_file(file, "audio")
    
    upload = Upload(
        product_id=product_id,
        file_path=file_path,
        file_type="audio",
        status="uploaded"
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload

@router.post("/text", response_model=UploadResponse)
def upload_text(
    product_id: str = Form(...),
    text_content: str = Form(...),
    db: Session = Depends(get_db)
):
    prod = get_or_create_product(product_id, db)
    prod.name = text_content[:50]
    db.add(prod)
    
    # Save text as a virtual file path
    upload = Upload(
        product_id=product_id,
        file_path="text_input",
        file_type="text",
        status="parsed"
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload
