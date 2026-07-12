"""
Multi-provider LLM system with fallback mechanisms and caching.
Ensures efficient AI generations without depending on a single provider.
"""

import os
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import hashlib
import requests
from dotenv import load_dotenv, find_dotenv

# Load environment variables
dotenv_path = find_dotenv()
load_dotenv(dotenv_path=dotenv_path)

logger = logging.getLogger(__name__)

# ============================================================================
# DISEASE KNOWLEDGE BASE (Static Fallback)
# ============================================================================
DISEASE_DATABASE = {
    "Apple___Apple_scab": {
        "name": "Apple Scab",
        "description": "Apple scab is a fungal disease that affects apple trees and fruits. It causes dark, scaly lesions on leaves, fruits, and twigs. The disease thrives in cool, wet conditions and can significantly reduce fruit quality and yield.",
        "prescription": "Organic: Apply sulfur or neem oil sprays during the dormant season and early growing season. Chemical: Use fungicides like captan or dodine starting at bud break and continue at 7-10 day intervals. Remove infected leaves and maintain good air circulation.",
        "actions": [
            "Remove fallen leaves and infected plant material",
            "Prune to improve air circulation around the tree",
            "Apply preventative fungicide sprays before wet weather",
            "Avoid watering late in the day (keep foliage dry)",
            "Choose resistant apple varieties for future planting",
            "Monitor weather for high-risk conditions (cool + wet)"
        ]
    },
    "Apple___Black_rot": {
        "name": "Apple Black Rot",
        "description": "Black rot is a serious fungal disease causing dark, sunken cankers on branches and black circular lesions on fruits. It can girdle branches and kill them. The disease spreads rapidly in warm, humid conditions.",
        "prescription": "Organic: Prune infected branches and apply sulfur sprays. Chemical: Use copper fungicides or pyraclostrobin-based products. Remove cankers with sterilized tools. Destroy infected fruits immediately.",
        "actions": [
            "Remove infected branches, cutting 6 inches below visible symptoms",
            "Disinfect pruning tools between cuts",
            "Remove all infected fruits from the tree and ground",
            "Clear dead wood and create proper tree structure",
            "Apply dormant oil in winter to kill overwinter spores",
            "Improve tree vigor through proper nutrition"
        ]
    },
    "Tomato___Early_blight": {
        "name": "Tomato Early Blight",
        "description": "Early blight is a fungal disease that affects tomato leaves, starting with brown spots with concentric rings. It typically appears on lower leaves first and progresses upward. High humidity and overhead watering promote disease spread.",
        "prescription": "Organic: Apply copper or sulfur fungicides, remove lower leaves. Chemical: Use mancozeb or chlorothalonil every 7-10 days. Improve air circulation by removing lower foliage (bottom 12 inches). Water at soil level only.",
        "actions": [
            "Remove infected leaves immediately (prune lower 12-18 inches)",
            "Mulch soil to prevent spore splash from soil to leaves",
            "Water only at the base of plants in early morning",
            "Space plants for maximum air circulation",
            "Remove leaves that touch the ground",
            "Apply fungicides before disease appears if conditions are favorable"
        ]
    },
    "Tomato___Late_blight": {
        "name": "Tomato Late Blight",
        "description": "Late blight is a serious disease caused by a water mold that can destroy entire tomato crops quickly. Symptoms appear as water-soaked spots on leaves and stems, with white fungal growth on leaf undersides. It spreads rapidly in cool, wet conditions.",
        "prescription": "Organic: Apply copper fungicides like Bordeaux mixture, remove infected plants. Chemical: Use metalaxyl or mancozeb every 5-7 days in cool weather. Remove entire plants if heavily infected. Ensure good drainage.",
        "actions": [
            "Remove and destroy infected plants immediately (don't compost)",
            "Apply fungicides weekly during cool, wet weather",
            "Improve plant spacing and air circulation",
            "Mulch to prevent soil splash",
            "Remove lower foliage that may contact soil",
            "Use resistant tomato varieties if available"
        ]
    },
    "Potato___Early_blight": {
        "name": "Potato Early Blight",
        "description": "Early blight on potatoes produces brown lesions with concentric rings on leaves and stems. It typically appears when plants are flowering and can cause significant defoliation, reducing tuber yield and quality.",
        "prescription": "Organic: Remove affected leaves, apply copper or sulfur sprays. Chemical: Use carbendazim or chlorothalonil weekly. Ensure good plant spacing and drainage. Remove infected plant material from the field.",
        "actions": [
            "Scout plants regularly and remove infected leaves early",
            "Remove lower leaves as a preventive measure",
            "Maintain optimal plant spacing",
            "Apply mulch to prevent spore splash",
            "Use certified seed potatoes from disease-free sources",
            "Destroy all potato vines after harvest"
        ]
    },
    "Potato___Late_blight": {
        "name": "Potato Late Blight",
        "description": "Late blight is one of the most destructive potato diseases, caused by a water mold. It causes water-soaked spots on leaves and oily rot in tubers. In severe cases, entire crops can be lost in days during cool, wet weather.",
        "prescription": "Organic: Apply Bordeaux mixture (copper sulfate + lime), remove infected plants. Chemical: Use systemic fungicides like metalaxyl-mancozeb combination every 5-7 days. Harvest early to prevent tuber infection.",
        "actions": [
            "Plant certified disease-free seed potatoes",
            "Choose resistant varieties when available",
            "Maintain good plant spacing and drainage",
            "Hill soil around plants to prevent tuber infection",
            "Apply preventative fungicides before symptoms appear",
            "Harvest as soon as possible if infection is detected"
        ]
    },
    "Corn_(maize)___Common_rust_": {
        "name": "Corn Common Rust",
        "description": "Common rust appears as small, reddish-brown pustules on corn leaves, typically on the lower leaf surface. While usually not devastating alone, it can reduce photosynthesis and grain yield, especially if infection is heavy.",
        "prescription": "Organic: None very effective; focus on resistant varieties and crop rotation. Chemical: Use triazole fungicides like tebuconazole if rust appears before pollination and infestation is severe (>5% leaf area).",
        "actions": [
            "Plant rust-resistant corn hybrids",
            "Rotate crops annually to break disease cycle",
            "Remove infected corn residue after harvest",
            "Apply fungicides only if outbreak is severe before pollination",
            "Monitor weather: warm + high humidity = high risk",
            "Destroy volunteer corn plants from previous crops"
        ]
    },
    "Tomato___Leaf_Mold": {
        "name": "Tomato Leaf Mold",
        "description": "Leaf mold causes yellow blotches on upper leaf surfaces and thin gray fungal growth on lower surfaces. It thrives in warm, humid conditions with poor air circulation, commonly found in greenhouses.",
        "prescription": "Organic: Improve ventilation, remove infected leaves, apply sulfur. Chemical: Use chlorothalonil or difenconazole fungicides. Reduce humidity by ventilating in morning hours.",
        "actions": [
            "Improve air circulation with fans or better spacing",
            "Ventilate greenhouses in morning to reduce humidity",
            "Remove infected leaves promptly",
            "Avoid overhead watering (use drip irrigation)",
            "Apply sulfur or fungicides at first sign of disease",
            "Sterilize greenhouse and equipment between seasons"
        ]
    },
    "apple___healthy": {
        "name": "Apple Healthy",
        "description": "Your apple plant appears to be in good health with no visible signs of disease.",
        "prescription": "Continue with regular maintenance including proper pruning, fertilization, and disease prevention practices. Remove dead or damaged wood.",
        "actions": [
            "Maintain regular watering schedule",
            "Apply balanced fertilizer in spring",
            "Monitor for any signs of pest or disease damage",
            "Prune in winter for proper tree structure",
            "Maintain good air circulation through selective pruning",
            "Consider preventative fungicide spray if conditions favor disease"
        ]
    },
    "tomato___healthy": {
        "name": "Tomato Healthy",
        "description": "Your tomato plant appears to be in excellent health with no visible signs of disease or pest damage.",
        "prescription": "Continue with regular monitoring, watering, and nutrient feeding. Ensure proper support structures and pruning for optimal growth.",
        "actions": [
            "Water consistently at soil level (1-2 inches per week)",
            "Prune suckers to maintain 1-2 main stems",
            "Provide proper support with stakes or cages",
            "Monitor for early signs of pests or disease weekly",
            "Apply balanced, phosphorus-rich fertilizer weekly during fruiting",
            "Harvest ripe fruits regularly to encourage continued production"
        ]
    },
    "potato___healthy": {
        "name": "Potato Healthy",
        "description": "Your potato plants are growing well with no signs of disease. They appear to be developing healthy foliage.",
        "prescription": "Maintain regular watering and monitoring. Continue current management practices. Prepare for harvest when foliage begins to die back.",
        "actions": [
            "Maintain consistent soil moisture",
            "Hill soil around plants as they grow",
            "Harvest when foliage dies back (80-90 days from planting)",
            "Store harvested potatoes in cool, dark place",
            "Scout weekly for any signs of disease or pests",
            "Consider crop rotation for next season"
        ]
    }
}


