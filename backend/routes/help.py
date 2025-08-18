# backend/routes/help.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import models, schemas
from ..database import get_db
from typing import List

router = APIRouter(
    prefix="/help",
    tags=["Help & Support"]
)

# Static Quick Help Options
@router.get("/quick-help")
def get_quick_help():
    """Get quick help options for users"""
    return {
        "quick_help": [
            {
                "id": 1,
                "title": "Call Support", 
                "description": "+91 1800 123 4567", 
                "action": "tel:+9118001234567",
                "icon": "phone"
            },
            {
                "id": 2,
                "title": "Email Support", 
                "description": "support@cropcare-ai.com", 
                "action": "mailto:support@cropcare-ai.com",
                "icon": "email"
            },
            {
                "id": 3,
                "title": "Live Chat", 
                "description": "Chat with our experts", 
                "action": "#",
                "icon": "chat"
            },
            {
                "id": 4,
                "title": "Video Tutorials", 
                "description": "Watch how-to videos", 
                "action": "#",
                "icon": "video"
            },
            {
                "id": 5,
                "title": "Documentation", 
                "description": "Read detailed guides", 
                "action": "#",
                "icon": "book"
            },
            {
                "id": 6,
                "title": "User Guide", 
                "description": "Download user manual", 
                "action": "#",
                "icon": "download"
            }
        ]
    }

# Get FAQs
@router.get("/faqs", response_model=List[schemas.FAQOut])
def get_faqs(db: Session = Depends(get_db)):
    """Get all frequently asked questions"""
    try:
        faqs = db.query(models.FAQ).order_by(models.FAQ.id).all()
        print(f"✅ Retrieved {len(faqs)} FAQs")
        return faqs
    except Exception as e:
        print(f"❌ Error retrieving FAQs: {str(e)}")
        # Return default FAQs if database is not available
        return [
            {
                "id": 1,
                "question": "How do I upload an image for disease detection?",
                "answer": "Click on the 'Upload Image' button in the Predict section and select a clear photo of your crop."
            },
            {
                "id": 2,
                "question": "What image formats are supported?",
                "answer": "We support JPG, JPEG, and PNG image formats."
            },
            {
                "id": 3,
                "question": "How accurate is the disease detection?",
                "answer": "Our AI model has been trained on thousands of crop images and provides high accuracy results."
            }
        ]

# Create FAQ (admin use)
@router.post("/faqs", response_model=schemas.FAQOut)
def create_faq(faq: schemas.FAQCreate, db: Session = Depends(get_db)):
    """Create a new FAQ entry (admin only)"""
    try:
        new_faq = models.FAQ(**faq.dict())
        db.add(new_faq)
        db.commit()
        db.refresh(new_faq)
        
        print(f"✅ Created new FAQ: {faq.question}")
        return new_faq
    except Exception as e:
        print(f"❌ Error creating FAQ: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error creating FAQ")

# Update FAQ
@router.put("/faqs/{faq_id}", response_model=schemas.FAQOut)
def update_faq(faq_id: int, faq: schemas.FAQCreate, db: Session = Depends(get_db)):
    """Update an existing FAQ"""
    db_faq = db.query(models.FAQ).filter(models.FAQ.id == faq_id).first()
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    try:
        for key, value in faq.dict().items():
            setattr(db_faq, key, value)
        
        db.commit()
        db.refresh(db_faq)
        
        print(f"✅ Updated FAQ {faq_id}")
        return db_faq
    except Exception as e:
        print(f"❌ Error updating FAQ: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error updating FAQ")

# Delete FAQ
@router.delete("/faqs/{faq_id}")
def delete_faq(faq_id: int, db: Session = Depends(get_db)):
    """Delete an FAQ"""
    db_faq = db.query(models.FAQ).filter(models.FAQ.id == faq_id).first()
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    try:
        db.delete(db_faq)
        db.commit()
        
        print(f"✅ Deleted FAQ {faq_id}")
        return {"message": f"FAQ {faq_id} deleted successfully"}
    except Exception as e:
        print(f"❌ Error deleting FAQ: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error deleting FAQ")

# Contact Support (save message)
@router.post("/contact", response_model=schemas.SupportMessageOut)
def contact_support(message: schemas.SupportMessageCreate, db: Session = Depends(get_db)):
    """Submit a support message"""
    try:
        new_message = models.SupportMessage(**message.dict())
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        
        print(f"✅ New support message from {message.name}: {message.subject}")
        return new_message
    except Exception as e:
        print(f"❌ Error saving support message: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error submitting support message")

# Get support messages (admin only)
@router.get("/messages", response_model=List[schemas.SupportMessageOut])
def get_support_messages(db: Session = Depends(get_db)):
    """Get all support messages (admin only)"""
    try:
        messages = db.query(models.SupportMessage).order_by(models.SupportMessage.id.desc()).all()
        print(f"✅ Retrieved {len(messages)} support messages")
        return messages
    except Exception as e:
        print(f"❌ Error retrieving support messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving support messages")

# Health check for help service
@router.get("/health")
def help_health_check():
    """Health check for help & support service"""
    return {
        "status": "healthy",
        "service": "help & support",
        "features": ["quick_help", "faqs", "contact_support"]
    }