# backend/database/models.py

from sqlalchemy import (
    Column, Integer, String, Boolean, Text, 
    ForeignKey, DateTime, UniqueConstraint, func
)
from sqlalchemy.orm import relationship
from . import Base
from datetime import datetime

# --- FIX ---: Cleaned up the User model to match the logic in auth.py
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    
    # Made email optional to allow phone-only signup
    name = Column(String, nullable=True)
    email = Column(String(150), unique=True, index=True, nullable=True) 
    phone_number = Column(String, unique=True, index=True, nullable=True)
    
    # Removed redundant `password_hash` and set `hashed_password` to nullable
    hashed_password = Column(String, nullable=True)
    
    otp_code = Column(String, nullable=True)
    # Storing expiry as a proper DateTime is better for comparisons
    otp_expires_at = Column(DateTime, nullable=True)
    
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")


# --- FIX ---: Added the missing CommunityPost model required by community.py
class CommunityPost(Base):
    __tablename__ = "community_posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String, nullable=False)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# NOTE: The 'Post' model below is not used by any of your current routes.
# Consider removing it if 'CommunityPost' is your intended model for community features.
class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    author = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")


class Like(Base):
    __tablename__ = "likes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_type = Column(String(20), nullable=False)  # 'post' or 'comment'
    target_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (
        UniqueConstraint('user_id', 'target_type', 'target_id', name='_user_target_uc'),
    )


class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    target_type = Column(String(20), nullable=False)
    target_id = Column(Integer, nullable=False)
    reason = Column(Text, nullable=True)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FAQ(Base):
    __tablename__ = "faqs"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, index=True)
    answer = Column(Text)


class SupportMessage(Base):
    __tablename__ = 'support_messages'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())