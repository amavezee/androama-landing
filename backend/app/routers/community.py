from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from app.database import get_db
from app.models import CommunityPost, CommunityReply, PostLike, ReplyLike, User
from app.schemas import PostCreate, PostResponse, PostUpdate, ReplyCreate, ReplyResponse
from app.auth import get_current_active_user
import json
import uuid

router = APIRouter(prefix="/api/community", tags=["community"])

@router.get("/posts", response_model=List[PostResponse])
async def get_posts(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("newest", regex="^(newest|popular|trending)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all community posts with filtering and sorting"""
    query = db.query(CommunityPost)
    
    # Filter by category
    if category and category != "All":
        query = query.filter(CommunityPost.category == category)
    
    # Search
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                CommunityPost.title.ilike(search_term),
                CommunityPost.content.ilike(search_term)
            )
        )
    
    # Sorting
    if sort_by == "newest":
        query = query.order_by(CommunityPost.created_at.desc())
    elif sort_by == "popular":
        query = query.order_by(
            (CommunityPost.likes_count + CommunityPost.replies_count + CommunityPost.views).desc()
        )
    elif sort_by == "trending":
        # Trending: recent posts with high engagement
        query = query.order_by(CommunityPost.is_pinned.desc(), CommunityPost.created_at.desc())
    
    # Get posts
    posts = query.offset(skip).limit(limit).all()
    
    # Check which posts user has liked
    user_liked_post_ids = {
        like.post_id for like in db.query(PostLike.post_id)
        .filter(PostLike.user_id == current_user.id)
        .all()
    }
    
    # Format response
    result = []
    for post in posts:
        # Parse tags
        tags = []
        if post.tags:
            try:
                tags = json.loads(post.tags)
            except:
                tags = []
        
        # Get author info
        author_data = {
            "id": post.user.id,
            "username": post.user.username,
            "email": post.user.email,
            "edition": post.user.edition,
            "is_admin": post.user.is_admin,
            "avatar_url": post.user.avatar_url
        }
        
        result.append(PostResponse(
            id=post.id,
            title=post.title,
            content=post.content,
            category=post.category,
            tags=tags,
            is_pinned=post.is_pinned,
            is_announcement=post.is_announcement,
            is_solved=post.is_solved,
            views=post.views,
            likes_count=post.likes_count,
            replies_count=post.replies_count,
            created_at=post.created_at,
            updated_at=post.updated_at,
            author=author_data,
            user_liked=post.id in user_liked_post_ids
        ))
    
    return result

@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new community post"""
    # Create post
    new_post = CommunityPost(
        user_id=current_user.id,
        title=post_data.title,
        content=post_data.content,
        category=post_data.category,
        tags=json.dumps(post_data.tags or []),
        is_announcement=current_user.is_admin and post_data.category == "Announcements"
    )
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    # Format response
    tags = post_data.tags or []
    author_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "edition": current_user.edition,
        "is_admin": current_user.is_admin,
        "avatar_url": current_user.avatar_url
    }
    
    return PostResponse(
        id=new_post.id,
        title=new_post.title,
        content=new_post.content,
        category=new_post.category,
        tags=tags,
        is_pinned=new_post.is_pinned,
        is_announcement=new_post.is_announcement,
        is_solved=new_post.is_solved,
        views=new_post.views,
        likes_count=new_post.likes_count,
        replies_count=new_post.replies_count,
        created_at=new_post.created_at,
        updated_at=new_post.updated_at,
        author=author_data,
        user_liked=False
    )

@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a single post by ID"""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment views
    post.views += 1
    db.commit()
    
    # Check if user liked
    user_liked = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user.id
    ).first() is not None
    
    # Parse tags
    tags = []
    if post.tags:
        try:
            tags = json.loads(post.tags)
        except:
            tags = []
    
    # Get author info
    author_data = {
        "id": post.user.id,
        "username": post.user.username,
        "email": post.user.email,
        "edition": post.user.edition,
        "is_admin": post.user.is_admin,
        "avatar_url": post.user.avatar_url
    }
    
    return PostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        category=post.category,
        tags=tags,
        is_pinned=post.is_pinned,
        is_announcement=post.is_announcement,
        is_solved=post.is_solved,
        views=post.views,
        likes_count=post.likes_count,
        replies_count=post.replies_count,
        created_at=post.created_at,
        updated_at=post.updated_at,
        author=author_data,
        user_liked=user_liked
    )

