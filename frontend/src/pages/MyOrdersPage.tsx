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
                <p className="text-gray-600">Faça login para ver seus pedidos.</p>
                <Link to="/login" className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">Login</Link>
            </div>
        );
    }

    if (loading) return <div className="py-8">Carregando pedidos...</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Meus pedidos</h2>
            {orders.length === 0 ? (
                <p className="text-gray-600">Você ainda não fez nenhum pedido.</p>
            ) : (
                <ul className="space-y-4">
                    {orders.map((order) => (
                        <li key={order.id} className="bg-white shadow rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-900">Pedido #{order.id}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString('pt-BR')} · {order.payment_method === 'CARD' ? 'Cartão' : 'PIX'}
                                    </p>
                                </div>
                                <p className="font-bold text-gray-900">R$ {order.total_amount.toFixed(2)}</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                {order.items.length} item(ns)
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyOrdersPage;
