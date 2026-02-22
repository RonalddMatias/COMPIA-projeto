from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

class ProductType(str, enum.Enum):
    PHYSICAL = "PHYSICAL"
    DIGITAL = "DIGITAL"
    KIT = "KIT"

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    EDITOR = "EDITOR"
    VENDEDOR = "VENDEDOR"
    CLIENTE = "CLIENTE"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CLIENTE, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    image_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False) # In production Decimal is better, but Float for simplicity now
    stock_quantity = Column(Integer, default=0)
    image_url = Column(String, nullable=True)
    product_type = Column(Enum(ProductType), default=ProductType.PHYSICAL, nullable=False)
    
    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="products")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
