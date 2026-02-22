import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, type PaymentMethod } from '../services/dataService';

const CheckoutPage = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Mock: dados do cartão (não enviados ao backend, só para preencher a tela)
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardValid, setCardValid] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    if (!user) {
        return (
            <div className="max-w-md mx-auto text-center py-12">
                <p className="text-gray-600 mb-4">Faça login para finalizar a compra.</p>
                <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    Ir para login
                </Link>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="max-w-md mx-auto text-center py-12">
                <p className="text-gray-600 mb-4">Seu carrinho está vazio.</p>
                <Link to="/products" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    Ver produtos
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const items = cartItems.map((item) => ({ product_id: item.id, quantity: item.quantity }));
            await orderService.checkout(items, paymentMethod);
            clearCart();
            navigate('/order-success');
        } catch (err: unknown) {
            const msg = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
                : 'Erro ao processar pagamento.';
            setError(String(msg));
        } finally {
            setLoading(false);
        }
    };

    const total = getCartTotal();

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Pagamento (simulado)</h2>

            {/* Resumo */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Resumo do pedido</h3>
                <ul className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                        <li key={item.id} className="py-2 flex justify-between text-sm">
                            <span className="text-gray-700">{item.title} x {item.quantity}</span>
                            <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-2 text-lg font-bold text-gray-900">Total: R$ {total.toFixed(2)}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Escolha do método */}
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Forma de pagamento</p>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'CARD'}
                                onChange={() => setPaymentMethod('CARD')}
                                className="text-indigo-600"
                            />
                            <span>Cartão (Visa, Master, Elo)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'PIX'}
                                onChange={() => setPaymentMethod('PIX')}
                                className="text-indigo-600"
                            />
                            <span>PIX</span>
                        </label>
                    </div>
                </div>

                {paymentMethod === 'CARD' && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <p className="text-xs text-gray-500 mb-2">Aceitamos: Visa, MasterCard, Elo (dados apenas simulados)</p>
                        <div className="flex gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Visa</span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">MasterCard</span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Elo</span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número do cartão</label>
                            <input
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome no cartão</label>
                            <input
                                type="text"
                                placeholder="Como está no cartão"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Validade (MM/AA)</label>
                                <input
                                    type="text"
                                    placeholder="MM/AA"
                                    maxLength={5}
                                    value={cardValid}
                                    onChange={(e) => setCardValid(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                <input
                                    type="text"
                                    placeholder="123"
                                    maxLength={4}
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {paymentMethod === 'PIX' && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <p className="text-xs text-gray-500">Simulação: QR Code e chave PIX (não reais)</p>
                        <div className="flex justify-center p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                            <div className="w-40 h-40 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm text-center">
                                QR Code mock
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chave aleatória (copiar)</label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm">
                                    compia-editora@mock.pix
                                </code>
                                <button
                                    type="button"
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                    onClick={() => navigator.clipboard.writeText('compia-editora@mock.pix')}
                                >
                                    Copiar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
                )}

                <div className="flex gap-3">
                    <Link
                        to="/cart"
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Voltar ao carrinho
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded shadow"
                    >
                        {loading ? 'Processando...' : 'Confirmar pagamento (mock)'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CheckoutPage;
