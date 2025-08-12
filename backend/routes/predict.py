from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import numpy as np
import io
import tensorflow as tf
import os
import openai
from dotenv import load_dotenv

#load env file
load_dotenv()

# TensorFlow imports
load_model = tf.keras.models.load_model
image = tf.keras.preprocessing.image
preprocess_input = tf.keras.applications.mobilenet_v2.preprocess_input

router = APIRouter()

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "mobilenetv2_cropcare.keras")
MODEL_PATH = os.path.abspath(MODEL_PATH)


# Load the model once at startup
try:
    model = load_model(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Failed to load model from {MODEL_PATH}: {e}")

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
def predict(file: UploadFile = File(...)):
    if not file.filename.endswith((".jpg", ".jpeg", ".png")):
        raise HTTPException(status_code=400, detail="Invalid image format")

    contents = file.file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img = img.resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    predictions = model.predict(img_array)
    class_index = np.argmax(predictions[0])
    confidence = round(float(np.max(predictions[0])) * 100, 2)
    predicted_class = class_names[class_index]

    remedy = get_ai_prescription(predicted_class)

    return {
        "prediction": predicted_class,
        "confidence": confidence,
        "remedy": remedy
    }
# Function to get AI-generated remedy
def get_ai_prescription(disease: str) -> str:
    prompt = f"A farmer's crop is diagnosed with {disease}. Suggest detailed, actionable remedies for this disease."

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert agricultural assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100,
            temperature=0.7
        )
        return response['choices'][0]['message']['content'].strip()
    except Exception as e:
        return "AI assistant unavailable. Please try again later."



# Health check route
@router.get("/health")
def health():
    return {"status": "Backend is running"}



# To run: uvicorn main:app --reload --port 8000