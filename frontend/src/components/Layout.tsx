import { Link, Outlet } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Layout = () => {
    const { cartItems } = useCart();
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">COMPIA Admin</h1>
                    <nav className="flex space-x-4">
                        <Link to="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                        <Link to="/products" className="text-gray-600 hover:text-gray-900">Produtos</Link>
                        <Link to="/categories" className="text-gray-600 hover:text-gray-900">Categorias</Link>
                        <Link to="/cart" className="text-gray-600 hover:text-gray-900 flex items-center">
                            Carrinho
                            {cartItems.length > 0 && (
                                <span className="ml-1 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                </span>
                            )}
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
                    &copy; 2026 COMPIA Editora.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
