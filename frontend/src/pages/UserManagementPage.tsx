import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { UserRole } from '../types';
import type { User } from '../types';
import { useAuth } from '../context/AuthContext';

const UserManagementPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user: currentUser } = useAuth();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await authService.getAllUsers();
            setUsers(data);
            setError('');
        } catch (err: any) {
            setError('Erro ao carregar usuários');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        // Previne que o admin altere sua própria role
        if (currentUser && userId === currentUser.id) {
            alert('Você não pode alterar sua própria role!');
            return;
        }
        
        try {
            await authService.updateUserRole(userId, newRole);
            await loadUsers();
        } catch (err: any) {
            alert('Erro ao alterar role: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleToggleActive = async (user: User) => {
        // Previne que o admin desative sua própria conta
        if (currentUser && user.id === currentUser.id) {
            alert('Você não pode desativar sua própria conta!');
            return;
        }
        
        try {
            if (user.is_active) {
                await authService.deactivateUser(user.id);
            } else {
                await authService.activateUser(user.id);
            }
            await loadUsers();
        } catch (err: any) {
            alert('Erro ao alterar status: ' + (err.response?.data?.detail || err.message));
        }
    };

    const getRoleBadge = (role: UserRole) => {
        const badges = {
            [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
            [UserRole.VENDEDOR]: 'bg-green-100 text-green-800',
            [UserRole.CLIENTE]: 'bg-gray-100 text-gray-800',
        };
        return badges[role] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-stone-800">Gerenciamento de Usuários</h2>
                <p className="mt-1 text-sm text-stone-500">Gerencie roles e status dos usuários da plataforma</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-medium">{error}</div>
            )}

            <div className="bg-white shadow-md overflow-hidden rounded-2xl border border-stone-200/80">
                <table className="min-w-full divide-y divide-stone-200">
                    <thead className="bg-stone-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">Usuário</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">Criado em</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-stone-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-stone-50/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-stone-800">{user.username}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-stone-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        disabled={currentUser?.id === user.id}
                                        className={`text-xs font-semibold rounded-full px-3 py-1 ${getRoleBadge(user.role)} ${currentUser?.id === user.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <option value={UserRole.CLIENTE}>Cliente</option>
                                        <option value={UserRole.VENDEDOR}>Vendedor</option>
                                        <option value={UserRole.ADMIN}>Admin</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {currentUser?.id === user.id ? (
                                        <span className="text-stone-400 italic">Você</span>
                                    ) : (
                                        <button
                                            onClick={() => handleToggleActive(user)}
                                            className={user.is_active ? 'text-red-600 hover:text-red-700 font-medium' : 'text-teal-600 hover:text-teal-700 font-medium'}
                                        >
                                            {user.is_active ? 'Desativar' : 'Ativar'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-sm text-stone-500 font-medium">Total de usuários: {users.length}</div>
        </div>
    );
};

export default UserManagementPage;
