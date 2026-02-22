import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService, type OrderDetail } from '../services/dataService';
import { useAuth } from '../context/AuthContext';

const MyOrdersPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderDetail[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await orderService.list();
                setOrders(data);
            } catch {
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-stone-500">Faça login para ver seus pedidos.</p>
                <Link to="/login" className="mt-2 inline-block font-semibold text-teal-600 hover:text-teal-700">Entrar</Link>
            </div>
        );
    }

    if (loading) return (
        <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-stone-800 mb-8">Meus pedidos</h2>
            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md border border-stone-200/80 p-12 text-center">
                    <p className="text-stone-500 font-medium">Você ainda não fez nenhum pedido.</p>
                    <Link to="/products" className="mt-4 inline-block font-semibold text-teal-600 hover:text-teal-700">Ver catálogo</Link>
                </div>
            ) : (
                <ul className="space-y-4">
                    {orders.map((order, index) => (
                        <li key={order.id}>
                            <Link to={`/orders/${order.id}`} className="block bg-white rounded-2xl shadow-md border border-stone-200/80 p-5 hover:shadow-lg hover:border-teal-200/60 transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-stone-800">Pedido nº {orders.length - index}</p>
                                        <p className="text-sm text-stone-500 mt-0.5">{new Date(order.created_at).toLocaleDateString('pt-BR')} · {order.payment_method === 'CARD' ? 'Cartão' : 'PIX'}</p>
                                    </div>
                                    <p className="font-bold text-teal-700">R$ {order.total_amount.toFixed(2)}</p>
                                </div>
                                <p className="text-sm text-stone-500 mt-2">{order.items.length} item(ns) · Clique para ver detalhes</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyOrdersPage;
