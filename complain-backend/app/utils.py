import os
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
import secrets

# Load from environment with safe defaults
SECRET_KEY = os.getenv("SECRET_KEY", "change_this")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))  # default 1 day
RESET_TOKEN_EXPIRE_MINUTES = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "15")) # 15 minutes for reset token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    # bcrypt has a 72-byte input limit; truncate to avoid surprises
    return pwd_context.hash(password[:72])

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_password_reset_token() -> str:
    return secrets.token_urlsafe(32)

def send_reset_email(email: str, token: str):
    # In a real app, you'd use a service like SendGrid or SMTP
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    print(f"Password reset link for {email}: {reset_link}")


