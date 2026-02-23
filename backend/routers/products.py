from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import database
import models
import schemas
import auth

router = APIRouter(prefix="/products", tags=["products"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_vendedor_or_admin)
):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # creation log
    auth.log_activity(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="CREATE",
        resource="PRODUCT",
        resource_id=db_product.id,
        details=f"Created product: {db_product.title}"
    )
    
    return db_product

@router.get("/", response_model=List[schemas.Product])
def read_products(
    skip: int = 0, 
    limit: int = 100, 
    category_id: int = None, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Product)
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    return query.offset(skip).limit(limit).all()

@router.get("/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int, 
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_vendedor_or_admin)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    
    # update log
    auth.log_activity(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="UPDATE",
        resource="PRODUCT",
        resource_id=db_product.id,
        details=f"Updated product: {db_product.title}"
    )
    
    return db_product

@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_vendedor_or_admin)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_title = db_product.title
    db.delete(db_product)
    db.commit()
    
    # deletion log
    auth.log_activity(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="DELETE",
        resource="PRODUCT",
        resource_id=product_id,
        details=f"Deleted product: {product_title}"
    )
    
    return None