@router.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: uuid.UUID,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a post (only by author or admin)"""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check permissions
    if post.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    
    # Update fields
    if post_data.title is not None:
        post.title = post_data.title
    if post_data.content is not None:
        post.content = post_data.content
    if post_data.category is not None:
        post.category = post_data.category
    if post_data.tags is not None:
        post.tags = json.dumps(post_data.tags)
    if post_data.is_solved is not None:
        post.is_solved = post_data.is_solved
    
    db.commit()
    db.refresh(post)
    
    # Format response
    tags = []
    if post.tags:
        try:
            tags = json.loads(post.tags)
        except:
            tags = []
    
    author_data = {
        "id": post.user.id,
        "username": post.user.username,
        "email": post.user.email,
        "edition": post.user.edition,
        "is_admin": post.user.is_admin,
        "avatar_url": post.user.avatar_url
    }
    
    user_liked = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user.id
    ).first() is not None
    
    return PostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        category=post.category,
        tags=tags,
        is_pinned=post.is_pinned,
        is_announcement=post.is_announcement,
        is_solved=post.is_solved,
        views=post.views,
        likes_count=post.likes_count,
        replies_count=post.replies_count,
        created_at=post.created_at,
        updated_at=post.updated_at,
        author=author_data,
        user_liked=user_liked
    )

@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a post (only by author or admin)"""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check permissions
    if post.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    db.delete(post)
    db.commit()
    return None

@router.post("/posts/{post_id}/like", status_code=status.HTTP_200_OK)
async def toggle_post_like(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Like or unlike a post"""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if already liked
    existing_like = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user.id
    ).first()
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        post.likes_count = max(0, post.likes_count - 1)
    else:
        # Like
        new_like = PostLike(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        post.likes_count += 1
    
    db.commit()
    return {"liked": existing_like is None, "likes_count": post.likes_count}

@router.get("/posts/{post_id}/replies", response_model=List[ReplyResponse])
async def get_replies(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all replies for a post"""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    replies = db.query(CommunityReply).filter(
        CommunityReply.post_id == post_id
    ).order_by(CommunityReply.created_at.asc()).all()
    
    # Check which replies user has liked
    user_liked_reply_ids = {
        like.reply_id for like in db.query(ReplyLike.reply_id)
        .filter(ReplyLike.user_id == current_user.id)
        .all()
    }
    
    result = []
    for reply in replies:
        author_data = {
            "id": reply.user.id,
            "username": reply.user.username,
            "email": reply.user.email,
            "is_admin": reply.user.is_admin,
            "avatar_url": reply.user.avatar_url
        }
        
        result.append(ReplyResponse(
            id=reply.id,
            content=reply.content,
            is_official=reply.is_official,
            likes_count=reply.likes_count,
            created_at=reply.created_at,
            updated_at=reply.updated_at,
            author=author_data,
            user_liked=reply.id in user_liked_reply_ids
        ))
    
    return result

@router.post("/posts/{post_id}/replies", response_model=ReplyResponse, status_code=status.HTTP_201_CREATED)
async def create_reply(
    post_id: uuid.UUID,
    reply_data: ReplyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a reply to a post"""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Create reply
    new_reply = CommunityReply(
        post_id=post_id,
        user_id=current_user.id,
        content=reply_data.content,
        is_official=current_user.is_admin
    )
    
    db.add(new_reply)
    post.replies_count += 1
    db.commit()
    db.refresh(new_reply)
    
    # Format response
    author_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_admin": current_user.is_admin,
        "avatar_url": current_user.avatar_url
    }
    
    return ReplyResponse(
        id=new_reply.id,
        content=new_reply.content,
        is_official=new_reply.is_official,
        likes_count=new_reply.likes_count,
        created_at=new_reply.created_at,
        updated_at=new_reply.updated_at,
        author=author_data,
        user_liked=False
    )

@router.post("/replies/{reply_id}/like", status_code=status.HTTP_200_OK)
async def toggle_reply_like(
    reply_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Like or unlike a reply"""
    reply = db.query(CommunityReply).filter(CommunityReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Check if already liked
    existing_like = db.query(ReplyLike).filter(
        ReplyLike.reply_id == reply_id,
        ReplyLike.user_id == current_user.id
    ).first()
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        reply.likes_count = max(0, reply.likes_count - 1)
    else:
        # Like
        new_like = ReplyLike(reply_id=reply_id, user_id=current_user.id)
        db.add(new_like)
        reply.likes_count += 1
    
    db.commit()
    return {"liked": existing_like is None, "likes_count": reply.likes_count}

