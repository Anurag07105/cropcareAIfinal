from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from PIL import Image
import numpy as np
import io
import os
import logging
from typing import Optional, Dict, Any, List

import tensorflow as tf
from dotenv import load_dotenv, find_dotenv
from sqlalchemy.orm import Session
from ..database import models, schemas, get_db
from ..auth_utils import get_current_user
from ..llm_provider import get_disease_insights
import uuid

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = Any

# Force load the .env from project root
dotenv_path = find_dotenv()
load_dotenv(dotenv_path=dotenv_path)

# Initialize logger
logger = logging.getLogger(__name__)


# TensorFlow imports
load_model = tf.keras.models.load_model
image = tf.keras.preprocessing.image
preprocess_input = tf.keras.applications.mobilenet_v2.preprocess_input

router = APIRouter()

# --- Model loading configuration ---
DEFAULT_MODEL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "model", "mobilenetv2_cropcare.keras")
)
MODEL_PATH = os.getenv("MODEL_PATH", DEFAULT_MODEL_PATH)

model: Optional[tf.keras.Model] = None


def load_model_safe() -> tf.keras.Model:
    """
    Lazily load the TensorFlow model with robust error handling.
    """
    global model
    if model is not None:
        return model

    try:
        logger.info(f"Attempting to load model from: {MODEL_PATH}")
        loaded_model = load_model(MODEL_PATH)
        model = loaded_model
        logger.info("✅ Model loaded successfully")
        return model
    except Exception as e:
        logger.error(f"❌ Failed to load model from {MODEL_PATH}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Model is not available on the server. Please contact the administrator.",
        )

def get_supabase_client() -> Optional[Any]:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    if not supabase_url or not supabase_key:
        error_msg = f"Supabase credentials not configured (URL: {'Set' if supabase_url else 'Missing'}, KEY: {'Set' if supabase_key else 'Missing'})"
        logger.error(f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)
    
    if creative_client := create_client:
        return creative_client(supabase_url, supabase_key)
    raise HTTPException(status_code=500, detail="Supabase library not installed")


def split_prediction_label(label: str) -> tuple[str, str]:
    if "___" not in label:
        return "Unknown Crop", label.replace("_", " ").strip()

    crop, disease = label.split("___", 1)
    crop_name = crop.replace("_", " ").strip()
    disease_name = disease.replace("_", " ").replace("  ", " ").strip()
    return crop_name, disease_name

class_names = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Blueberry___healthy',
    'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Peach___Bacterial_spot',
    'Peach___healthy',
    'Pepper,_bell___Bacterial_spot',
    'Pepper,_bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

@router.post("/predict")
async def predict_and_store(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    logger.info(f"🔍 Received image for prediction: {file.filename}")

    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Please upload JPG, JPEG, or PNG files.",
        )

    try:
        # 1. Prediction (ML Model)
        model_instance = load_model_safe()
        contents = await file.read()
        
        # Process image for ML
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img_ml = img.resize((224, 224))
        img_array = image.img_to_array(img_ml)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)

        predictions = model_instance.predict(img_array)
        class_index = int(np.argmax(predictions[0]))
        confidence = round(float(np.max(predictions[0])) * 100, 2)
        predicted_class = class_names[class_index]
        crop_name, fallback_disease = split_prediction_label(predicted_class)
        
        logger.info(f"✅ Prediction: {predicted_class} ({confidence}%)")

        # 2. Get Insights (Multi-Provider LLM Orchestrator)
        ai_enrichment = get_disease_insights(predicted_class)

        # 3. Storage (Supabase)
        supabase = get_supabase_client()
        bucket_name = os.getenv("SUPABASE_STORAGE_BUCKET", "crop-images")
        file_ext = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        supabase.storage.from_(bucket_name).upload(
            file=contents,
            path=unique_filename,
            file_options={"content-type": file.content_type}
        )
        public_url = supabase.storage.from_(bucket_name).get_public_url(unique_filename)

        # 4. Save to Database (PostgreSQL)
        db_image = models.CropImage(
            user_id=current_user.id,
            image_url=public_url,
            storage_path=unique_filename,
            crop_name=crop_name,
            disease_name=ai_enrichment.get("name", predicted_class),
            confidence=confidence,
            description=ai_enrichment.get("description"),
            prescription=ai_enrichment.get("prescription"),
            actions=ai_enrichment.get("actions", []),
            raw_class=predicted_class,
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)

        return {
            "id": db_image.id,
            "crop_name": crop_name,
            "name": ai_enrichment.get("name", predicted_class),
            "disease": ai_enrichment.get("name", fallback_disease),
            "confidence": confidence,
            "description": ai_enrichment.get("description"),
            "prescription": ai_enrichment.get("prescription"),
            "recommendation": ai_enrichment.get("prescription"),
            "actions": ai_enrichment.get("actions", []),
            "image_url": public_url,
            "storage_path": unique_filename,
            "raw_class": predicted_class
        }
    except Exception as e:
        logger.exception(f"❌ Prediction/Storage error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Error processing image.")




def humanize_label(label: str) -> str:
    try:
        if "___" in label:
            crop, disease = label.split("___", 1)
            disease = disease.replace("_", " ").replace("  ", " ").strip()
            crop = crop.replace("_", " ").strip()
            return f"{crop} – {disease}"
        return label.replace("_", " ").strip()
    except Exception:
        return label

# Health check route
@router.get("/health")
def health():
    """Health check for prediction service"""
    model_loaded = model is not None

    model_status = "✅ Loaded" if model_loaded else "❌ Not loaded"
    
    return {
        "status": "healthy",
        "service": "prediction_with_multi_llm",
        "model": model_status,
        "providers": "Groq → Gemini → Grok → Ollama → Static DB",
        "classes_available": len(class_names)
    }
