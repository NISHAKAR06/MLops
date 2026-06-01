from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.db_models import User, ModelRegistry, MLOpsActivity

router = APIRouter()

@router.get("/users")
def get_sellers(db: Session = Depends(get_db)):
    sellers = db.query(User).filter(User.role == "seller").all()
    # Format matching the frontend expectations
    results = []
    for s in sellers:
        # Standard seeded metrics
        results.append({
            "id": f"S-{s.id + 2000}",
            "name": s.name or "Artisan Seller",
            "store": "Mitti Crafts" if s.name == "Anika Sharma" else "Independent Weaver",
            "plan": "Pro",
            "products": 142 if s.name == "Anika Sharma" else 23,
            "status": "active",
            "joined": "Mar 2025"
        })
    return results

@router.get("/models")
def get_registered_models(db: Session = Depends(get_db)):
    models = db.query(ModelRegistry).all()
    return [{
        "name": m.name,
        "version": m.version,
        "framework": m.framework,
        "accuracy": m.accuracy,
        "latency": m.latency,
        "status": m.status,
        "lastTrained": m.last_trained,
        "run": m.run
    } for m in models]

@router.get("/activity")
def get_mlops_activity(db: Session = Depends(get_db)):
    activities = db.query(MLOpsActivity).order_by(MLOpsActivity.id.desc()).all()
    return [{
        "text": a.text,
        "kind": a.kind,
        "time": a.time
    } for a in activities]
