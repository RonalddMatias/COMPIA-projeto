import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login({ username, password });
            navigate('/products');
        } catch (err: unknown) {
            alert('Usuário ou senha incorretos. Por favor, verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-stone-200/80 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-8 text-center">
                        <h2 className="text-2xl font-bold text-white">COMPIA Editora</h2>
                        <p className="mt-2 text-teal-100 text-sm">Faça login para acessar a plataforma</p>
                    </div>
                    <form className="p-8 space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-stone-700 mb-1.5">Usuário</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                                placeholder="Seu usuário"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-stone-700 mb-1.5">Senha</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                                placeholder="Sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60 transition-all shadow-lg shadow-teal-900/20"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                        <div className="text-center space-y-2 pt-2">
                            <Link to="/register" className="block font-medium text-teal-600 hover:text-teal-700">
                                Não tem conta? Registre-se
                            </Link>
                            <Link to="/products" className="block text-sm text-stone-500 hover:text-stone-700">
                                Voltar ao catálogo
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
