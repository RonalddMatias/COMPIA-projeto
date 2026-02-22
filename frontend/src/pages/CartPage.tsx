import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
    const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart();
    const { user } = useAuth();

    if (cartItems.length === 0) {
        return (
            <div className="max-w-lg mx-auto text-center py-16">
                <div className="bg-white rounded-2xl shadow-md border border-stone-200/80 p-12">
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">Seu carrinho está vazio</h2>
                    <p className="text-stone-500 mb-6">Adicione livros do catálogo para continuar.</p>
                    <Link to={user ? "/products" : "/login"} className="inline-flex font-semibold text-teal-600 hover:text-teal-700">
                        {user ? 'Ver catálogo' : 'Fazer login'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-stone-800 mb-8">Carrinho</h2>

            <div className="bg-white rounded-2xl shadow-md border border-stone-200/80 overflow-hidden mb-6">
                <ul className="divide-y divide-stone-100">
                    {cartItems.map((item) => (
                        <li key={item.id} className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-24 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">Sem img</div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-stone-800">{item.title}</p>
                                    <p className="text-sm text-stone-500">R$ {item.price.toFixed(2)} × {item.quantity}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-lg font-bold text-teal-700">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                <button onClick={() => removeFromCart(item.id)} className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline">
                                    Remover
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-stone-200/80 p-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <button onClick={clearCart} className="text-stone-500 hover:text-red-600 font-medium text-sm transition-colors">
                    Limpar carrinho
                </button>
                <div className="flex flex-col sm:items-end gap-3">
                    <p className="text-xl font-bold text-stone-800">Total: <span className="text-teal-700">R$ {getCartTotal().toFixed(2)}</span></p>
                    {user ? (
                        <Link to="/checkout" className="inline-flex justify-center font-semibold bg-teal-600 hover:bg-teal-700 text-white py-3 px-8 rounded-xl shadow-lg shadow-teal-900/20 transition-all">
                            Ir para pagamento
                        </Link>
                    ) : (
                        <p className="text-sm text-stone-600">
                            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">Fazer login</Link> para finalizar a compra.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartPage;
