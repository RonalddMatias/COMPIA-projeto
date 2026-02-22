from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ProductType(str, Enum):
    PHYSICAL = "PHYSICAL"
    DIGITAL = "DIGITAL"
    KIT = "KIT"

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    VENDEDOR = "VENDEDOR"
    CLIENTE = "CLIENTE"

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole = UserRole.CLIENTE

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    image_url: Optional[str] = None
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
    download_url: Optional[str] = None  # para e-book: link de download

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
    download_url: Optional[str] = None

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[Category] = None

    class Config:
        from_attributes = True

# Order Schemas (mock payment + entrega)
class OrderItemInput(BaseModel):
    product_id: int
    quantity: int


class PaymentMethod(str, Enum):
    CARD = "CARD"
    PIX = "PIX"


class DeliveryType(str, Enum):
    SHIPPING = "SHIPPING"
    PICKUP = "PICKUP"
    DIGITAL = "DIGITAL"


class ShippingAddressInput(BaseModel):
    street: str
    number: str
    complement: Optional[str] = None
    neighborhood: str
    city: str
    state: str
    zip: str


class OrderCreate(BaseModel):
    items: List[OrderItemInput]
    payment_method: PaymentMethod = PaymentMethod.CARD
    delivery_type: DeliveryType = DeliveryType.SHIPPING
    shipping_address: Optional[ShippingAddressInput] = None


class OrderResponse(BaseModel):
    order_id: int
    message: str
    total_amount: float


class OrderItemResponse(BaseModel):
    product_id: int
    product_title: Optional[str] = None
    quantity: int
    unit_price: float
    download_url: Optional[str] = None  # para e-book: link para o cliente


class OrderDetail(BaseModel):
    id: int
    total_amount: float
    payment_method: str
    delivery_type: str
    shipping_address: Optional[dict] = None
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
