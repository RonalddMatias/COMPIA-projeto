import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
    const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart();
    const { user } = useAuth();

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio.</h2>
                <Link to={user ? "/products" : "/login"} className="text-blue-600 hover:text-blue-800">
                    {user ? 'Voltar para a loja' : 'Faça login na sua conta'}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Carrinho de Compras</h2>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                        <li key={item.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center">
                                {item.image_url && (
                                    <img src={item.image_url} alt={item.title} className="h-16 w-16 object-cover rounded mr-4" />
                                )}
                                <div>
                                    <p className="text-lg font-medium text-gray-900">{item.title}</p>
                                    <p className="text-sm text-gray-500">
                                        R$ {item.price.toFixed(2)} x {item.quantity}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <p className="text-lg font-bold text-gray-900 mr-4">
                                    R$ {(item.price * item.quantity).toFixed(2)}
                                </p>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-600 hover:text-red-800 font-medium"
                                >
                                    Remover
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-6 rounded-lg">
                <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 font-medium"
                >
                    Limpar Carrinho
                </button>
                <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 mb-2">
                        Total: R$ {getCartTotal().toFixed(2)}
                    </p>
                    {user ? (
                        <Link
                            to="/checkout"
                            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded shadow"
                        >
                            Ir para pagamento
                        </Link>
                    ) : (
                        <p className="text-sm text-gray-600">
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Faça login</Link> para finalizar a compra.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartPage;
