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
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Bem-vindo à COMPIA Editora</h2>
                <p className="text-gray-600 mb-6">Faça login para acessar seu dashboard</p>
                <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    Fazer login
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Bem-vindo de volta, {user.username}!
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Card de Produtos */}
                <Link
                    to="/products"
                    className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                >
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Produtos
                                    </dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            Ver catálogo
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Card de Carrinho */}
                <Link
                    to="/cart"
                    className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                >
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Carrinho
                                    </dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Card de Categorias (apenas Editor/Admin) */}
                {isEditor && (
                    <Link
                        to="/categories"
                        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                    >
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Categorias
                                        </dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">
                                                Gerenciar
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Card de Usuários (apenas Admin) */}
                {isAdmin && (
                    <Link
                        to="/users"
                        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                    >
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Usuários
                                        </dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">
                                                Gerenciar
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}
            </div>

            {/* Informações do usuário */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Suas Informações</h3>
                    <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        {showPasswordForm ? 'Cancel' : 'Change Password'}
                    </button>
                </div>

                {showPasswordForm ? (
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {passwordError && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="text-sm text-red-800">{passwordError}</div>
                            </div>
                        )}
                        {passwordSuccess && (
                            <div className="rounded-md bg-green-50 p-4">
                                <div className="text-sm text-green-800">{passwordSuccess}</div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                                Current Password
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                required
                                minLength={6}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Nome de usuário</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.username}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Perfil</dt>
                        <dd className="mt-1 text-sm text-gray-900 capitalize">{user.role.toLowerCase()}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {user.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                        </dd>
                    </div>
                </dl>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