class LLMCache:
    """Simple in-memory cache for LLM responses."""
    
    def __init__(self, ttl_hours: int = 24):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.ttl = timedelta(hours=ttl_hours)
    
    def get_key(self, disease: str) -> str:
        """Generate cache key from disease name."""
        return hashlib.md5(disease.lower().encode()).hexdigest()
    
    def get(self, disease: str) -> Optional[Dict[str, Any]]:
        """Retrieve cached result if exists and not expired."""
        key = self.get_key(disease)
        if key in self.cache:
            cached = self.cache[key]
            if datetime.now() - cached["timestamp"] < self.ttl:
                logger.info(f"✅ Cache hit for: {disease}")
                return cached["data"]
            else:
                del self.cache[key]
        return None
    
    def set(self, disease: str, data: Dict[str, Any]) -> None:
        """Store result in cache."""
        key = self.get_key(disease)
        self.cache[key] = {
            "data": data,
            "timestamp": datetime.now()
        }


# Global cache instance
llm_cache = LLMCache()


# ============================================================================
# LLM PROVIDERS
# ============================================================================

class GeminiProvider:
    """Gemini provider via Google Generative Language API."""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = os.getenv("GEMINI_MODEL")
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        
    def is_configured(self) -> bool:
        return bool(self.api_key)
        
    def generate(self, disease: str) -> Optional[Dict[str, Any]]:
        """Generate response using Gemini API."""
        if not self.is_configured():
            return None
            
        try:
            prompt = self._build_prompt(disease)
            
            headers = {
                "Content-Type": "application/json"
            }
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.5
                },
                "systemInstruction": {
                    "parts": [
                        {"text": "You are an expert agricultural assistant. Return ONLY valid JSON."}
                    ]
                }
            }
            
            response = requests.post(
                f"{self.base_url}?key={self.api_key}",
                headers=headers,
                json=payload,
                timeout=15
            )
            
            if response.status_code == 200:
                resp_json = response.json()
                try:
                    text = resp_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                    return self._parse_response(text, disease)
                except (KeyError, IndexError) as e:
                    logger.error(f"Failed to parse Gemini JSON structure: {e}. Raw: {resp_json}")
                    return None
            else:
                logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            logger.error(f"Gemini provider error: {e}")
            return None
            
    @staticmethod
    def _build_prompt(disease: str) -> str:
        return f"""You are an expert agricultural assistant specializing in crop disease management.

Disease label: "{disease}"

1. Provide a clear, farmer-friendly disease name.
2. In 3-5 sentences, describe what this disease is and how it affects the plant.
3. Provide a concise prescription with both organic and chemical treatment options.
4. Provide 3-6 actionable bullet-point recommendations.

Return ONLY valid JSON with keys: name, description, prescription, actions (array)"""

    @staticmethod
    def _parse_response(text: str, disease: str) -> Optional[Dict[str, Any]]:
        """Parse Gemini response."""
        try:
            import json
            # Remove markdown code block formatting if present
            clean_text = text
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            elif clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            clean_text = clean_text.strip()
            
            data = json.loads(clean_text)
            return {
                "name": data.get("name", disease),
                "description": data.get("description", ""),
                "prescription": data.get("prescription", ""),
                "actions": data.get("actions", [])
            }
        except Exception as e:
            logger.error(f"Error parsing Gemini text as JSON: {e}. Text: {text}")
            return None


