import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, categoryService } from '../services/dataService';
import { ProductType } from '../types';
import type { Category } from '../types';


const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        stock_quantity: '',
        category_id: '',
        product_type: ProductType.PHYSICAL as ProductType,
        image_url: '',
        download_url: ''
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const categoriesData = await categoryService.getAll();
                setCategories(categoriesData);

                if (isEditMode) {
                    const product = await productService.get(Number(id));
                    setFormData({
                        title: product.title,
                        description: product.description,
                        price: String(product.price),
                        stock_quantity: String(product.stock_quantity),
                        category_id: String(product.category_id),
                        product_type: product.product_type,
                        image_url: product.image_url || '',
                        download_url: product.download_url || ''
                    });
                } else if (categoriesData.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: String(categoriesData[0].id) }));
                }
            } catch (err) {
                console.error("Failed to load data", err);
                setError("Erro ao carregar dados.");
            }
        };
        loadInitialData();
    }, [id, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity),
                category_id: parseInt(formData.category_id),
                download_url: formData.download_url?.trim() || undefined
            };

            if (isEditMode) {
                await productService.update(Number(id), productData);
            } else {
                await productService.create(productData);
            }
            navigate('/products');
        } catch (err) {
            console.error(err);
            setError("Erro ao salvar produto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-stone-800 mb-8">{isEditMode ? 'Editar Produto' : 'Novo Produto'}</h2>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-6 font-medium">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-2xl shadow-md border border-stone-200/80">
                <div>
                    <label className="block text-sm font-medium text-stone-700">Título</label>
                    <input type="text" name="title" required value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-stone-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-700">Descrição</label>
                    <textarea name="description" required value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-xl border border-stone-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Preço</label>
                        <input type="number" name="price" step="0.01" required value={formData.price} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-stone-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Estoque</label>
                        <input type="number" name="stock_quantity" required value={formData.stock_quantity} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-stone-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Categoria</label>
                        <select name="category_id" value={formData.category_id} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-stone-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                            <option value="">Selecione...</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Tipo</label>
                        <select name="product_type" value={formData.product_type} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-stone-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                            <option value={ProductType.PHYSICAL}>Físico</option>
                            <option value={ProductType.DIGITAL}>Digital</option>
                            <option value={ProductType.KIT}>Kit</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-700">URL da Imagem</label>
                    <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-stone-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                </div>
                {formData.product_type === ProductType.DIGITAL && (
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Link de download (e-book)</label>
                        <input type="url" name="download_url" placeholder="https://..." value={formData.download_url} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-stone-300 py-2.5 px-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                        <p className="mt-1 text-xs text-stone-500">Este link será enviado ao cliente após a compra do e-book.</p>
                    </div>
                )}
                <div className="flex justify-end pt-4 gap-3">
                    <button type="button" onClick={() => navigate('/products')} className="py-2.5 px-5 border border-stone-300 rounded-xl text-stone-700 font-medium hover:bg-stone-50">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md disabled:opacity-50">
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
