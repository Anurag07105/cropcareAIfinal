# backend/routes/explore.py

from fastapi import APIRouter
from pydantic import BaseModel
import os
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
# openai.api_key will be set inside the route handler

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/chat")
def chat_ai(req: ChatRequest):
    try:
        openai.api_key = os.getenv("OPENAI_API_KEY")
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful and knowledgeable agricultural assistant."},
                {"role": "user", "content": req.query}
            ],
            max_tokens=200,
            temperature=0.7
        )
        # Validate response structure
        reply = "AI assistant is currently unavailable. Please try again later."
        if (
            isinstance(response, dict) and
            "choices" in response and
            isinstance(response["choices"], list) and
            len(response["choices"]) > 0 and
            "message" in response["choices"][0] and
            "content" in response["choices"][0]["message"]
        ):
            reply = response["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return {"reply": "AI assistant is currently unavailable. Please try again later."}
    except openai.error.OpenAIError:
        return {"reply": "AI assistant is currently unavailable. Please try again later."}