class GrokProvider:
    """Grok provider (xAI)."""
    
    def __init__(self):
        self.grok_key = os.getenv("GROK_API_KEY")
        self.model = os.getenv("GROK_MODEL")
    
    def is_configured(self) -> bool:
        return bool(self.grok_key)
    
    def generate(self, disease: str) -> Optional[Dict[str, Any]]:
        """Generate response using Grok API."""
        if not self.is_configured():
            return None
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.grok_key, base_url="https://api.x.ai/v1")
            
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert agricultural assistant. Return ONLY valid JSON."},
                    {"role": "user", "content": self._build_prompt(disease)}
                ],
                temperature=0.7,
                max_tokens=1024
            )
            
            text = response.choices[0].message.content or ""
            return self._parse_response(text, disease)
        except Exception as e:
            logger.error(f"Grok error: {e}")
            return None
            
    @staticmethod
    def _build_prompt(disease: str) -> str:
        return f"""You are an expert agricultural assistant specializing in crop disease management.

Disease label: "{disease}"

1. Provide a clear, farmer-friendly disease name.
2. In 3-5 sentences, describe what this disease is and how it affects the plant.
3. Provide a concise prescription with both organic and chemical treatment options.
4. Provide 3-6 actionable bullet-point recommendations.

Return ONLY valid JSON with keys: name, description, prescription, actions (array)"""

    @staticmethod
    def _parse_response(text: str, disease: str) -> Optional[Dict[str, Any]]:
        """Parse response."""
        try:
            import json
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                data = json.loads(text[start:end+1])
                return {
                    "name": data.get("name", disease),
                    "description": data.get("description", ""),
                    "prescription": data.get("prescription", ""),
                    "actions": data.get("actions", [])
                }
        except:
            pass
        return None


