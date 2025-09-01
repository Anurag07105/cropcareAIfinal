# backend/routes/explore.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/chat")
def chat_ai(req: ChatRequest):
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        
        if not api_key:
            print("❌ OpenAI API key not found in environment variables")
            # Return a proper server error
            raise HTTPException(status_code=500, detail="AI service configuration error.")
        
        client = OpenAI(api_key=api_key)
        
        print(f"🚀 Processing AI query: {req.query[:50]}...")
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful and knowledgeable agricultural assistant..."},
                {"role": "user", "content": req.query}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        if response.choices and len(response.choices) > 0:
            # --- THIS IS THE FIX ---
            reply = response.choices[0].message.content.strip()
            # --- END OF FIX ---
            print(f"✅ AI response generated: {reply[:50]}...")
            return {"reply": reply}
        else:
            print("❌ No response from OpenAI")
            raise HTTPException(status_code=503, detail="AI assistant is currently unavailable.")
            
    except Exception as e:
        print(f"❌ AI Error: {str(e)}")
        # Raise an exception so the frontend knows it was a server-side issue
        raise HTTPException(status_code=503, detail="AI assistant is currently unavailable.")

@router.get("/health")
def health_check():
    """Health check endpoint for the explore service"""
    api_key_status = "✅ Set" if os.getenv("OPENAI_API_KEY") else "❌ Missing"
    return {
        "status": "healthy",
        "service": "explore",
        "openai_key": api_key_status
    }