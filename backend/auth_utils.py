"""
Authentication utilities using Supabase Auth.
Validates Supabase JWTs and manages local user records.
"""
import os
import logging
import base64
import binascii
import time
import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from .database import get_db, models

logger = logging.getLogger(__name__)

# In-memory cache for JWKS to avoid calling Supabase endpoint on every request
_jwks_cache = None
_jwks_cache_time = 0
JWKS_CACHE_TTL = 3600  # 1 hour

def get_jwks(supabase_url: str) -> dict:
    global _jwks_cache, _jwks_cache_time
    now = time.time()
    if _jwks_cache is None or now - _jwks_cache_time > JWKS_CACHE_TTL:
        try:
            jwks_url = f"{supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
            response = requests.get(jwks_url, timeout=5)
            response.raise_for_status()
            _jwks_cache = response.json()
            _jwks_cache_time = now
            logger.info("Successfully fetched and cached Supabase JWKS")
        except Exception as e:
            logger.error(f"Failed to fetch JWKS from Supabase: {e}")
            if _jwks_cache is None:
                raise
    return _jwks_cache

# auto_error=False so we return 401 (not 403) when credentials are missing
security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> models.User:
    """
    FastAPI dependency – validates the Supabase JWT from the Authorization
    header and returns the corresponding local User row (creating one on
    the first authenticated request).
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

    # --- Decode & validate the Supabase-issued JWT locally ---
    try:
        header = jwt.get_unverified_header(token)
        logger.info(f"Incoming JWT Header: {header}")
        alg = header.get("alg", "HS256")
    except Exception as e:
        logger.warning(f"Failed to parse JWT header: {e}")
        alg = "HS256"

    try:
        claims = jwt.get_unverified_claims(token)
        logger.info(f"Incoming JWT Claims: {claims}")
    except Exception as e:
        logger.warning(f"Failed to parse JWT claims: {e}")

    payload = None
    last_error = None

    if alg == "ES256":
        supabase_url = os.getenv("SUPABASE_URL")
        if not supabase_url:
            logger.error("SUPABASE_URL is not set for JWKS lookup")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Server configuration missing SUPABASE_URL",
            )
        try:
            from jose import jwk
            jwks = get_jwks(supabase_url)
            kid = header.get("kid")
            key_data = None
            if kid:
                for k in jwks.get("keys", []):
                    if k.get("kid") == kid:
                        key_data = k
                        break
            if not key_data and jwks.get("keys"):
                key_data = jwks["keys"][0]
            if not key_data:
                raise jwt.JWTError("No matching key found in JWKS")
            
            key = jwk.construct(key_data)
            payload = jwt.decode(
                token,
                key,
                algorithms=["ES256"],
                audience="authenticated",
            )
        except Exception as e:
            logger.warning(f"ES256 JWT validation failed: {e}")
            last_error = e
    else:
        # HS256
        if not jwt_secret:
            logger.error("SUPABASE_JWT_SECRET is not set")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Server authentication not configured",
            )

        secrets_to_try = []
        
        # 1. Base64 decoded bytes (if the secret is base64-encoded)
        clean_secret = jwt_secret.strip()
        clean_secret += "=" * ((4 - len(clean_secret) % 4) % 4)
        try:
            decoded = base64.b64decode(clean_secret, validate=True)
            secrets_to_try.append(decoded)
        except (binascii.Error, ValueError):
            pass
            
        # 2. Raw secret string/bytes
        secrets_to_try.append(jwt_secret.encode("utf-8"))
        secrets_to_try.append(jwt_secret)

        # 3. Legacy JWT Secret (if present in environment)
        legacy_secret = os.getenv("SUPABASE_LEGACY_JWT_SECRET")
        if legacy_secret:
            clean_legacy = legacy_secret.strip()
            clean_legacy += "=" * ((4 - len(clean_legacy) % 4) % 4)
            try:
                decoded_legacy = base64.b64decode(clean_legacy, validate=True)
                secrets_to_try.append(decoded_legacy)
            except (binascii.Error, ValueError):
                pass
            secrets_to_try.append(legacy_secret.encode("utf-8"))
            secrets_to_try.append(legacy_secret)

        for secret in secrets_to_try:
            try:
                payload = jwt.decode(
                    token,
                    secret,
                    algorithms=["HS256"],
                    audience="authenticated",
                )
                break
            except JWTError as e:
                last_error = e

    if not payload:
        logger.warning("JWT validation failed", exc_info=last_error)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {last_error}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    supabase_uid: str | None = payload.get("sub")
    email: str | None = payload.get("email")

    if not supabase_uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # --- Find or create a local user record ---
    user = (
        db.query(models.User)
        .filter(models.User.supabase_uid == supabase_uid)
        .first()
    )

    if not user:
        metadata = payload.get("user_metadata", {})
        name = (
            metadata.get("name")
            or metadata.get("full_name")
            or (email.split("@")[0] if email else "User")
        )
        user = models.User(
            supabase_uid=supabase_uid,
            email=email,
            name=name,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"✅ Created local user for: {email}")

    return user