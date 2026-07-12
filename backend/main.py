# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os


def configure_logging() -> None:
    log_level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_name, logging.INFO)

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
        handlers=[logging.StreamHandler()],
        force=True,
    )

    logging.getLogger("uvicorn").setLevel(log_level)
    logging.getLogger("uvicorn.access").setLevel(log_level)
    logging.getLogger("uvicorn.error").setLevel(log_level)
    logging.getLogger("uvicorn").propagate = True


configure_logging()
logger = logging.getLogger(__name__)

from .routes import explore, auth, community, help, predict, history

app = FastAPI(
    title="CropCareAI Backend",
    description="Backend API for CropCareAI project - disease detection, community, and AI support",
    version="1.0.0",
)

frontend_origin = os.getenv("FRONTEND_ORIGIN", "https://cropcare-a-ifinal.vercel.app")
additional_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://cropcare-a-ifinal-git-main-anurag07105s-projects.vercel.app",
]

allow_origins = {frontend_origin, *additional_origins}

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allow_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(explore.router, prefix="/explore", tags=["Explore"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(community.router, prefix="/community", tags=["Community"])
app.include_router(help.router, prefix="/help", tags=["Help & Support"])
app.include_router(predict.router, prefix="/predict", tags=["Predict"])
app.include_router(history.router, prefix="/history", tags=["Prediction History"])


@app.on_event("startup")
def run_startup_migrations():
    """Run safe, idempotent migrations on startup."""
    from .database import engine, Base
    from .database import models  # noqa: F401 – registers all models
    from sqlalchemy import text

    # Create any tables that don't exist yet (e.g. likes)
    Base.metadata.create_all(bind=engine)

    # Add supabase_uid column to users table (idempotent)
    with engine.connect() as conn:
        try:
            conn.execute(
                text("ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_uid VARCHAR UNIQUE")
            )
            conn.execute(text("ALTER TABLE crop_images ADD COLUMN IF NOT EXISTS storage_path VARCHAR"))
            conn.execute(text("ALTER TABLE crop_images ADD COLUMN IF NOT EXISTS crop_name VARCHAR"))
            conn.execute(text("ALTER TABLE crop_images ADD COLUMN IF NOT EXISTS description TEXT"))
            conn.execute(text("ALTER TABLE crop_images ADD COLUMN IF NOT EXISTS prescription TEXT"))
            conn.execute(text("ALTER TABLE crop_images ADD COLUMN IF NOT EXISTS actions JSON"))
            conn.execute(text("ALTER TABLE crop_images ADD COLUMN IF NOT EXISTS raw_class VARCHAR"))
            conn.commit()
            logger.info("✅ Startup migrations complete")
        except Exception as e:
            logger.warning(f"Migration note: {e}")


@app.get("/")
def root():
    return {"message": "CropCare AI Backend is running!"}
