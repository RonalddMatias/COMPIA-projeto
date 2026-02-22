from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import database
import models
import schemas
import auth

router = APIRouter(prefix="/orders", tags=["orders"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/checkout", response_model=schemas.OrderResponse)
def checkout(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role),
):
    """
    Checkout mockado: valida estoque, cria pedido (Order + itens + entrega), baixa estoque.
    delivery_type: SHIPPING (envio), PICKUP (retirada), DIGITAL (e-book).
    """
    total_amount = 0.0
    items_with_product = []

    if order.delivery_type == schemas.DeliveryType.SHIPPING and not order.shipping_address:
        raise HTTPException(status_code=400, detail="Endereço de entrega obrigatório para envio.")

    try:
        for item in order.items:
            product = db.query(models.Product).with_for_update().filter(models.Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Produto {item.product_id} não encontrado")
            if product.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Estoque insuficiente para '{product.title}'. Pedido: {item.quantity}, Disponível: {product.stock_quantity}",
                )
            total_amount += product.price * item.quantity
            items_with_product.append((product, item.quantity))

        shipping_address_json: Optional[str] = None
        if order.shipping_address:
            shipping_address_json = order.shipping_address.model_dump_json()

        db_order = models.Order(
            user_id=current_user.id,
            status=models.OrderStatus.PAID,
            total_amount=total_amount,
            payment_method=models.PaymentMethod(order.payment_method.value),
            delivery_type=models.DeliveryType(order.delivery_type.value),
            shipping_address=shipping_address_json,
        )
        db.add(db_order)
        db.flush()

        for product, qty in items_with_product:
            item_download_url = None
            if product.product_type == models.ProductType.DIGITAL and getattr(product, "download_url", None):
                item_download_url = product.download_url
            db.add(models.OrderItem(
                order_id=db_order.id,
                product_id=product.id,
                quantity=qty,
                unit_price=product.price,
                product_title=product.title,
                download_url=item_download_url,
            ))
            product.stock_quantity -= qty

        db.commit()
        db.refresh(db_order)
        return schemas.OrderResponse(
            order_id=db_order.id,
            message="Pedido realizado com sucesso (pagamento mockado).",
            total_amount=total_amount,
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[schemas.OrderDetail])
def list_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    """Lista pedidos do usuário logado."""
    orders = (
        db.query(models.Order)
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    return [_order_to_detail(o) for o in orders]


@router.get("/{order_id}", response_model=schemas.OrderDetail)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    """Detalhe de um pedido (apenas dono)."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return _order_to_detail(order)


def _order_to_detail(order: models.Order) -> schemas.OrderDetail:
    shipping_address = None
    if order.shipping_address:
        try:
            shipping_address = json.loads(order.shipping_address)
        except Exception:
            pass
    return schemas.OrderDetail(
        id=order.id,
        total_amount=order.total_amount,
        payment_method=order.payment_method.value,
        delivery_type=getattr(order, "delivery_type", None) and order.delivery_type.value or "SHIPPING",
        shipping_address=shipping_address,
        created_at=order.created_at,
        items=[
            schemas.OrderItemResponse(
                product_id=item.product_id,
                product_title=getattr(item, "product_title", None),
                quantity=item.quantity,
                unit_price=item.unit_price,
                download_url=getattr(item, "download_url", None),
            )
            for item in order.items
        ],
    )
