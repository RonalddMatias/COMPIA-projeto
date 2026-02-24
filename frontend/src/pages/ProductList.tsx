import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Product } from '../types';
import { productService } from '../services/dataService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductList = () => {
    const { addToCart } = useCart();
    const { isEditor } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const categoryId = searchParams.get('category_id');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const id = categoryId ? Number(categoryId) : undefined;
                const data = await productService.getAll(id);
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [categoryId]);

    const handleDelete = async (id: number) => {
        if (window.confirm("Tem certeza que deseja excluir este produto?")) {
            try {
                await productService.delete(id);
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                console.error("Failed to delete product:", error);
                alert("Erro ao excluir produto.");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-600 rounded-full animate-spin" />
                    <p className="text-stone-500 font-medium">Carregando produtos...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-stone-800">Catálogo</h2>
                    {categoryId && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-stone-500">
                            <span>Filtrando por categoria (ID: {categoryId})</span>
                            <Link to="/products" className="text-teal-600 hover:text-teal-700 font-medium underline underline-offset-2">
                                Limpar
                            </Link>
                        </div>
                    )}
                </div>
                {isEditor && (
                    <Link
                        to="/products/new"
                        className="inline-flex items-center justify-center font-semibold bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-5 rounded-xl shadow-lg shadow-teal-900/20 transition-all"
                    >
                        + Novo produto
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-stone-200/80 flex flex-col transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="relative h-52 w-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                                <span className="text-stone-400 text-sm font-medium">Sem imagem</span>
                            )}
                            <span className={`absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${product.stock_quantity > 0 ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                {product.stock_quantity > 0 ? 'Em estoque' : 'Esgotado'}
                            </span>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                            <h3 className="text-lg font-bold text-stone-800 line-clamp-2 leading-snug">{product.title}</h3>
                            <p className="mt-2 text-sm text-stone-500 line-clamp-2 flex-grow">{product.description}</p>
                            <div className="mt-4 flex items-end justify-between gap-3">
                                <div>
                                    <p className="text-xl font-bold text-teal-700">R$ {product.price.toFixed(2)}</p>
                                    <p className="text-xs text-stone-400 uppercase tracking-wide">{product.product_type}</p>
                                </div>
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock_quantity === 0}
                                    className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${product.stock_quantity > 0
                                        ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg'
                                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                    }`}
                                >
                                    {product.stock_quantity > 0 ? '+ Carrinho' : 'Esgotado'}
                                </button>
                            </div>
                            {isEditor && (
                                <div className="mt-4 pt-4 border-t border-stone-100 flex gap-2">
                                    <Link
                                        to={`/products/${product.id}`}
                                        className="flex-1 text-center py-2 text-sm font-medium rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="flex-1 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="col-span-full py-16 text-center">
                        <p className="text-lg text-stone-500 font-medium">Nenhum produto encontrado.</p>
                        <Link to="/products" className="mt-4 inline-block text-teal-600 hover:text-teal-700 font-semibold">
                            Ver todos
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