class GroqProvider:
    """Groq Cloud provider (free tier available)."""
    
    def __init__(self):
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL")
    
    def is_configured(self) -> bool:
        return bool(self.groq_key)
    
    def generate(self, disease: str) -> Optional[Dict[str, Any]]:
        """Generate response using Groq Cloud."""
        if not self.is_configured():
            return None
        try:
            from groq import Groq
            client = Groq(api_key=self.groq_key)
            
            logger.info(f"Using Groq model: {self.model}")
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert agricultural assistant. Return ONLY valid JSON."},
                    {"role": "user", "content": self._build_prompt(disease)}
                ],
                temperature=0.7,
                max_tokens=1024
            )
            
            text = response.choices[0].message.content or ""
            return self._parse_response(text, disease)
        except Exception as e:
            logger.error(f"Groq error: {e}")
            return None
            
    @staticmethod
    def _build_prompt(disease: str) -> str:
        return f"""You are an expert agricultural assistant specializing in crop disease management.

Disease label: "{disease}"

1. Provide a clear, farmer-friendly disease name.
2. In 3-5 sentences, describe what this disease is and how it affects the plant.
3. Provide a concise prescription with both organic and chemical treatment options.
4. Provide 3-6 actionable bullet-point recommendations.

Return ONLY valid JSON with keys: name, description, prescription, actions (array)"""

    @staticmethod
    def _parse_response(text: str, disease: str) -> Optional[Dict[str, Any]]:
        """Parse response."""
        try:
            import json
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                data = json.loads(text[start:end+1])
                return {
                    "name": data.get("name", disease),
                    "description": data.get("description", ""),
                    "prescription": data.get("prescription", ""),
                    "actions": data.get("actions", [])
                }
        except:
            pass
        return None


