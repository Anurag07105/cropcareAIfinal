# backend/test_supabase_pipeline.py
import pytest
from fastapi.testclient import TestClient
try:
    from .main import app
    from .database import get_db, SessionLocal, engine, Base, models
except (ImportError, ValueError):
    from main import app
    from database import get_db, SessionLocal, engine, Base, models
from sqlalchemy import create_engine
import os
import io
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Setup a test client using the real application
client = TestClient(app)

def test_health_checks():
    """Verify core health routes and DB status"""
    print("\n--- Testing Health Checks ---")
    
    res = client.get("/")
    assert res.status_code == 200
    assert "running" in res.json().get("message", "").lower()
    print("✅ Root endpoint is active")
    
    # Community health check
    res_com = client.get("/community/health")
    assert res_com.status_code == 200
    print("✅ Community router is active")

def ensure_test_user():
    """Ensure a user with ID 1 exists for testing purposes"""
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.id == 1).first()
        if not user:
            print("👤 Creating test user (ID: 1)...")
            test_user = models.User(
                id=1,
                name="Test Farmer",
                email="test@cropcare.ai",
                is_active=True
            )
            db.add(test_user)
            db.commit()
            print("✅ Test user created")
        return True
    except Exception as e:
        print(f"❌ Failed to ensure test user: {e}")
        return False
    finally:
        db.close()

def test_community_pipeline():
    """End-to-End test for community posts, comments, and likes"""
    print("\n--- Testing Community Endpoints ---")
    
    # Check what database we are actually using
    db_url = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
    if db_url and "sqlite" in db_url:
        print(f"⚠️  WARNING: You are currently connected to a SQLite database: {db_url}")
        print("💡 To use Supabase, ensure 'SUPABASE_DB_URL' is set to your PostgreSQL string in .env")
    
    # 1. Create a post
    post_data = {
        "content": "Testing Supabase Database Migration",
        "image_url": "https://example.supabase.co/storage/v1/object/public/crop-images/test.jpg"
    }
    create_res = client.post("/community/posts?user_id=1", json=post_data)
    
    # Normally this would be 200/201 but if the DB is unmigrated, it returns an error.
    if create_res.status_code >= 400:
        print(f"❌ Failed to create post: {create_res.json()}")
        print("💡 Ensure you have run 'python create_tables.py' with Supabase credentials!")
        return
        
    post = create_res.json()
    post_id = post["id"]
    print(f"✅ Successfully created Post ID: {post_id}")
    
    # 2. Get the post
    get_res = client.get(f"/community/posts/{post_id}")
    assert get_res.status_code == 200
    print(f"✅ Successfully retrieved Post ID: {post_id}")
    
    # 3. Add a comment
    comment_data = {
        "post_id": post_id,
        "content": "This is a test comment!"
    }
    comment_res = client.post(f"/community/posts/{post_id}/comments?user_id=1", json=comment_data)
    assert comment_res.status_code == 200
    print("✅ Successfully added comment")
    
    # 4. Like the post
    like_res = client.post(f"/community/posts/{post_id}/like")
    assert like_res.status_code == 200
    print(f"✅ Successfully liked post. Total likes: {like_res.json().get('likes')}")


def create_dummy_image():
    image_bytes = b"test_image_content"
    test_file = io.BytesIO(image_bytes)
    test_file.name = "test_leaf.jpg"
    return test_file

def test_supabase_prediction_pipeline():
    """Test unified AI Prediction + Supabase Storage upload flow"""
    print("\n--- Testing Prediction & Upload Endpoint ---")
    
    # Create a dummy image
    image_bytes = create_dummy_image()
    
    # Upload and Predict
    res = client.post(
        "/predict/predict?user_id=1",
        files={"file": ("test_leaf.jpg", image_bytes, "image/jpeg")}
    )
    
    if res.status_code == 200:
        data = res.json()
        print(f"✅ Prediction successful: {data.get('name')} ({data.get('confidence')}%)")
        print(f"✅ Image saved to Supabase: {data.get('image_url')}")
    else:
        print(f"❌ Prediction failed: {res.json()}")
        print("💡 Ensure model is valid and bucket 'crop-images' exists and is public.")
        raise Exception("Upload failed")

if __name__ == "__main__":
    print("Running Supabase Migration Tests...")
    test_health_checks()
    
    if ensure_test_user():
        try:
            test_community_pipeline()
            test_supabase_prediction_pipeline()
        except Exception as e:
            print(f"\n❌ Pipeline failed. Error: {e}")
    else:
        print("\n❌ Skipping further tests because test user could not be verified.")
