from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ProductType(str, Enum):
    PHYSICAL = "PHYSICAL"
    DIGITAL = "DIGITAL"
    KIT = "KIT"

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    title: str
    description: str
    price: float
    stock_quantity: int = 0
    image_url: Optional[str] = None
    product_type: ProductType = ProductType.PHYSICAL
    category_id: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    image_url: Optional[str] = None
    product_type: Optional[ProductType] = None
    category_id: Optional[int] = None

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[Category] = None

    class Config:
        from_attributes = True
