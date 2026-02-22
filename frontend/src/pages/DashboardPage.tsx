import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../services/authService';

const DashboardPage = () => {
    const { user, isEditor, isAdmin } = useAuth();
    const { cartItems } = useCart();
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await authService.changePassword(currentPassword, newPassword);
            setPasswordSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setShowPasswordForm(false);
                setPasswordSuccess('');
            }, 2000);
        } catch (err: any) {
            setPasswordError(err.response?.data?.detail || 'Error changing password');
        } finally {
            setLoading(false);
        }
    };


    if (!user) {
        return (
            <div className="text-center py-16">
                <div className="bg-white rounded-2xl shadow-md border border-stone-200/80 p-12 max-w-md mx-auto">
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">Bem-vindo à COMPIA Editora</h2>
                    <p className="text-stone-500 mb-6">Faça login para acessar seu dashboard.</p>
                    <Link to="/login" className="inline-flex font-semibold text-teal-600 hover:text-teal-700">
                        Fazer login
                    </Link>
                </div>
            </div>
        );
    }

    const cardClass = "bg-white rounded-2xl shadow-md border border-stone-200/80 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-4";
    const iconClass = "h-10 w-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0";

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-stone-800">Dashboard</h2>
                <p className="mt-1 text-stone-500">Bem-vindo de volta, {user.username}!</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link to="/products" className={cardClass}>
                    <div className={iconClass}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-500">Produtos</p>
                        <p className="text-lg font-semibold text-stone-800">Ver catálogo</p>
                    </div>
                </Link>
                <Link to="/cart" className={cardClass}>
                    <div className={iconClass}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-500">Carrinho</p>
                        <p className="text-lg font-semibold text-stone-800">{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</p>
                    </div>
                </Link>
                {isEditor && (
                    <Link to="/categories" className={cardClass}>
                        <div className={iconClass}>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-500">Categorias</p>
                            <p className="text-lg font-semibold text-stone-800">Gerenciar</p>
                        </div>
                    </Link>
                )}
                {isAdmin && (
                    <Link to="/users" className={cardClass}>
                        <div className={iconClass}>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-500">Usuários</p>
                            <p className="text-lg font-semibold text-stone-800">Gerenciar</p>
                        </div>
                    </Link>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-stone-200/80 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-stone-800">Suas informações</h3>
                    <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                        {showPasswordForm ? 'Cancelar' : 'Alterar senha'}
                    </button>
                </div>

                {showPasswordForm ? (
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {passwordError && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">{passwordError}</div>}
                        {passwordSuccess && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">{passwordSuccess}</div>}
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Senha atual</label>
                            <input type="password" required className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Nova senha</label>
                            <input type="password" required minLength={6} className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Confirmar nova senha</label>
                            <input type="password" required minLength={6} className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60">
                            {loading ? 'Alterando...' : 'Alterar senha'}
                        </button>
                    </form>
                ) : (
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div><dt className="text-sm font-medium text-stone-500">Usuário</dt><dd className="mt-0.5 font-medium text-stone-800">{user.username}</dd></div>
                        <div><dt className="text-sm font-medium text-stone-500">Email</dt><dd className="mt-0.5 font-medium text-stone-800">{user.email}</dd></div>
                        <div><dt className="text-sm font-medium text-stone-500">Perfil</dt><dd className="mt-0.5 font-medium text-stone-800 capitalize">{user.role.toLowerCase()}</dd></div>
                        <div><dt className="text-sm font-medium text-stone-500">Status</dt><dd className="mt-0.5"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{user.is_active ? 'Ativo' : 'Inativo'}</span></dd></div>
                    </dl>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
