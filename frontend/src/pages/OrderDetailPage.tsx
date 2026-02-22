import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderService, type OrderDetail } from '../services/dataService';
import { useAuth } from '../context/AuthContext';

const deliveryTypeLabel: Record<string, string> = {
    SHIPPING: 'Envio (Correios/transportadora)',
    PICKUP: 'Retirada no local',
    DIGITAL: 'Entrega digital (e-book)',
};

const OrderDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        const fetchOrder = async () => {
            try {
                const data = await orderService.get(Number(id));
                setOrder(data);
            } catch {
                setError('Pedido não encontrado.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-stone-500">Faça login para ver o pedido.</p>
                <Link to="/login" className="mt-2 inline-block font-semibold text-teal-600 hover:text-teal-700">Entrar</Link>
            </div>
        );
    }

    if (loading) return (
        <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-600 rounded-full animate-spin" />
        </div>
    );
    if (error || !order) {
        return (
            <div className="max-w-lg mx-auto text-center py-12">
                <p className="text-red-600 font-medium mb-4">{error || 'Pedido não encontrado.'}</p>
                <Link to="/orders" className="font-semibold text-teal-600 hover:text-teal-700">Voltar aos pedidos</Link>
            </div>
        );
    }

    const paymentLabel = order.payment_method === 'CARD' ? 'Cartão' : 'PIX';
    const deliveryLabel = deliveryTypeLabel[order.delivery_type] || order.delivery_type;
    const dateFormatted = new Date(order.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link to="/orders" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                    ← Voltar aos pedidos
                </Link>
            </div>

            <h2 className="text-3xl font-bold text-stone-800 mb-8">Pedido #{order.id}</h2>

            <div className="bg-white rounded-2xl shadow-md border border-stone-200/80 overflow-hidden">
                <div className="p-5 border-b border-stone-100">
                    <p className="text-sm font-medium text-stone-500">Data do pedido</p>
                    <p className="font-semibold text-stone-800 mt-0.5">{dateFormatted}</p>
                </div>
                <div className="p-5 border-b border-stone-100">
                    <p className="text-sm font-medium text-stone-500">Forma de pagamento</p>
                    <p className="font-semibold text-stone-800 mt-0.5">{paymentLabel}</p>
                </div>
                <div className="p-5 border-b border-stone-100">
                    <p className="text-sm font-medium text-stone-500">Entrega</p>
                    <p className="font-semibold text-stone-800 mt-0.5">{deliveryLabel}</p>
                    {order.shipping_address && (
                        <div className="mt-3 text-sm text-stone-600 bg-stone-50 rounded-xl p-4 border border-stone-100">
                            <p>{order.shipping_address.street}, {order.shipping_address.number}</p>
                            {order.shipping_address.complement && <p>{order.shipping_address.complement}</p>}
                            <p>{order.shipping_address.neighborhood} · {order.shipping_address.city} - {order.shipping_address.state}</p>
                            <p>CEP {order.shipping_address.zip}</p>
                        </div>
                    )}
                </div>
                <div className="p-5">
                    <p className="text-sm font-medium text-stone-500 mb-3">Produtos</p>
                    <ul className="divide-y divide-stone-100">
                        {order.items.map((item) => (
                            <li key={item.product_id} className="py-4 flex flex-wrap justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-stone-800">{item.product_title || `Produto #${item.product_id}`}</p>
                                    <p className="text-sm text-stone-500">{item.quantity} x R$ {item.unit_price.toFixed(2)}</p>
                                    {item.download_url && (
                                        <a href={item.download_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-2 text-sm font-semibold text-teal-600 hover:text-teal-700">
                                            Baixar e-book →
                                        </a>
                                    )}
                                </div>
                                <p className="font-semibold text-teal-700">R$ {(item.quantity * item.unit_price).toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 pt-4 border-t border-stone-200 flex justify-between items-center">
                        <span className="font-semibold text-stone-800">Total</span>
                        <span className="text-xl font-bold text-teal-700">R$ {order.total_amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
