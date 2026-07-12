# test_backend_imports.py - Create this in your project root
import os
import sys

print(f"Current working directory: {os.getcwd()}")

# Test 1: Check if backend/auth_utils.py exists
auth_utils_path = "backend/auth_utils.py"
if os.path.exists(auth_utils_path):
    print(f"✅ Found auth_utils.py at: {os.path.abspath(auth_utils_path)}")
    
    # Read first few lines to verify content
    with open(auth_utils_path, 'r') as f:
        lines = f.readlines()[:5]
        print("First 5 lines of auth_utils.py:")
        for i, line in enumerate(lines, 1):
            print(f"  {i}: {line.rstrip()}")
else:
    print(f"❌ auth_utils.py not found at: {os.path.abspath(auth_utils_path)}")

# Test 2: Check if backend/__init__.py exists
backend_init = "backend/__init__.py"
if os.path.exists(backend_init):
    print(f"✅ backend/__init__.py exists")
else:
    print(f"❌ backend/__init__.py missing - creating it...")
    with open(backend_init, 'w') as f:
        f.write("# Backend package\n")

# Test 3: Try different import methods
print("\nTesting imports:")

# Method 1: Direct import from backend
try:
    from backend.auth_utils import hash_password, verify_password
    print("✅ SUCCESS: from backend.auth_utils import hash_password, verify_password")
    
    # Test the functions
    test_password = "test123"
    hashed = hash_password(test_password)
    verified = verify_password(test_password, hashed)
    print(f"✅ Password hashing test: {verified}")
    
except Exception as e:
    print(f"❌ FAILED: from backend.auth_utils import hash_password, verify_password")
    print(f"   Error: {e}")

# Method 2: Import backend module first
try:
    import backend.auth_utils as auth_utils
    print("✅ SUCCESS: import backend.auth_utils as auth_utils")
except Exception as e:
    print(f"❌ FAILED: import backend.auth_utils as auth_utils")
    print(f"   Error: {e}")

# Method 3: Check what's in backend module
try:
    import backend
    print(f"✅ backend module contents: {dir(backend)}")
except Exception as e:
    print(f"❌ Failed to import backend module: {e}")