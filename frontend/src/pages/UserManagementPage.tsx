import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { UserRole } from '../types';
import type { User } from '../types';

const UserManagementPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
        try {
            await authService.updateUserRole(userId, newRole);
            await loadUsers();
        } catch (err: any) {
            alert('Erro ao alterar role: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleToggleActive = async (user: User) => {
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
            [UserRole.EDITOR]: 'bg-blue-100 text-blue-800',
            [UserRole.VENDEDOR]: 'bg-green-100 text-green-800',
            [UserRole.CLIENTE]: 'bg-gray-100 text-gray-800',
        };
        return badges[role] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center">
                <div className="text-gray-600">Carregando usuários...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Gerencie roles e status dos usuários da plataforma
                </p>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuário
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Criado em
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className={`text-xs font-semibold rounded-full px-3 py-1 ${getRoleBadge(user.role)}`}
                                    >
                                        <option value={UserRole.CLIENTE}>Cliente</option>
                                        <option value={UserRole.VENDEDOR}>Vendedor</option>
                                        <option value={UserRole.EDITOR}>Editor</option>
                                        <option value={UserRole.ADMIN}>Admin</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {user.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => handleToggleActive(user)}
                                        className={`${
                                            user.is_active
                                                ? 'text-red-600 hover:text-red-900'
                                                : 'text-green-600 hover:text-green-900'
                                        }`}
                                    >
                                        {user.is_active ? 'Desativar' : 'Ativar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-sm text-gray-600">
                Total de usuários: {users.length}
            </div>
        </div>
    );
};

export default UserManagementPage;
