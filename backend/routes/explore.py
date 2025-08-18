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
        # Get API key from environment
        api_key = os.getenv("OPENAI_API_KEY")
        
        if not api_key:
            print("❌ OpenAI API key not found in environment variables")
            return {"reply": "AI service configuration error. Please contact support."}
        
        # Initialize OpenAI client with new API
        client = OpenAI(api_key=api_key)
        
        print(f"🚀 Processing AI query: {req.query[:50]}...")
        
        # Make API call with new syntax
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful and knowledgeable agricultural assistant specializing in crop diseases and farming solutions."},
                {"role": "user", "content": req.query}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        # Extract response with new API structure
        if response.choices and len(response.choices) > 0:
            reply = response.choices[0].message.content.strip()
            print(f"✅ AI response generated: {reply[:50]}...")
            return {"reply": reply}
        else:
            print("❌ No response from OpenAI")
            return {"reply": "AI assistant is currently unavailable. Please try again later."}
            
    except Exception as e:
        print(f"❌ AI Error: {str(e)}")
        return {"reply": "AI assistant is currently unavailable. Please try again later."}

@router.get("/health")
def health_check():
    """Health check endpoint for the explore service"""
    api_key_status = "✅ Set" if os.getenv("OPENAI_API_KEY") else "❌ Missing"
    return {
        "status": "healthy",
        "service": "explore",
        "openai_key": api_key_status
    }