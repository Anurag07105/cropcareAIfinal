# backend/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal, models, schemas
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
    """Send OTP to user via Twilio SMS API."""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")

    if not account_sid or not auth_token or not twilio_phone:
        print("❌ Twilio credentials missing from environment variables")
        raise Exception("Twilio credentials not set in environment variables")

    try:
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=f"Your CropCare AI OTP is: {otp}. Valid for 5 minutes.",
            from_=twilio_phone,
            to=phone_number
        )
        print(f"✅ SMS sent successfully to {phone_number}, Message SID: {message.sid}")
    except Exception as e:
        print(f"❌ Failed to send SMS: {str(e)}")
        raise

def get_db():
    """Dependency that provides a SQLAlchemy database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Email signup
@router.post("/signup/email", response_model=schemas.UserOut)
def signup_email(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if not user.email:
        raise HTTPException(status_code=400, detail="Email is required for email signup")
    
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(user.password)
    db_user = models.User(
        name=user.name, 
        email=user.email, 
        phone_number=user.phone_number, 
        hashed_password=hashed_pw
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Phone signup
@router.post("/signup/phone", response_model=schemas.UserOut)
def signup_phone(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if not user.phone_number:
        raise HTTPException(status_code=400, detail="Phone number is required for phone signup")
    
    existing = db.query(models.User).filter(models.User.phone_number == user.phone_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    # Set a random password for phone-only users
    random_password = generate_otp(10)
    hashed_pw = hash_password(random_password)
    db_user = models.User(
        name=user.name, 
        phone_number=user.phone_number, 
        hashed_password=hashed_pw
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Send OTP for phone login
@router.post("/send-otp")
def send_otp(request: schemas.UserOTPLogin, db: Session = Depends(get_db)):
    print(f"🚀 Sending OTP to: {request.phone_number}")
    
    otp = generate_otp()
    expiry = otp_expiry()

    user = db.query(models.User).filter(models.User.phone_number == request.phone_number).first()
    if not user:
        # Auto-register with phone number
        print(f"📝 Auto-registering new user: {request.phone_number}")
        user = models.User(phone_number=request.phone_number)
        db.add(user)
        db.commit()
        db.refresh(user)

    user.otp_code = otp
    user.otp_expires_at = expiry
    db.commit()

    # Format phone number
    DEFAULT_COUNTRY_CODE = os.getenv("DEFAULT_COUNTRY_CODE", "+91")
    try:
        formatted_number = request.phone_number.strip()
        if not formatted_number.startswith("+"):
            if DEFAULT_COUNTRY_CODE:
                formatted_number = DEFAULT_COUNTRY_CODE + formatted_number
            else:
                raise HTTPException(status_code=400, detail="Phone number must include country code")
        
        print(f"📱 Formatted number: {formatted_number}")
        send_sms_via_twilio(formatted_number, otp)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ OTP send error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")

    return {"message": "OTP sent successfully"}

# OTP verification
@router.post("/verify-otp", response_model=schemas.UserOut)
def verify_otp(request: schemas.UserOTPVerify, db: Session = Depends(get_db)):
    print(f"🔐 Verifying OTP for: {request.phone_number}")
    
    user = db.query(models.User).filter(models.User.phone_number == request.phone_number).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    if not user.otp_code or user.otp_code != request.otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if not user.otp_expires_at or datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP expired")
    
    # Clear OTP after successful verification
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    
    print(f"✅ OTP verified successfully for: {request.phone_number}")
    return user

# Health check for auth service
@router.get("/health")
def auth_health_check():
    """Health check for authentication service"""
    twilio_status = "✅ Configured" if all([
        os.getenv("TWILIO_ACCOUNT_SID"),
        os.getenv("TWILIO_AUTH_TOKEN"), 
        os.getenv("TWILIO_PHONE_NUMBER")
    ]) else "❌ Missing credentials"
    
    return {
        "status": "healthy",
        "service": "authentication",
        "twilio": twilio_status
    }