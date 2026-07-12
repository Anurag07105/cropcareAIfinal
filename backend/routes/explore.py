# backend/routes/explore.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
import os
import logging
import hashlib
from datetime import datetime, timedelta
from dotenv import load_dotenv
from openai import OpenAI
import requests
from ..auth_utils import get_current_user

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter()

# Response cache for chat queries
CHAT_RESPONSE_CACHE = {}
CACHE_TTL = 3600  # 1 hour


class ChatRequest(BaseModel):
    query: str


def get_cache_key(query: str) -> str:
    """Generate a cache key from the query"""
    return hashlib.md5(query.lower().encode()).hexdigest()


def cache_response(query: str, response: str):
    """Cache the response"""
    cache_key = get_cache_key(query)
    CHAT_RESPONSE_CACHE[cache_key] = {
        "response": response,
        "timestamp": datetime.now(),
    }


def get_cached_response(query: str) -> str | None:
    """Get cached response if available and not expired"""
    cache_key = get_cache_key(query)
    if cache_key in CHAT_RESPONSE_CACHE:
        cache_entry = CHAT_RESPONSE_CACHE[cache_key]
        if datetime.now() - cache_entry["timestamp"] < timedelta(seconds=CACHE_TTL):
            logger.info("📦 Using cached chat response")
            return cache_entry["response"]
        else:
            del CHAT_RESPONSE_CACHE[cache_key]
    return None


def try_gemini(query: str) -> str | None:
    """Try Gemini API (Google Generative AI)"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("⚠️ GEMINI_API_KEY not set")
        return None

    try:
        logger.info("🔄 Trying Gemini API for chat...")
        model = os.getenv("GEMINI_MODEL")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": query}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7
            },
            "systemInstruction": {
                "parts": [
                    {"text": "You are a helpful agricultural assistant. Answer clearly and concisely for a farmer audience. Avoid mentioning you are an AI."}
                ]
            }
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        if response.status_code == 200:
            resp_json = response.json()
            try:
                reply = resp_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                logger.info("✅ Gemini API successful for chat")
                return reply
            except (KeyError, IndexError) as e:
                logger.warning(f"⚠️ Failed to parse Gemini response: {e}")
                return None
        else:
            logger.warning(f"⚠️ Gemini API failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.warning(f"⚠️ Gemini failed: {e}")
        return None


def try_grok(query: str) -> str | None:
    """Try Grok API (xAI)"""
    api_key = os.getenv("GROK_API_KEY")
    if not api_key:
        logger.warning("⚠️ GROK_API_KEY not set")
        return None

    try:
        logger.info("🔄 Trying Grok API for chat...")
        client = OpenAI(api_key=api_key, base_url="https://api.x.ai/v1")
        model = os.getenv("GROK_MODEL")
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful agricultural assistant. Answer clearly and concisely for a farmer audience. Avoid mentioning you are an AI."},
                {"role": "user", "content": query}
            ],
            temperature=0.7,
            max_tokens=1024
        )
        reply = response.choices[0].message.content.strip()
        logger.info("✅ Grok API successful for chat")
        return reply
    except Exception as e:
        logger.warning(f"⚠️ Grok failed: {e}")
        return None


def try_ollama(query: str) -> str | None:
    """Try Ollama (Local LLM - Free Fallback 1)"""
    try:
        logger.info("🔄 Trying Ollama (local) for chat...")
        model = os.getenv("OLLAMA_MODEL")
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model,
                "prompt": f"You are an agricultural assistant. Answer this question concisely: {query}",
                "stream": False,
                "temperature": 0.7,
            },
            timeout=30
        )
        if response.status_code == 200:
            reply = response.json().get("response", "").strip()
            if reply:
                logger.info("✅ Ollama successful for chat")
                return reply
    except Exception as e:
        logger.warning(f"⚠️ Ollama failed: {e}")
    return None


def try_groq_cloud(query: str) -> str | None:
    """Try Groq Cloud (Free tier - Fallback 2)"""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.warning("⚠️ GROQ_API_KEY not set")
        return None

    try:
        logger.info("🔄 Trying Groq Cloud for chat...")
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1"
        )
        model = os.getenv("GROQ_MODEL")
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an agricultural assistant. Answer concisely for a farmer audience."},
                {"role": "user", "content": query}
            ],
            temperature=0.7,
            max_tokens=1024
        )
        reply = response.choices[0].message.content.strip()
        logger.info("✅ Groq Cloud successful for chat")
        return reply
    except Exception as e:
        logger.warning(f"⚠️ Groq Cloud failed: {e}")
        return None


def fallback_rule_based(query: str) -> str:
    """Rule-based fallback for common agricultural questions"""
    query_lower = query.lower()
    
    # Common agricultural questions and responses
    responses = {
        "water": "🌾 For crops: Water deeply 1-2 times per week. Morning watering is best to prevent diseases. Check soil moisture at 2-3 inches depth.",
        "disease": "🌾 Common solutions: Remove affected plants, improve air circulation, avoid overhead watering, use organic fungicides if needed.",
        "pest": "🌾 Try: Neem oil spray, companion planting (marigolds), hand-picking, or introduce natural predators.",
        "soil": "🌾 Test soil pH and nutrients annually. Add compost yearly for healthy soil structure.",
        "fertilizer": "🌾 Use balanced NPK (10-10-10) for general crops. Apply during growing season. Follow package instructions.",
        "harvest": "🌾 Harvest when crops reach proper size/color. Pick in early morning for best quality.",
    }
    
    for keyword, response in responses.items():
        if keyword in query_lower:
            return response
    
    return "🌾 I'm experiencing technical difficulties. For agricultural help, contact your local agricultural extension office or farming cooperative."


@router.post("/chat")
def chat_ai(req: ChatRequest, _current_user=Depends(get_current_user)):
    """Multi-provider chat endpoint with fallback system (authenticated)"""
    
    try:
        # Check cache first
        cached = get_cached_response(req.query)
        if cached:
            return {"reply": cached}
        
        logger.info(f"🚀 Processing chat query: {req.query[:60]}...")
        
        # Try providers in priority order (Groq -> Gemini -> Grok -> Ollama)
        reply = (
            try_groq_cloud(req.query) or
            try_gemini(req.query) or
            try_grok(req.query) or
            try_ollama(req.query) or
            fallback_rule_based(req.query)
        )
        
        # Cache the response
        cache_response(req.query, reply)
        
        logger.info(f"✅ Chat response generated")
        return {"reply": reply}
        
    except Exception as e:
        logger.exception(f"❌ Unexpected error in chat: {e}")
        fallback = fallback_rule_based(req.query)
        return {"reply": fallback}


@router.get("/health")
def health_check():
    """Health check endpoint with provider status"""
    groq_status = "✅" if os.getenv("GROQ_API_KEY") else "❌"
    gemini_status = "✅" if os.getenv("GEMINI_API_KEY") else "❌"
    grok_status = "✅" if os.getenv("GROK_API_KEY") else "❌"
    
    return {
        "status": "healthy",
        "service": "explore",
        "llm_providers": {
            "groq": groq_status,
            "gemini": gemini_status,
            "grok": grok_status,
            "ollama": "⚓ Local",
            "fallback": "✅ Always available"
        }
    }