import os
from dotenv import load_dotenv, find_dotenv

dotenv_path = find_dotenv()
print(f"File found at: {dotenv_path}")
load_dotenv(dotenv_path)

print("--- Supabase Keys ---")
for key in os.environ:
    if "SUPABASE" in key:
        print(f"{key}: {'[HIDDEN]' if os.environ[key] else '[EMPTY]'}")

print("\n--- All Keys (count) ---")
print(len(os.environ))
