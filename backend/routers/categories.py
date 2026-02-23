from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import database
import models
import schemas
import auth

router = APIRouter(prefix="/categories", tags=["categories"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Category)
def create_category(
    category: schemas.CategoryCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_vendedor_or_admin)
):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    # Creation log
    auth.log_activity(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="CREATE",
        resource="CATEGORY",
        resource_id=db_category.id,
        details=f"Created category: {db_category.name}"
    )
    
    return db_category

@router.get("/", response_model=List[schemas.Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories

@router.put("/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int, 
    category: schemas.CategoryCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_vendedor_or_admin)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for key, value in category.dict().items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    
    # update log
    auth.log_activity(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="UPDATE",
        resource="CATEGORY",
        resource_id=db_category.id,
        details=f"Updated category: {db_category.name}"
    )
    
    return db_category

@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if there are products in this category
    if db_category.products:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete category with associated products. Please delete or reassign products first."
        )

    category_name = db_category.name
    db.delete(db_category)
    db.commit()
    
    # deletion log
    auth.log_activity(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="DELETE",
        resource="CATEGORY",
        resource_id=category_id,
        details=f"Deleted category: {category_name}"
    )
    
    return None
