import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../services/dataService';

const CategoryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isEditMode) {
            const fetchCategory = async () => {
                try {
                    // We fetch all and find because we don't have getById yet.
                    // This is acceptable for now.
                    const categories = await categoryService.getAll();
                    const category = categories.find(c => c.id === Number(id));
                    if (category) {
                        setName(category.name);
                        setImageUrl(category.image_url || '');
                        setDescription(category.description || '');
                    }
                } catch (error) {
                    console.error("Failed to fetch category:", error);
                }
            };
            fetchCategory();
        }
    }, [isEditMode, id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await categoryService.update(Number(id), { name, image_url: imageUrl, description });
                alert("Categoria atualizada com sucesso!");
            } else {
                await categoryService.create({ name, image_url: imageUrl, description });
                alert("Categoria criada com sucesso!");
            }
            navigate('/categories');
        } catch (error) {
            console.error("Failed to save category:", error);
            alert("Erro ao salvar categoria.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-stone-800 mb-8">{isEditMode ? 'Editar Categoria' : 'Nova Categoria'}</h2>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-md border border-stone-200/80 p-8">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-stone-700">Nome</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-stone-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-stone-700">URL da Imagem de Capa</label>
                    <input type="url" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://exemplo.com/imagem.jpg" className="mt-1 block w-full border border-stone-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-stone-700">Descrição</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border border-stone-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={() => navigate('/categories')} className="bg-white py-2.5 px-5 border border-stone-300 rounded-xl text-stone-700 font-medium hover:bg-stone-50 focus:ring-2 focus:ring-teal-500">
                        Cancelar
                    </button>
                    <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md focus:ring-2 focus:ring-teal-500">
                        Salvar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;
