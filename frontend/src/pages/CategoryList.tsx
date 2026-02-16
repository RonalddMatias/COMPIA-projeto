import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../types';
import { categoryService } from '../services/dataService';

const CategoryList = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAll();
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) return <div>Carregando categorias...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Categorias</h2>
                <Link to="/categories/new" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Nova Categoria
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <span className="text-gray-400">Editar (WIP)</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {categories.length === 0 && (
                    <div className="p-4 text-center text-gray-500">Nenhuma categoria encontrada.</div>
                )}
            </div>
        </div>
    );
};

export default CategoryList;
