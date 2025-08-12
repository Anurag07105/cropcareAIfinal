"""Community routes for the CropCareAI backend."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import models, schemas
from ..database import get_db
from pydantic import BaseModel

router = APIRouter()

# Get all posts
@router.get("/posts", response_model=list[schemas.CommunityPost])
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(models.CommunityPost).all()
    return posts

# Create a new post
@router.post("/posts", response_model=schemas.CommunityPost)
def create_post(post: schemas.CommunityPostCreate, db: Session = Depends(get_db)):
    db_post = models.CommunityPost(
        title=post.title,
        content=post.content,
        author=post.author,
        likes=0
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

# Add a comment to a post
@router.post("/posts/{post_id}/comments", response_model=schemas.Comment)
def create_comment(post_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db)):
    db_post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db_comment = models.Comment(
        content=comment.content,
        post_id=post_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

# Like a post
class LikeResponse(BaseModel):
    message: str

@router.post("/posts/{post_id}/like", response_model=LikeResponse)
def like_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db_post.likes += 1
    db.commit()
    return LikeResponse(message=f"Post {post_id} liked successfully!")
