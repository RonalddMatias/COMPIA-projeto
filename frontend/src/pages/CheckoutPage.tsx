import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, type PaymentMethod, type DeliveryType, type ShippingAddressInput } from '../services/dataService';
import QRCode from 'qrcode';

const CheckoutPage = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('SHIPPING');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const pixKey = 'compia-editora@pix.com.br';

    // Endereço (quando entrega = envio)
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [cepLoading, setCepLoading] = useState(false);
    const [cepError, setCepError] = useState('');

    const fetchCep = async () => {
        const digits = zip.replace(/\D/g, '');
        if (digits.length !== 8) {
            setCepError('CEP deve ter 8 dígitos.');
            return;
        }
        setCepError('');
        setCepLoading(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
            const data = await res.json();
            if (data.erro) {
                setCepError('CEP não encontrado.');
                return;
            }
            setStreet(data.logradouro || '');
            setNeighborhood(data.bairro || '');
            setCity(data.localidade || '');
            setState(data.uf || '');
            setZip(data.cep ? data.cep.replace(/\D/g, '') : digits);
        } catch {
            setCepError('Erro ao buscar CEP. Tente novamente.');
        } finally {
            setCepLoading(false);
        }
    };

    // Mock: dados do cartão (não enviados ao backend)
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardValid, setCardValid] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    // Gera QR Code quando o método de pagamento for PIX
    useEffect(() => {
        if (paymentMethod === 'PIX') {
            QRCode.toDataURL(pixKey, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            })
                .then(url => setQrCodeUrl(url))
                .catch(err => console.error('Erro ao gerar QR Code:', err));
        }
    }, [paymentMethod, pixKey]);

    if (!user) {
        return (
            <div className="max-w-md mx-auto text-center py-12">
                <p className="text-stone-500 mb-4">Faça login para finalizar a compra.</p>
                <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">Ir para login</Link>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="max-w-md mx-auto text-center py-12">
                <p className="text-stone-500 mb-4">Seu carrinho está vazio.</p>
                <Link to="/products" className="font-semibold text-teal-600 hover:text-teal-700">Ver produtos</Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (deliveryType === 'SHIPPING' && (!street.trim() || !number.trim() || !neighborhood.trim() || !city.trim() || !state.trim() || !zip.trim())) {
            setError('Preencha o endereço de entrega.');
            return;
        }
        setLoading(true);
        try {
            const items = cartItems.map((item) => ({ product_id: item.id, quantity: item.quantity }));
            const shippingAddress: ShippingAddressInput | undefined = deliveryType === 'SHIPPING'
                ? { street, number, complement: complement || undefined, neighborhood, city, state, zip }
                : undefined;
            await orderService.checkout(items, paymentMethod, deliveryType, shippingAddress);
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
            <h2 className="text-3xl font-bold text-stone-800 mb-8">Pagamento</h2>

            {/* Resumo */}
            <div className="bg-white rounded-2xl shadow-md border border-stone-200/80 p-5 mb-8">
                <h3 className="font-semibold text-stone-800 mb-3">Resumo do pedido</h3>
                <ul className="divide-y divide-stone-100">
                    {cartItems.map((item) => (
                        <li key={item.id} className="py-2 flex justify-between text-sm text-stone-600">
                            <span>{item.title} x {item.quantity}</span>
                            <span className="font-medium text-teal-700">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-3 text-lg font-bold text-teal-700">Total: R$ {total.toFixed(2)}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de entrega */}
                <div className="bg-white rounded-2xl shadow-md border border-stone-200/80 p-5">
                    <p className="text-sm font-medium text-stone-700 mb-3">Entrega</p>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                            <input type="radio" name="delivery" checked={deliveryType === 'SHIPPING'} onChange={() => setDeliveryType('SHIPPING')} className="text-teal-600 focus:ring-teal-500" />
                            <span>Envio (Correios/transportadora)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                            <input type="radio" name="delivery" checked={deliveryType === 'PICKUP'} onChange={() => setDeliveryType('PICKUP')} className="text-teal-600 focus:ring-teal-500" />
                            <span>Retirada no local</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                            <input type="radio" name="delivery" checked={deliveryType === 'DIGITAL'} onChange={() => setDeliveryType('DIGITAL')} className="text-teal-600 focus:ring-teal-500" />
                            <span>Entrega digital (e-book)</span>
                        </label>
                    </div>
                </div>

                {deliveryType === 'SHIPPING' && (
                    <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-3">
                        <p className="text-sm font-medium text-stone-700 mb-2">Endereço de entrega</p>
                        <p className="text-xs text-stone-500 mb-3">Digite o CEP e busque para preencher automaticamente (ViaCEP).</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex gap-2 sm:col-span-2">
                                <input
                                    type="text"
                                    placeholder="CEP (8 dígitos)"
                                    value={zip}
                                    onChange={(e) => { setZip(e.target.value.replace(/\D/g, '').slice(0, 8)); setCepError(''); }}
                                    onBlur={fetchCep}
                                    className="flex-1 border border-stone-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    maxLength={8}
                                    required={deliveryType === 'SHIPPING'}
                                />
                                <button
                                    type="button"
                                    onClick={fetchCep}
                                    disabled={cepLoading || zip.replace(/\D/g, '').length !== 8}
                                    className="px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-sm font-semibold"
                                >
                                    {cepLoading ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>
                            {cepError && <p className="text-sm text-red-600 sm:col-span-2">{cepError}</p>}
                            <div className="sm:col-span-2">
                                <input type="text" placeholder="Rua" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500" required={deliveryType === 'SHIPPING'} />
                            </div>
                            <div><input type="text" placeholder="Número" value={number} onChange={(e) => setNumber(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500" required={deliveryType === 'SHIPPING'} /></div>
                            <div><input type="text" placeholder="Complemento" value={complement} onChange={(e) => setComplement(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500" /></div>
                            <div><input type="text" placeholder="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500" required={deliveryType === 'SHIPPING'} /></div>
                            <div><input type="text" placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500" required={deliveryType === 'SHIPPING'} /></div>
                            <div><input type="text" placeholder="Estado (UF)" value={state} onChange={(e) => setState(e.target.value.toUpperCase())} maxLength={2} className="w-full border border-stone-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500" required={deliveryType === 'SHIPPING'} /></div>
                        </div>
                    </div>
                )}

                {/* Forma de pagamento */}
                <div className="bg-white rounded-2xl shadow-md border border-stone-200/80 p-5">
                    <p className="text-sm font-medium text-stone-700 mb-3">Forma de pagamento</p>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                            <input type="radio" name="payment" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} className="text-teal-600 focus:ring-teal-500" />
                            <span>Cartão (Visa, Master, Elo)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                            <input type="radio" name="payment" checked={paymentMethod === 'PIX'} onChange={() => setPaymentMethod('PIX')} className="text-teal-600 focus:ring-teal-500" />
                            <span>PIX</span>
                        </label>
                    </div>
                </div>

                {paymentMethod === 'CARD' && (
                    <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-3">
                        <p className="text-xs text-stone-500 mb-2">Aceitamos: Visa, MasterCard, Elo</p>
                        <div className="flex gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg">Visa</span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-lg">MasterCard</span>
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-lg">Elo</span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Número do cartão</label>
                            <input type="text" placeholder="0000 0000 0000 0000" maxLength={19} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Nome no cartão</label>
                            <input type="text" placeholder="Como está no cartão" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Validade (MM/AA)</label>
                                <input type="text" placeholder="MM/AA" maxLength={5} value={cardValid} onChange={(e) => setCardValid(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">CVV</label>
                                <input type="text" placeholder="123" maxLength={4} value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} className="w-full border border-stone-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-teal-500" />
                            </div>
                        </div>
                    </div>
                )}

                {paymentMethod === 'PIX' && (
                    <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-3">
                        <p className="text-xs text-stone-500">Escaneie o QR Code ou copie a chave PIX abaixo</p>
                        <div className="flex justify-center p-4 bg-white border-2 border-dashed border-stone-200 rounded-xl">
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="QR Code PIX" className="w-40 h-40" />
                            ) : (
                                <div className="w-40 h-40 bg-stone-100 rounded-xl flex items-center justify-center text-stone-500 text-sm text-center">
                                    Gerando QR Code...
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Chave PIX (copiar)</label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm">{pixKey}</code>
                                <button type="button" className="text-sm font-semibold text-teal-600 hover:text-teal-700" onClick={() => navigator.clipboard.writeText(pixKey)}>Copiar</button>
                            </div>
                        </div>
                    </div>
                )}

                {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800 font-medium">{error}</div>}

                <div className="flex gap-3">
                    <Link to="/cart" className="px-4 py-3 border border-stone-300 rounded-xl text-stone-700 font-medium hover:bg-stone-50">
                        Voltar ao carrinho
                    </Link>
                    <button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-stone-400 text-white font-bold py-3 px-6 rounded-xl shadow-md">
                        {loading ? 'Processando...' : 'Confirmar pagamento'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CheckoutPage;
