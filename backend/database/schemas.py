# backend/database/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ------------------ AUTH ------------------
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    name: Optional[str] = None
    password: Optional[str] = None  # required for email signup

class UserLogin(UserBase):
    password: Optional[str] = None  # for email login

class UserOTPLogin(BaseModel):
    phone_number: str

class UserOTPVerify(BaseModel):
    phone_number: str
    otp_code: str

class UserOut(UserBase):
    id: int
    name: Optional[str] = None
    is_active: bool
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ------------------ POSTS ------------------
class PostCreate(BaseModel):
    content: str

class PostOut(BaseModel):
    id: int
    content: str
    user_id: int
    is_deleted: bool
    created_at: datetime
    class Config:
        orm_mode = True


# ------------------ COMMENTS ------------------
class CommentCreate(BaseModel):
    post_id: int
    content: str
    parent_id: Optional[int] = None

class Comment(BaseModel):  # Renamed from CommentOut to match community.py
    id: int
    post_id: int
    user_id: int
    parent_id: Optional[int]
    content: str
    is_deleted: bool
    created_at: datetime
    class Config:
        orm_mode = True


# ------------------ REPORTS ------------------
class ReportCreate(BaseModel):
    target_type: str
    target_id: int
    reason: Optional[str] = None


# ------------------ HELP POSTS ------------------
class HelpPostBase(BaseModel):
    title: str
    description: str

class HelpPostCreate(HelpPostBase):
    pass

class HelpPost(HelpPostBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True


# ------------------ COMMUNITY POSTS ------------------
class CommunityPostBase(BaseModel):
    title: str
    content: str
    author: str

class CommunityPostCreate(CommunityPostBase):
    pass

class CommunityPost(CommunityPostBase):
    id: int
    created_at: datetime
    likes: Optional[int] = 0
    class Config:
        orm_mode = True
# ------------------ FAQ ------------------
# Base schema for FAQ (common fields)
class FAQBase(BaseModel):
    question: str
    answer: str

# For creating FAQ
class FAQCreate(FAQBase):
    pass

# For reading FAQ from DB
class FAQOut(FAQBase):
    id: int

    class Config:
        orm_mode = True

# Base schema for SupportMessage
class SupportMessageBase(BaseModel):
    name: str
    email: str
    message: str

# For creating a support message
class SupportMessageCreate(SupportMessageBase):
    pass

# For reading a support message from DB
class SupportMessageOut(SupportMessageBase):
    id: int

    class Config:
        orm_mode = True