import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.database.session import Base, engine
from app.api.endpoints import auth, upload, ai, marketplace, products, admin
from app.utils.websocket_manager import manager

# Auto-create tables on startup (works instantly for SQLite & PostgreSQL)
Base.metadata.create_all(bind=engine)

# Seed database with initial default e-commerce metadata if empty
from app.database.seed import seed_initial_data
from app.database.session import SessionLocal
db_session = SessionLocal()
try:
    seed_initial_data(db_session)
finally:
    db_session.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Unified Multimodal AI Platform for Automated E-Commerce Product Launch",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev sandbox ease
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount public uploads directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount API routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload Services"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Operations"])
app.include_router(marketplace.router, prefix="/api/marketplace", tags=["Marketplace Connect"])
app.include_router(products.router, prefix="/api/products", tags=["Product Catalog"])
app.include_router(admin.router, prefix="/api/admin", tags=["MLOps Administrator"])

# WebSockets Endpoint
@app.websocket("/ws/pipeline")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keeps connection alive and listens for client heartbeats/messages
            data = await websocket.receive_text()
            await websocket.send_text(f"[Echo] Client says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "LaunchOps AI Gateway"}
