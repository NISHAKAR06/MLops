from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role: Optional[str] = "seller"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    price: Optional[float] = 0.0
    status: Optional[str] = "draft"

class ProductCreate(ProductBase):
    id: str

class ProductResponse(ProductBase):
    id: str
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UploadResponse(BaseModel):
    id: int
    product_id: str
    file_path: str
    file_type: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class AIGenerationResponse(BaseModel):
    id: int
    product_id: str
    title: str
    description: str
    bullets: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    confidence_score: Optional[Dict[str, float]] = {}
    created_at: datetime
    
    class Config:
        from_attributes = True

class MarketplacePreviewResponse(BaseModel):
    id: int
    product_id: str
    platform: str
    data: Optional[Dict[str, Any]] = {}
    status: str
    published_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ProcessPayload(BaseModel):
    image_paths: Optional[List[str]] = []
    video_paths: Optional[List[str]] = []
    audio_paths: Optional[List[str]] = []
    text_input: Optional[str] = ""
    product_name: Optional[str] = ""
    short_description: Optional[str] = ""
