import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Layout = () => {
    const { cartItems, cartMessage } = useCart();
    const { user, logout, isEditor, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/products');
    };

    const getRoleBadge = (role: UserRole) => {
        const badges = {
            [UserRole.ADMIN]: 'bg-amber-400/20 text-amber-800 border border-amber-300/50',
            [UserRole.VENDEDOR]: 'bg-emerald-400/20 text-emerald-800 border border-emerald-300/50',
            [UserRole.CLIENTE]: 'bg-stone-200/80 text-stone-700 border border-stone-300/50',
        };
        const labels = {
            [UserRole.ADMIN]: 'Admin',
            [UserRole.VENDEDOR]: 'Vendedor',
            [UserRole.CLIENTE]: 'Cliente',
        };
        return (
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badges[role]}`}>
                {labels[role]}
            </span>
        );
    };

    const navLinkClass = "text-teal-100/90 hover:text-white font-medium text-sm transition-colors py-2 px-3 rounded-lg hover:bg-white/10";
    const navLinkClassActive = "text-white bg-white/15";

    return (
        <div className="min-h-screen flex flex-col">
            {cartMessage && (
                <div className="sticky top-0 z-50 bg-teal-600 text-white text-center py-3 px-4 text-sm font-medium shadow-lg border-b border-teal-700/50">
                    ✓ {cartMessage}
                </div>
            )}
            <header className="bg-gradient-to-r from-teal-700 via-teal-600 to-teal-700 text-white shadow-xl border-b border-teal-800/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <Link to="/products" className="flex items-center gap-2">
                            <span className="text-2xl font-bold tracking-tight">COMPIA Editora</span>
                        </Link>

                        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
                            {user && (
                                <>
                                    <Link to="/dashboard" className={navLinkClass}>Dashboard</Link>
                                    <Link to="/orders" className={navLinkClass}>Meus pedidos</Link>
                                </>
                            )}
                            <Link to="/products" className={navLinkClass}>Produtos</Link>
                            <Link to="/categories" className={navLinkClass}>Categorias</Link>
                            {isAdmin && (
                                <Link to="/users" className={navLinkClass}>Usuários</Link>
                            )}
                            <Link to="/cart" className="flex items-center gap-1.5 font-medium text-sm py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                                Carrinho
                                {cartItems.length > 0 && (
                                    <span className="bg-amber-400 text-teal-900 rounded-full min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center text-xs font-bold">
                                        {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                    </span>
                                )}
                            </Link>
                        </nav>

                        <div className="flex items-center gap-3">
                            {user ? (
                                <>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-semibold text-white">{user.username}</div>
                                        <div className="text-xs text-teal-200">{user.email}</div>
                                    </div>
                                    {user.role !== UserRole.CLIENTE && getRoleBadge(user.role)}
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm font-medium text-teal-100 hover:text-white py-2 px-4 rounded-lg border border-white/30 hover:bg-white/10 transition-colors"
                                    >
                                        Sair
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="inline-flex items-center font-semibold text-sm bg-white text-teal-700 py-2 px-5 rounded-lg hover:bg-teal-50 shadow-md transition-all"
                                >
                                    Entrar
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            <footer className="mt-auto bg-stone-800 text-stone-300 border-t border-stone-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <span className="font-semibold text-white text-lg">COMPIA Editora</span>
                        <p className="text-sm">© 2026 COMPIA Editora. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
