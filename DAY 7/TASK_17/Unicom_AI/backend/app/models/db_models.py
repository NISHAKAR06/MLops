import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    role = Column(String, default="seller")  # seller, admin, mlops
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, index=True) # E.g. P-10242
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, nullable=True)
    status = Column(String, default="draft")  # draft, generated, published
    price = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    uploads = relationship("Upload", back_populates="product", cascade="all, delete-orphan")
    ai_generations = relationship("AIGeneration", back_populates="product", cascade="all, delete-orphan")
    previews = relationship("MarketplacePreview", back_populates="product", cascade="all, delete-orphan")

class Upload(Base):
    __tablename__ = "uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # image, video, audio, text
    status = Column(String, default="uploaded")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    product = relationship("Product", back_populates="uploads")

class AIGeneration(Base):
    __tablename__ = "ai_generations"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    title = Column(String, nullable=True)
    description = Column(String, nullable=True)
    bullets = Column(JSON, nullable=True)
    tags = Column(JSON, nullable=True)
    confidence_score = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    product = relationship("Product", back_populates="ai_generations")

class MarketplacePreview(Base):
    __tablename__ = "marketplace_previews"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    platform = Column(String, nullable=False)  # Amazon, Flipkart, Meesho
    data = Column(JSON, nullable=True)
    status = Column(String, default="draft")  # draft, published
    published_at = Column(DateTime, nullable=True)
    
    product = relationship("Product", back_populates="previews")

class ModelRegistry(Base):
    __tablename__ = "model_registries"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    framework = Column(String, nullable=False)
    accuracy = Column(Float, nullable=False)
    latency = Column(Integer, nullable=False)
    status = Column(String, nullable=False)  # healthy, drift
    run = Column(String, nullable=False)
    last_trained = Column(String, nullable=False)

class MLOpsActivity(Base):
    __tablename__ = "mlops_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    kind = Column(String, nullable=False)  # warn, info, ok
    time = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
