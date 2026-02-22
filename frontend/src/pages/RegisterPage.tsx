import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }
        setLoading(true);
        try {
            await register({ username, email, password });
            navigate('/products');
        } catch (err: unknown) {
            setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Erro ao registrar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-stone-200/80 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-8 text-center">
                        <h2 className="text-2xl font-bold text-white">Criar conta</h2>
                        <p className="mt-2 text-teal-100 text-sm">Registre-se na COMPIA Editora</p>
                    </div>
                    <form className="p-8 space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                                {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-stone-700 mb-1.5">Usuário</label>
                            <input id="username" name="username" type="text" required className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" placeholder="Seu usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-1.5">Email</label>
                            <input id="email" name="email" type="email" required className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-stone-700 mb-1.5">Senha</label>
                            <input id="password" name="password" type="password" required minLength={6} className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-stone-700 mb-1.5">Confirmar senha</label>
                            <input id="confirmPassword" name="confirmPassword" type="password" required className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" placeholder="Repita a senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3.5 font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60 transition-all shadow-lg shadow-teal-900/20">
                            {loading ? 'Cadastrando...' : 'Cadastrar'}
                        </button>
                        <div className="text-center pt-2 space-y-1">
                            <Link to="/login" className="block font-medium text-teal-600 hover:text-teal-700">Já tem conta? Faça login</Link>
                            <Link to="/products" className="block text-sm text-stone-500 hover:text-stone-700">Voltar ao catálogo</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
