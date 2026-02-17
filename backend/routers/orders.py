from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import database
import models
import schemas

router = APIRouter(prefix="/orders", tags=["orders"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/checkout", response_model=schemas.OrderResponse)
def checkout(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    total_amount = 0.0
    
    # Start a transaction explicitly? SQLAlchemy does this by default on commit, 
    # but we need to verify all items before committing any change.
    
    try:
        for item in order.items:
            product = db.query(models.Product).with_for_update().filter(models.Product.id == item.product_id).first()
            
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            
            if product.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Suficient stock not available for product '{product.title}'. Requested: {item.quantity}, Available: {product.stock_quantity}"
                )
            
            # Decrement stock
            product.stock_quantity -= item.quantity
            total_amount += product.price * item.quantity
        
        db.commit()
        return {"message": "Order placed successfully", "total_amount": total_amount}
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
