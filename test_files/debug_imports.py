# debug_imports.py - Run this in your project root to debug imports
import sys
import os

print("Python path:")
for path in sys.path:
    print(f"  {path}")

print(f"\nCurrent working directory: {os.getcwd()}")

# Test 1: Try to import the database module
try:
    from backend.database import Base
    print("✅ Successfully imported Base from backend.database")
except Exception as e:
    print(f"❌ Failed to import Base: {e}")
    
# Test 2: Try to import the database module itself
try:
    from backend import database
    print("✅ Successfully imported backend.database module")
    print(f"Database module contents: {dir(database)}")
except Exception as e:
    print(f"❌ Failed to import backend.database: {e}")

# Test 3: Check if files exist
database_init = "backend/database/__init__.py"
database_models = "backend/database/models.py"

print(f"\nFile existence check:")
print(f"  {database_init}: {'✅' if os.path.exists(database_init) else '❌'}")
print(f"  {database_models}: {'✅' if os.path.exists(database_models) else '❌'}")

# Test 4: Try to read the __init__.py file
try:
    with open("backend/database/__init__.py", "r") as f:
        content = f.read()
        print(f"\n__init__.py content (first 200 chars):")
        print(f"'{content[:200]}...'")
except Exception as e:
    print(f"❌ Cannot read __init__.py: {e}")