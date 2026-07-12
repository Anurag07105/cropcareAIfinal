"""
Test script to verify OTP authentication flow
"""
from fastapi.testclient import TestClient
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from .main import app
except (ImportError, ValueError):
    from main import app

client = TestClient(app)

def test_auth_health_check():
    """Check if authentication service and Twilio are configured"""
    print("\n--- Testing Auth Health Check ---")
    res = client.get("/auth/health")
    assert res.status_code == 200
    data = res.json()
    print(f"✅ Auth Service Status: {data['status']}")
    print(f"✅ Twilio Status: {data['twilio_status']}")
    return data

def test_email_signup():
    """Test email-based signup"""
    print("\n--- Testing Email Signup ---")
    user_data = {
        "email": "testuser@cropcare.ai",
        "name": "Test User",
        "password": "SecurePass123"
    }
    res = client.post("/auth/signup/email", json=user_data)
    
    if res.status_code == 200:
        user = res.json()
        print(f"✅ Email signup successful!")
        print(f"   User ID: {user['id']}")
        print(f"   Email: {user['email']}")
        print(f"   Name: {user['name']}")
        return user
    else:
        print(f"❌ Email signup failed: {res.json()}")
        return None

def test_email_login():
    """Test email-based login"""
    print("\n--- Testing Email Login ---")
    login_data = {
        "email": "testuser@cropcare.ai",
        "password": "SecurePass123"
    }
    res = client.post("/auth/login/email", json=login_data)
    
    if res.status_code == 200:
        user = res.json()
        print(f"✅ Email login successful!")
        print(f"   User ID: {user['id']}")
        print(f"   Email: {user['email']}")
        return user
    else:
        print(f"❌ Email login failed: {res.json()}")
        return None

def test_otp_flow():
    """Test OTP-based authentication flow"""
    print("\n--- Testing OTP-Based Authentication ---")
    
    # Test phone number (replace with your own valid number for real testing)
    phone_number = "+919131864774"  # Format: +country code + number
    
    # Step 1: Send OTP
    print(f"\n  Step 1: Sending OTP to {phone_number}...")
    send_otp_data = {
        "phone_number": phone_number
    }
    
    res_send = client.post("/auth/send-otp", json=send_otp_data)
    
    if res_send.status_code == 200:
        print(f"✅ OTP sent successfully!")
        print(f"   Response: {res_send.json()}")
        
        # For testing purposes, we need to get the OTP from the database
        # In production, it would be sent via SMS
        print(f"\n  💡 In production, the user would receive OTP via SMS at {phone_number}")
        print(f"  💡 For testing, you need to retrieve the OTP from the database")
        
        # Step 2: Simulate receiving the OTP (in real scenario, user gets it via SMS)
        # For this test, we'll try a mock OTP
        test_otp = "123456"  # This won't work unless the actual OTP matches
        
        print(f"\n  Step 2: Attempting to verify OTP...")
        verify_otp_data = {
            "phone_number": phone_number,
            "otp_code": test_otp
        }
        
        res_verify = client.post("/auth/verify-otp", json=verify_otp_data)
        
        if res_verify.status_code == 200:
            user = res_verify.json()
            print(f"✅ OTP verified successfully!")
            print(f"   User ID: {user['id']}")
            print(f"   Phone: {user['phone_number']}")
            return True
        else:
            print(f"⚠️  OTP verification failed (expected for mock OTP): {res_verify.json()}")
            print(f"   This is normal - the mock OTP doesn't match the actual one sent")
            print(f"   In real testing, retrieve the actual OTP from the database first")
            return False
    else:
        print(f"❌ Failed to send OTP: {res_send.json()}")
        return False

def test_phone_signup():
    """Test phone-based signup"""
    print("\n--- Testing Phone Signup ---")
    phone_number = "+1987654321"
    user_data = {
        "phone_number": phone_number,
        "name": "Phone User"
    }
    res = client.post("/auth/signup/phone", json=user_data)
    
    if res.status_code == 200:
        user = res.json()
        print(f"✅ Phone signup successful!")
        print(f"   User ID: {user['id']}")
        print(f"   Phone: {user['phone_number']}")
        return user
    else:
        print(f"❌ Phone signup failed: {res.json()}")
        return None

def main():
    """Run all authentication tests"""
    print("=" * 60)
    print("🔐 CROPCARE AI - AUTHENTICATION PIPELINE TEST")
    print("=" * 60)
    
    try:
        # Check health
        health = test_auth_health_check()
        
        # Check if Twilio is configured
        if "Missing" in health.get('twilio_status', ''):
            print("\n⚠️  WARNING: Twilio is not properly configured!")
            print("   Please ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are set in .env")
        
        # Test email signup
        test_email_signup()
        
        # Test email login
        test_email_login()
        
        # Test phone signup
        test_phone_signup()
        
        # Test OTP flow
        test_otp_flow()
        
        print("\n" + "=" * 60)
        print("✅ AUTHENTICATION TESTS COMPLETED")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
