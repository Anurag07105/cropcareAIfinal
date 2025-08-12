from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import models, schemas
from ..database import get_db
from typing import List  # import List for response_model if Python < 3.9

router = APIRouter(
    prefix="/help",
    tags=["Help & Support"]
)

# Static Quick Help Options
@router.get("/quick-help")
def get_quick_help():
    return [
        {"title": "Call Support", "description": "+91 1800 123 4567", "action": "tel:+9118001234567"},
        {"title": "Email Support", "description": "support@cropcare-ai.com", "action": "mailto:support@cropcare-ai.com"},
        {"title": "Live Chat", "description": "Chat with our experts", "action": "#"},
        {"title": "Video Tutorials", "description": "Watch how-to videos", "action": "#"},
        {"title": "Documentation", "description": "Read detailed guides", "action": "#"},
        {"title": "User Guide", "description": "Download user manual", "action": "#"}
    ]


# Get FAQs
@router.get("/faqs", response_model=List[schemas.FAQOut])
def get_faqs(db: Session = Depends(get_db)):
    return db.query(models.FAQ).order_by(models.FAQ.id).all()


# Create FAQ (admin use)
@router.post("/faqs", response_model=schemas.FAQOut)
def create_faq(faq: schemas.FAQCreate, db: Session = Depends(get_db)):
    new_faq = models.FAQ(**faq.dict())
    db.add(new_faq)
    db.commit()
    db.refresh(new_faq)
    return new_faq


# Contact Support (save message)
@router.post("/contact", response_model=schemas.SupportMessageOut)
def contact_support(message: schemas.SupportMessageCreate, db: Session = Depends(get_db)):
    new_message = models.SupportMessage(**message.dict())
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message
