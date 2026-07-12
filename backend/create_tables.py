try:
    from .database import Base, engine
    from .database import models
except (ImportError, ValueError):
    from database import Base, engine
    from database import models


import os

def main() -> None:
    db_url = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
    print(f"🚀 Initializing database tables...")
    print(f"🔗 Target Database: {db_url.split('@')[-1] if db_url else 'None'}")
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified successfully!")
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    main()

