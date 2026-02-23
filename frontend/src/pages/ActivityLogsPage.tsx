import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { ActivityLog } from '../types';

const ActivityLogsPage = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filtros
    const [actionFilter, setActionFilter] = useState('');
    const [resourceFilter, setResourceFilter] = useState('');
    const [usernameFilter, setUsernameFilter] = useState('');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async (filters?: { action?: string; resource?: string; username?: string }) => {
        try {
            setLoading(true);
            // Se filters foi passado, usa os valores dele (mesmo que sejam vazios)
            // Caso contrário, usa os estados atuais
            const data = await authService.getActivityLogs({
                limit: 100,
                action: filters !== undefined ? (filters.action || undefined) : (actionFilter || undefined),
                resource: filters !== undefined ? (filters.resource || undefined) : (resourceFilter || undefined),
                username: filters !== undefined ? (filters.username || undefined) : (usernameFilter || undefined),
            });
            setLogs(data);
            setError('');
        } catch (err: any) {
            setError('Erro ao carregar logs de atividade');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        loadLogs();
    };

    const handleClearFilters = () => {
        setActionFilter('');
        setResourceFilter('');
        setUsernameFilter('');
        // Passa filtros vazios explicitamente para carregar todos os logs
        loadLogs({ action: '', resource: '', username: '' });
    };

    const getActionBadge = (action: string) => {
        const badges: Record<string, string> = {
            'LOGIN': 'bg-blue-100 text-blue-800',
            'LOGOUT': 'bg-gray-100 text-gray-800',
            'REGISTER': 'bg-green-100 text-green-800',
            'CREATE': 'bg-emerald-100 text-emerald-800',
            'UPDATE': 'bg-amber-100 text-amber-800',
            'DELETE': 'bg-red-100 text-red-800',
            'UPDATE_ROLE': 'bg-purple-100 text-purple-800',
            'ACTIVATE': 'bg-teal-100 text-teal-800',
            'DEACTIVATE': 'bg-orange-100 text-orange-800',
            'CHECKOUT': 'bg-indigo-100 text-indigo-800',
        };
        return badges[action] || 'bg-gray-100 text-gray-800';
    };

    const getResourceBadge = (resource?: string) => {
        if (!resource) return 'bg-gray-50 text-gray-600';
        const badges: Record<string, string> = {
            'USER': 'bg-blue-50 text-blue-700',
            'PRODUCT': 'bg-green-50 text-green-700',
            'CATEGORY': 'bg-purple-50 text-purple-700',
            'ORDER': 'bg-indigo-50 text-indigo-700',
        };
        return badges[resource] || 'bg-gray-50 text-gray-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center">
                <div className="text-gray-600">Carregando logs...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Logs de Atividade</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Registro de todas as ações realizadas no sistema
                </p>
            </div>

            {/* Filtros */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Ação</label>
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Todas</option>
                            <option value="LOGIN">Login</option>
                            <option value="LOGOUT">Logout</option>
                            <option value="REGISTER">Registro</option>
                            <option value="CREATE">Criar</option>
                            <option value="UPDATE">Atualizar</option>
                            <option value="DELETE">Deletar</option>
                            <option value="UPDATE_ROLE">Alterar Role</option>
                            <option value="ACTIVATE">Ativar</option>
                            <option value="DEACTIVATE">Desativar</option>
                            <option value="CHECKOUT">Checkout</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Recurso</label>
                        <select
                            value={resourceFilter}
                            onChange={(e) => setResourceFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Todos</option>
                            <option value="USER">Usuário</option>
                            <option value="PRODUCT">Produto</option>
                            <option value="CATEGORY">Categoria</option>
                            <option value="ORDER">Pedido</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Usuário</label>
                        <input
                            type="text"
                            value={usernameFilter}
                            onChange={(e) => setUsernameFilter(e.target.value)}
                            placeholder="Nome do usuário"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <button
                            onClick={handleFilter}
                            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                        >
                            Filtrar
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
                        >
                            Limpar
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Tabela de Logs */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data/Hora
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ação
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Recurso
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Detalhes
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className="font-medium text-gray-900">
                                            {log.username || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadge(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${getResourceBadge(log.resource)}`}>
                                            {log.resource || '-'}
                                            {log.resource_id && ` #${log.resource_id}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="max-w-md truncate" title={log.details || undefined}>
                                            {log.details || '-'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {logs.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow mt-4">
                    <p className="text-gray-500">Nenhum log encontrado.</p>
                </div>
            )}

            <div className="mt-4 text-sm text-gray-600">
                Total de logs: {logs.length}
            </div>
        </div>
    );
};

export default ActivityLogsPage;
