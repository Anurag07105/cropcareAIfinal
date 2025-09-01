# backend/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
# --- FIX ---: Imported get_db to ensure a consistent DB session
from ..database import models, schemas, get_db
from ..auth_utils import hash_password, verify_password
from datetime import datetime, timedelta
import random, os
from twilio.rest import Client

router = APIRouter(prefix="/auth", tags=["Authentication"])

def generate_otp(length=6):
    return str(random.randint(10**(length-1), (10**length)-1))

def otp_expiry(minutes=5):
    return datetime.utcnow() + timedelta(minutes=minutes)

def send_sms_via_twilio(phone_number, otp):
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")

    if not all([account_sid, auth_token, twilio_phone]):
        print("❌ Twilio credentials missing from environment variables")
        raise Exception("Twilio credentials not set")

    try:
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=f"Your CropCare AI OTP is: {otp}. Valid for 5 minutes.",
            from_=twilio_phone,
            to=phone_number
        )
        print(f"✅ OTP SMS sent to {phone_number} (SID: {message.sid})")
    except Exception as e:
        print(f"❌ Twilio Error: {str(e)}")
        raise

# --- FIX ---: Removed local get_db function to use the central one.
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

@router.post("/signup/email", response_model=schemas.UserOut)
def signup_email(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pass = hash_password(user.password)
    new_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_pass
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print(f"✅ New user registered via email: {user.email}")
    return new_user

@router.post("/send-otp")
def send_otp(request: schemas.UserOTPLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.phone_number == request.phone_number).first()
    
    if not user:
        # Auto-register user if not found
        user = models.User(phone_number=request.phone_number)
        db.add(user)
        db.flush() 
        print(f"✅ New user auto-registered with phone: {request.phone_number}")

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = otp_expiry()
    
    db.commit()
    
    try:
        send_sms_via_twilio(user.phone_number, otp)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")

    return {"message": "OTP sent successfully"}

@router.post("/verify-otp", response_model=schemas.UserOut)
def verify_otp(request: schemas.UserOTPVerify, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.phone_number == request.phone_number).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    if not user.otp_code or user.otp_code != request.otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Use the corrected DateTime field for comparison
    if not user.otp_expires_at or datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP expired")
    
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    
    print(f"✅ OTP verified for: {request.phone_number}")
    return user

@router.get("/health")
def auth_health_check():
    twilio_status = "✅ Configured" if all([os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN")]) else "❌ Missing Credentials"
    return {"status": "healthy", "service": "authentication", "twilio_status": twilio_status}