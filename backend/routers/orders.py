from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
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
    Checkout mockado: valida estoque, cria pedido (Order + itens), baixa estoque e retorna sucesso.
    payment_method: CARD ou PIX (apenas para registro, sem gateway real).
    """
    total_amount = 0.0
    items_with_product = []

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

        # Criar Order e OrderItems (mock: status PAID já na criação)
        db_order = models.Order(
            user_id=current_user.id,
            status=models.OrderStatus.PAID,
            total_amount=total_amount,
            payment_method=models.PaymentMethod(order.payment_method.value),
        )
        db.add(db_order)
        db.flush()

        for product, qty in items_with_product:
            db.add(models.OrderItem(
                order_id=db_order.id,
                product_id=product.id,
                quantity=qty,
                unit_price=product.price,
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
    return schemas.OrderDetail(
        id=order.id,
        total_amount=order.total_amount,
        payment_method=order.payment_method.value,
        created_at=order.created_at,
        items=[
            schemas.OrderItemResponse(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
            )
            for item in order.items
        ],
    )
