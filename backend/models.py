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
    download_url = Column(String, nullable=True)  # para e-books: link de download

    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="products")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PaymentMethod(str, enum.Enum):
    CARD = "CARD"
    PIX = "PIX"


class OrderStatus(str, enum.Enum):
    PAID = "PAID"  # mock: pedido já nasce pago


class DeliveryType(str, enum.Enum):
    SHIPPING = "SHIPPING"   # envio por correios/transportadora
    PICKUP = "PICKUP"       # retirada no local
    DIGITAL = "DIGITAL"     # e-book / entrega digital


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PAID, nullable=False)
    total_amount = Column(Float, nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    delivery_type = Column(Enum(DeliveryType), default=DeliveryType.SHIPPING, nullable=False)
    shipping_address = Column(Text, nullable=True)  # JSON: {street, number, complement, neighborhood, city, state, zip}
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    product_title = Column(String, nullable=True)  # cópia do nome no momento da compra
    download_url = Column(String, nullable=True)  # para e-book: link enviado ao cliente

    order = relationship("Order", back_populates="items")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # nullable para ações sem usuário (ex: registro)
    username = Column(String, nullable=True)  # cache do username para não precisar join
    action = Column(String, nullable=False, index=True)  # LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc
    resource = Column(String, nullable=True, index=True)  # USER, PRODUCT, CATEGORY, ORDER, etc
    resource_id = Column(Integer, nullable=True)  # ID do recurso afetado
    details = Column(Text, nullable=True)  # JSON com detalhes adicionais
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
