from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

import models
import schemas
import auth
from database import get_db

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Registra um novo usuário.
    Por padrão, novos usuários têm role 'cliente'.
    Apenas admins podem criar usuários com outras roles (admin, editor, vendedor).
    """
    # Verifica se username já existe
    db_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nome de usuário já registrado"
        )
    
    # Verifica se email já existe
    db_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já registrado"
        )
    
    # Cria novo usuário
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
    
    return db_user

@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Autentica um usuário e retorna um token JWT.
    Use username e password para fazer login.
    """
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo"
        )
    
    # Cria token JWT
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
async def get_me(current_user: models.User = Depends(auth.get_current_active_user)):
    """Retorna os dados do usuário autenticado"""
    return current_user

@router.get("/users", response_model=List[schemas.User])
async def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """Lista todos os usuários (apenas admin)"""
    users = db.query(models.User).all()
    return users

@router.put("/users/{user_id}/role", response_model=schemas.User)
async def update_user_role(
    user_id: int,
    role: schemas.UserRole,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """Atualiza o role de um usuário (apenas admin)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user.role = role
    db.commit()
    db.refresh(user)
    
    return user

@router.put("/users/{user_id}/deactivate", response_model=schemas.User)
async def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """Desativa um usuário (apenas admin)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode desativar sua própria conta"
        )
    
    user.is_active = False
    db.commit()
    db.refresh(user)
    
    return user

@router.put("/users/{user_id}/activate", response_model=schemas.User)
async def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """Ativa um usuário (apenas admin)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user.is_active = True
    db.commit()
    db.refresh(user)
    
    return user
