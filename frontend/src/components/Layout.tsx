import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Layout = () => {
    const { cartItems } = useCart();
    const { user, logout, isEditor, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/products');
    };

    const getRoleBadge = (role: UserRole) => {
        const badges = {
            [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
            [UserRole.VENDEDOR]: 'bg-green-100 text-green-800',
            [UserRole.CLIENTE]: 'bg-gray-100 text-gray-800',
        };
        const labels = {
            [UserRole.ADMIN]: 'Admin',
            [UserRole.VENDEDOR]: 'Vendedor',
            [UserRole.CLIENTE]: 'Cliente',
        };
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[role]}`}>
                {labels[role]}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold text-gray-900">COMPIA Editora</h1>
                        
                        <div className="flex items-center space-x-6">
                            <nav className="flex space-x-4 items-center">
                                {user && (
                                    <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                                )}
                                
                                <Link to="/products" className="text-gray-600 hover:text-gray-900">Produtos</Link>
                                
                                <Link to="/categories" className="text-gray-600 hover:text-gray-900">Categorias</Link>
                                
                                {isAdmin && (
                                    <Link to="/users" className="text-gray-600 hover:text-gray-900">Usuários</Link>
                                )}
                                
                                <Link to="/cart" className="text-gray-600 hover:text-gray-900 flex items-center">
                                    Carrinho
                                    {cartItems.length > 0 && (
                                        <span className="ml-1 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                                            {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                        </span>
                                    )}
                                </Link>
                            </nav>

                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                    {user.role !== UserRole.CLIENTE && getRoleBadge(user.role)}
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Sair
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Faça seu login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
                    &copy; 2026 COMPIA Editora. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
};

export default Layout;

