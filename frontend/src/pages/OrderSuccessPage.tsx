import { Link } from 'react-router-dom';

const OrderSuccessPage = () => (
    <div className="max-w-lg mx-auto text-center py-12">
        <div className="bg-white rounded-2xl shadow-md border border-stone-200/80 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-10 text-white">
                <h2 className="text-2xl font-bold mb-2">Pedido realizado!</h2>
                <p className="text-emerald-100 text-sm">Pagamento realizado com sucesso. Obrigado pela compra.</p>
            </div>
            <div className="p-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/products" className="inline-flex justify-center font-semibold bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-xl transition-all">
                    Continuar comprando
                </Link>
                <Link to="/dashboard" className="inline-flex justify-center font-semibold text-teal-600 hover:text-teal-700 py-3 px-6">
                    Ir ao Dashboard
                </Link>
            </div>
        </div>
    </div>
);

export default OrderSuccessPage;
