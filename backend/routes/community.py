# backend/routes/community.py
"""Community routes – posts, comments, and per-user likes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import models, schemas, get_db
from ..auth_utils import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter()


# ---------- Response models ----------
class LikeResponse(BaseModel):
    message: str
    likes: int
    liked: bool


# ---------- Posts ----------
@router.get("/posts", response_model=List[schemas.CommunityPost])
def get_posts(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all community posts (authenticated)."""
    posts = (
        db.query(models.CommunityPost)
        .order_by(models.CommunityPost.id.desc())
        .all()
    )
    return posts


@router.post("/posts", response_model=schemas.CommunityPost)
def create_post(
    post: schemas.CommunityPostCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new community post."""
    db_post = models.CommunityPost(
        user_id=current_user.id,
        content=post.content,
        image_url=post.image_url,
        likes=0,
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.get("/posts/{post_id}", response_model=schemas.CommunityPost)
def get_post(
    post_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific post by ID."""
    db_post = (
        db.query(models.CommunityPost)
        .filter(models.CommunityPost.id == post_id)
        .first()
    )
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post


# ---------- Comments ----------
@router.post("/posts/{post_id}/comments", response_model=schemas.Comment)
def create_comment(
    post_id: int,
    comment: schemas.CommentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a comment to a post."""
    db_post = (
        db.query(models.CommunityPost)
        .filter(models.CommunityPost.id == post_id)
        .first()
    )
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    db_comment = models.Comment(
        comment=comment.content,
        post_id=post_id,
        user_id=current_user.id,
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


@router.get("/posts/{post_id}/comments", response_model=List[schemas.Comment])
def get_comments(
    post_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all comments for a post."""
    db_post = (
        db.query(models.CommunityPost)
        .filter(models.CommunityPost.id == post_id)
        .first()
    )
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    return (
        db.query(models.Comment)
        .filter(models.Comment.post_id == post_id)
        .order_by(models.Comment.created_at.asc())
        .all()
    )


# ---------- Likes (one per user per post) ----------
@router.post("/posts/{post_id}/like", response_model=LikeResponse)
def toggle_like(
    post_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggle like on a post – one like per user per post."""
    db_post = (
        db.query(models.CommunityPost)
        .filter(models.CommunityPost.id == post_id)
        .first()
    )
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing_like = (
        db.query(models.Like)
        .filter(
            models.Like.user_id == current_user.id,
            models.Like.target_type == "post",
            models.Like.target_id == post_id,
        )
        .first()
    )

    if existing_like:
        # Already liked → unlike
        db.delete(existing_like)
        db_post.likes = max(0, db_post.likes - 1)
        db.commit()
        return LikeResponse(message="Unliked", likes=db_post.likes, liked=False)
    else:
        # Not liked yet → like
        new_like = models.Like(
            user_id=current_user.id, target_type="post", target_id=post_id
        )
        db.add(new_like)
        db_post.likes += 1
        db.commit()
        return LikeResponse(message="Liked", likes=db_post.likes, liked=True)


@router.get("/liked-posts")
def get_liked_posts(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return list of post IDs that the current user has liked."""
    likes = (
        db.query(models.Like.target_id)
        .filter(
            models.Like.user_id == current_user.id,
            models.Like.target_type == "post",
        )
        .all()
    )
    return [lid[0] for lid in likes]


# ---------- Health ----------
@router.get("/health")
def community_health_check():
    return {
        "status": "healthy",
        "service": "community",
        "features": ["posts", "comments", "likes (per-user)"],
    }