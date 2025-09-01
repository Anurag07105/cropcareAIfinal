# backend/routes/help.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import models, schemas, get_db
from typing import List

router = APIRouter(prefix="/help", tags=["Help & Support"])

@router.get("/quick-help")
def get_quick_help():
    return {
        "quick_help": [
            {"id": 1, "title": "Call Support", "description": "+91 1800 123 4567", "action": "tel:+9118001234567", "icon": "phone"},
            {"id": 2, "title": "Email Support", "description": "support@cropcare-ai.com", "action": "mailto:support@cropcare-ai.com", "icon": "email"},
            {"id": 3, "title": "Live Chat", "description": "Chat with our experts", "action": "#", "icon": "chat"},
            {"id": 4, "title": "Video Tutorials", "description": "Watch our guides", "action": "#", "icon": "video"},
        ]
    }

@router.get("/faq", response_model=List[schemas.FAQOut])
def get_faqs(db: Session = Depends(get_db)):
    try:
        faqs = db.query(models.FAQ).all()
        print(f"✅ Retrieved {len(faqs)} FAQs")
        return faqs
    except Exception as e:
        print(f"❌ Error retrieving FAQs: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving FAQs")

@router.post("/contact", response_model=schemas.SupportMessageOut)
def contact_support(message: schemas.SupportMessageCreate, db: Session = Depends(get_db)):
    try:
        new_message = models.SupportMessage(**message.dict())
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        
        # --- FIX ---: Changed `message.subject` to `message.email` which exists in the schema
        print(f"✅ New support message from {message.name} ({message.email})")
        return new_message
    except Exception as e:
        print(f"❌ Error saving support message: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error submitting support message")

@router.get("/messages", response_model=List[schemas.SupportMessageOut])
def get_support_messages(db: Session = Depends(get_db)):
    try:
        messages = db.query(models.SupportMessage).order_by(models.SupportMessage.id.desc()).all()
        print(f"✅ Retrieved {len(messages)} support messages")
        return messages
    except Exception as e:
        print(f"❌ Error retrieving support messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving support messages")

@router.get("/health")
def help_health_check():
    return {"status": "healthy", "service": "help_and_support"}