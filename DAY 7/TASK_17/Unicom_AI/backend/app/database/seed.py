import datetime
from sqlalchemy.orm import Session
from app.models.db_models import User, Product, Upload, AIGeneration, MarketplacePreview, ModelRegistry, MLOpsActivity
from app.core.security import get_password_hash

def seed_initial_data(db: Session):
    # Check if database is already seeded by checking for existing users
    if db.query(User).first() is not None:
        print("[Database Seed] Data already seeded. Skipping initialization.")
        return
        
    print("[Database Seed] Seeding fresh MLOps catalog relational structures...")

    # 1. Create Default Users
    admin_user = User(
        email="admin@launchops.ai",
        hashed_password=get_password_hash("adminpassword123"),
        name="Admin Chief",
        role="admin"
    )
    seller_user = User(
        email="seller@store.com",
        hashed_password=get_password_hash("sellerpassword123"),
        name="Anika Sharma",
        role="seller"
    )
    mlops_user = User(
        email="mlops@launchops.ai",
        hashed_password=get_password_hash("mlopspassword123"),
        name="Rohan Verma",
        role="mlops"
    )
    db.add_all([admin_user, seller_user, mlops_user])
    db.flush() # Gain IDs

    # Catalog starts empty for real integrations.
    print("[Database Seed] Catalog started empty.")

    # 6. Add Model Fleet Registries (7 models from mock data)
    db.add_all([
        ModelRegistry(name="YOLOv8 — Product Detection", version="v3.2.1", framework="Ultralytics", accuracy=0.942, latency=38, status="healthy", run="mlf-9af21", last_trained="2d ago"),
        ModelRegistry(name="Whisper Large — Voice Input", version="v3.0", framework="OpenAI", accuracy=0.961, latency=412, status="healthy", run="mlf-9af18", last_trained="11d ago"),
        ModelRegistry(name="BERT — Category Classifier", version="v2.4.0", framework="HuggingFace", accuracy=0.918, latency=22, status="healthy", run="mlf-9af22", last_trained="1d ago"),
        ModelRegistry(name="Llama-3 8B — Description LLM", version="v1.6", framework="Meta", accuracy=0.887, latency=640, status="drift", run="mlf-9af14", last_trained="9d ago"),
        ModelRegistry(name="Gemini Pro — SEO Optimizer", version="1.5-pro", framework="Google", accuracy=0.933, latency=510, status="healthy", run="mlf-9af09", last_trained="—"),
        ModelRegistry(name="TrOCR — Text Extraction", version="v1.2", framework="Microsoft", accuracy=0.902, latency=120, status="healthy", run="mlf-9af04", last_trained="5d ago"),
        ModelRegistry(name="Stable Diffusion XL — Visuals", version="v1.0", framework="Stability AI", accuracy=0.0, latency=2300, status="healthy", run="mlf-9aee9", last_trained="21d ago")
    ])

    # 7. Add MLOps Activity alerts (6 activities from mock data)
    db.add_all([
        MLOpsActivity(text="Llama-3 description model crossed drift threshold (0.07)", kind="warn", time="2 min ago"),
        MLOpsActivity(text="Retraining job mlf-9af23 completed for BERT classifier", kind="info", time="14 min ago"),
        MLOpsActivity(text="Seller Mitti Crafts published 24 new listings", kind="info", time="1 h ago"),
        MLOpsActivity(text="Stable Diffusion XL — inference latency p95 = 2.4s", kind="info", time="3 h ago"),
        MLOpsActivity(text="GitHub Actions: deploy/prod #482 succeeded", kind="ok", time="6 h ago"),
        MLOpsActivity(text="Drift alert auto-resolved for Whisper", kind="ok", time="9 h ago")
    ])

    db.commit()
    print("[Database Seed] Seeding transaction completed successfully. Active catalog generated.")
