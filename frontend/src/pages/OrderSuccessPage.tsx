import { Link } from 'react-router-dom';

const OrderSuccessPage = () => (
    <div className="max-w-md mx-auto text-center py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-green-800 mb-2">Pedido realizado!</h2>
            <p className="text-green-700 mb-6">
                Pagamento simulado com sucesso. Obrigado pela compra.
            </p>
            <Link
                to="/products"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded mr-2"
            >
                Continuar comprando
            </Link>
            <Link to="/dashboard" className="text-green-600 hover:text-green-800 font-medium">
                Ir ao Dashboard
            </Link>
        </div>
    </div>
);

export default OrderSuccessPage;
