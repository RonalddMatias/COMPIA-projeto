from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
import json

import models
import schemas
import auth
from database import get_db

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user.
    By default, new users have 'cliente' role.
    Only admins can create users with other roles (admin, editor, vendedor).
    """
    # Check if username already exists
    db_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    db_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = auth.get_password_hash(user_data.password)
    db_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role,
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # register log
    auth.log_activity(
        db=db,
        user_id=db_user.id,
        username=db_user.username,
        action="REGISTER",
        resource="USER",
        resource_id=db_user.id,
        details=f"Role: {db_user.role.value}"
    )
    
    return db_user

@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authenticates a user and returns a JWT token.
    Use username and password to login.
    """
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create JWT token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    # login log
    auth.log_activity(
        db=db,
        user_id=user.id,
        username=user.username,
        action="LOGIN",
        resource="USER",
        resource_id=user.id
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
async def get_me(current_user: models.User = Depends(auth.get_current_active_user)):
    """Returns the authenticated user data"""
    return current_user

@router.get("/users", response_model=List[schemas.User])
async def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """Lists all users (admin only)"""
    users = db.query(models.User).all()
    return users

@router.put("/users/{user_id}/role", response_model=schemas.User)
async def update_user_role(
    user_id: int,
    role: schemas.UserRole,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """Updates a user role (admin only)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from changing their own role
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own role"
        )
    
    old_role = user.role
    user.role = role
    db.commit()
    db.refresh(user)
    
    # changing role log
    auth.log_activity(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="UPDATE_ROLE",
        resource="USER",
        resource_id=user.id,
        details=f"Changed {user.username} role from {old_role.value} to {role.value}"
    )
    
    return user

@router.put("/users/{user_id}/deactivate", response_model=schemas.User)
async def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """Deactivates a user (admin only)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account"
        )
    
    user.is_active = False
    db.commit()
    db.refresh(user)
    
    # deactivate log
    auth.log_activity(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="DEACTIVATE",
        resource="USER",
        resource_id=user.id,
        details=f"Deactivated user: {user.username}"
    )
    
    return user

@router.put("/users/{user_id}/activate", response_model=schemas.User)
async def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """Activates a user (admin only)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    db.commit()
    db.refresh(user)
    
    # activate log
    auth.log_activity(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="ACTIVATE",
        resource="USER",
        resource_id=user.id,
        details=f"Activated user: {user.username}"
    )
    
    return user

@router.put("/me/password", response_model=dict)
async def change_password(
    password_data: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Changes the current user's password"""
    # Verify current password
    if not auth.verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Update to new password
    current_user.hashed_password = auth.get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}


@router.get("/logs", response_model=List[schemas.ActivityLog])
async def list_activity_logs(
    skip: int = 0,
    limit: int = 100,
    action: str = None,
    resource: str = None,
    username: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """List activity logs in the system (admin only)"""
    query = db.query(models.ActivityLog)
    
    if action:
        query = query.filter(models.ActivityLog.action == action)
    if resource:
        query = query.filter(models.ActivityLog.resource == resource)
    if username:
        query = query.filter(models.ActivityLog.username.ilike(f"%{username}%"))
    
    logs = query.order_by(models.ActivityLog.timestamp.desc()).offset(skip).limit(limit).all()
    return logs
