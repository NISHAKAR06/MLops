import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LaunchOps AI Backend"
    API_V1_STR: str = "/api"
    
    # Secret keys
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkeyforlaunchopsaiproductiongrade123!#%")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # DB URL - Fallback to SQLite if PostgreSQL not specified
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./launchops.db")
    
    # Upload paths
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    
    class Config:
        case_sensitive = True

settings = Settings()

# Ensure upload folders exist
for folder in ["images", "videos", "audio"]:
    os.makedirs(os.path.join(settings.UPLOAD_DIR, folder), exist_ok=True)
