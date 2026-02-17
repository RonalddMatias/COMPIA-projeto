import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { productService } from '../services/dataService';
import { useCart } from '../context/CartContext';

const ProductList = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productService.getAll();
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

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

    if (loading) return <div>Carregando produtos...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Produtos</h2>
                <Link to="/products/new" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Novo Produto
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
                        <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-gray-400">Sem imagem</span>
                            )}
                        </div>
                        <div className="px-4 py-5 sm:p-6 flex-grow flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">{product.title}</h3>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {product.stock_quantity > 0 ? 'Em Estoque' : 'Esgotado'}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                                <div className="mt-2 text-sm text-gray-900 font-semibold">
                                    R$ {product.price.toFixed(2)}
                                </div>
                                <div className="mt-1 text-xs text-cool-gray-500">
                                    Tipo: {product.product_type}
                                </div>
                                <div className="mt-2 text-right">
                                    <button
                                        onClick={() => addToCart(product)}
                                        disabled={product.stock_quantity === 0}
                                        className={`text-sm px-3 py-1 rounded-full font-medium ${product.stock_quantity > 0
                                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {product.stock_quantity > 0 ? '+ Carrinho' : 'Esgotado'}
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 flex space-x-2">
                                <Link
                                    to={`/products/${product.id}`}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Editar
                                </Link>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="col-span-full p-12 text-center text-gray-500">
                        <p className="text-lg">Nenhum produto encontrado.</p>
                        <p className="text-sm">Clique em "Novo Produto" para começar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
