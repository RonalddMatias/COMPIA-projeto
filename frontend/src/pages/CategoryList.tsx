import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../types';
import { categoryService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';

const CategoryList = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { isEditor } = useAuth();

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

    const handleDelete = async (id: number) => {
        if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
            try {
                await categoryService.delete(id);
                setCategories(categories.filter(c => c.id !== id));
            } catch (error: any) {
                console.error("Failed to delete category:", error);
                const message = error.response?.data?.detail || "Erro ao excluir categoria.";
                alert(message);
            }
        }
    };

    if (loading) return (
        <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-stone-800">Categorias</h2>
                {isEditor && (
                    <Link to="/categories/new" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md">
                        Nova Categoria
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <div key={category.id} className="bg-white overflow-hidden rounded-2xl shadow-md border border-stone-200/80 flex flex-col p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative group">
                        {isEditor && (
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDelete(category.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full" title="Excluir Categoria">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        <div className="h-40 w-full bg-stone-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                            {category.image_url ? (
                                <img src={category.image_url} alt={category.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-stone-400 text-sm">Sem imagem</span>
                            )}
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-stone-800 mb-2">{category.name}</h3>
                            <p className="text-sm text-stone-500 mb-4 line-clamp-2">{category.description || "Sem descrição"}</p>
                        </div>
                        <div className="mt-4 flex space-x-3">
                            <Link to={`/products?category_id=${category.id}`} className="flex-1 text-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-4 rounded-xl">
                                Ver Produtos
                            </Link>
                            {isEditor && (
                                <Link to={`/categories/edit/${category.id}`} className="flex-1 text-center bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-2.5 px-4 rounded-xl">
                                    Editar
                                </Link>
                            )}
                        </div>
                    </div>
                ))}

                {categories.length === 0 && (
                    <div className="col-span-full p-12 text-center text-stone-500 bg-white rounded-2xl shadow-md border border-stone-200/80">
                        <p className="text-lg font-medium">Nenhuma categoria encontrada.</p>
                        <p className="text-sm mt-2">Clique em "Nova Categoria" para começar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryList;