class OllamaProvider:
    """Local Ollama LLM (free, no API key required)."""
    
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL")
    
    def is_configured(self) -> bool:
        """Check if Ollama is running."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=2)
            return response.status_code == 200
        except:
            return False
    
    def generate(self, disease: str) -> Optional[Dict[str, Any]]:
        """Generate response using local Ollama."""
        try:
            payload = {
                "model": self.model,  # Or mistral, llama2, etc.
                "prompt": self._build_prompt(disease),
                "stream": False,
                "temperature": 0.5
            }
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                text = response.json()["response"]
                return self._parse_response(text, disease)
            return None
        except Exception as e:
            logger.warning(f"Ollama error: {e}")
            return None
    
    @staticmethod
    def _build_prompt(disease: str) -> str:
        return f"""Extract JSON data for disease: {disease}
Provide: {{"name": "...", "description": "...", "prescription": "...", "actions": [...]}}"""
    
    @staticmethod
    def _parse_response(text: str, disease: str) -> Optional[Dict[str, Any]]:
        """Parse response."""
        try:
            import json
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                data = json.loads(text[start:end+1])
                return {
                    "name": data.get("name", disease),
                    "description": data.get("description", ""),
                    "prescription": data.get("prescription", ""),
                    "actions": data.get("actions", [])
                }
        except:
            pass
        return None


# ============================================================================
# MAIN LLM ORCHESTRATOR
# ============================================================================

class LLMOrchestrator:
    """
    Multi-provider LLM system with intelligent fallback.
    Tries providers in order: Cache → Groq → Gemini → Grok → Ollama → Static DB
    """
    
    def __init__(self):
        # Fallback order: Groq -> Gemini -> Grok -> Ollama
        self.providers = [
            GroqProvider(),
            GeminiProvider(),
            GrokProvider(),
            OllamaProvider(),
        ]
    
    def get_disease_insights(self, disease: str) -> Dict[str, Any]:
        """
        Get disease insights with intelligent fallback chain.
        """
        logger.info(f"🔄 Getting insights for: {disease}")
        
        # 1. Try cache
        cached = llm_cache.get(disease)
        if cached:
            return cached
        
        # 2. Try each provider in order
        for provider in self.providers:
            if provider.is_configured():
                logger.info(f"📡 Trying {provider.__class__.__name__}...")
                result = provider.generate(disease)
                if result:
                    llm_cache.set(disease, result)
                    logger.info(f"✅ Success with {provider.__class__.__name__}")
                    return result
        
        # 3. Fall back to static database
        logger.warning(f"⚠️ All API providers failed, using static database")
        return self._get_static_response(disease)
    
    @staticmethod
    def _get_static_response(disease: str) -> Dict[str, Any]:
        """Get response from static disease database."""
        # Normalize disease name
        normalized = disease.lower().strip()
        
        # Try exact match
        if normalized in [d.lower() for d in DISEASE_DATABASE.keys()]:
            for key in DISEASE_DATABASE.keys():
                if key.lower() == normalized:
                    return DISEASE_DATABASE[key]
        
        # Try partial match
        search_terms = disease.lower().split("_")
        for db_key, db_value in DISEASE_DATABASE.items():
            db_terms = db_key.lower().split("_")
            if any(term in db_terms for term in search_terms):
                logger.info(f"📚 Partial match: {disease} → {db_key}")
                return db_value
        
        # Default fallback
        logger.warning(f"❌ No match found for: {disease}")
        return {
            "name": disease.replace("_", " "),
            "description": f"Detected plant condition: {disease}. Please consult with agricultural experts for professional diagnosis and treatment.",
            "prescription": "Consult with local agricultural extension services for region-specific treatment recommendations.",
            "actions": [
                "Monitor the affected plants closely",
                "Document symptoms for professional consultation",
                "Isolate affected plants if possible",
                "Maintain good plant hygiene",
                "Seek advice from agricultural experts",
                "Avoid spreading to other plants"
            ]
        }


# Global orchestrator instance
orchestrator = LLMOrchestrator()


def get_disease_insights(disease: str) -> Dict[str, Any]:
    """Public function to get disease insights."""
    return orchestrator.get_disease_insights(disease)
