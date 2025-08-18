# backend/routes/community.py
"""Community routes for the CropCareAI backend."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import models, schemas
from ..database import get_db
from pydantic import BaseModel
from typing import List

router = APIRouter()

# Response models
class LikeResponse(BaseModel):
    message: str
    likes: int

# Get all posts
@router.get("/posts", response_model=List[schemas.CommunityPost])
def get_posts(db: Session = Depends(get_db)):
    """Retrieve all community posts"""
    try:
        posts = db.query(models.CommunityPost).order_by(models.CommunityPost.id.desc()).all()
        print(f"✅ Retrieved {len(posts)} community posts")
        return posts
    except Exception as e:
        print(f"❌ Error retrieving posts: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving posts")

# Create a new post
@router.post("/posts", response_model=schemas.CommunityPost)
def create_post(post: schemas.CommunityPostCreate, db: Session = Depends(get_db)):
    """Create a new community post"""
    try:
        db_post = models.CommunityPost(
            title=post.title,
            content=post.content,
            author=post.author,
            likes=0
        )
        db.add(db_post)
        db.commit()
        db.refresh(db_post)
        
        print(f"✅ Created new post: {post.title} by {post.author}")
        return db_post
    except Exception as e:
        print(f"❌ Error creating post: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error creating post")

# Get a specific post
@router.get("/posts/{post_id}", response_model=schemas.CommunityPost)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get a specific post by ID"""
    db_post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

# Add a comment to a post
@router.post("/posts/{post_id}/comments", response_model=schemas.Comment)
def create_comment(post_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db)):
    """Add a comment to a specific post"""
    # Check if post exists
    db_post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        db_comment = models.Comment(
            content=comment.content,
            post_id=post_id,
            author=getattr(comment, 'author', 'Anonymous')  # Handle optional author
        )
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        
        print(f"✅ Added comment to post {post_id}")
        return db_comment
    except Exception as e:
        print(f"❌ Error adding comment: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error adding comment")

# Get comments for a post
@router.get("/posts/{post_id}/comments", response_model=List[schemas.Comment])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    """Get all comments for a specific post"""
    # Check if post exists
    db_post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comments = db.query(models.Comment).filter(models.Comment.post_id == post_id).all()
    return comments

# Like a post
@router.post("/posts/{post_id}/like", response_model=LikeResponse)
def like_post(post_id: int, db: Session = Depends(get_db)):
    """Like a specific post"""
    db_post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        db_post.likes += 1
        db.commit()
        
        print(f"✅ Post {post_id} liked! Total likes: {db_post.likes}")
        return LikeResponse(
            message=f"Post {post_id} liked successfully!",
            likes=db_post.likes
        )
    except Exception as e:
        print(f"❌ Error liking post: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error liking post")

# Unlike a post (bonus feature)
@router.post("/posts/{post_id}/unlike", response_model=LikeResponse)
def unlike_post(post_id: int, db: Session = Depends(get_db)):
    """Unlike a specific post"""
    db_post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        if db_post.likes > 0:
            db_post.likes -= 1
        db.commit()
        
        print(f"✅ Post {post_id} unliked! Total likes: {db_post.likes}")
        return LikeResponse(
            message=f"Post {post_id} unliked successfully!",
            likes=db_post.likes
        )
    except Exception as e:
        print(f"❌ Error unliking post: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error unliking post")

# Health check for community service
@router.get("/health")
def community_health_check():
    """Health check for community service"""
    return {
        "status": "healthy",
        "service": "community",
        "features": ["posts", "comments", "likes"]
    }