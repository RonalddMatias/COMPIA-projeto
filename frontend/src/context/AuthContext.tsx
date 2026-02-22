import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginRequest, RegisterRequest } from '../types';
import type { UserRole as UserRoleType } from '../types';
import { UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    hasRole: (roles: UserRoleType[]) => boolean;
    isAdmin: boolean;
    isEditor: boolean;
    isVendedor: boolean;
    isCliente: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Carrega usuário do localStorage ao iniciar
        const loadUser = async () => {
            const token = authService.getToken();
            if (token) {
                try {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (error) {
                    console.error('Erro ao carregar usuário:', error);
                    authService.logout();
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            const authResponse = await authService.login(credentials);
            localStorage.setItem('token', authResponse.access_token);

            // Busca dados do usuário
            const userData = await authService.getCurrentUser();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            await authService.register(data);
            // Após registro, faz login automaticamente
            await login({ username: data.username, password: data.password });
        } catch (error) {
            console.error('Erro no registro:', error);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const hasRole = (roles: UserRoleType[]): boolean => {
        return user ? roles.includes(user.role) : false;
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        hasRole,
        isAdmin: user?.role === UserRole.ADMIN,
        isEditor: user?.role === UserRole.EDITOR || user?.role === UserRole.ADMIN,
        isVendedor: user?.role === UserRole.VENDEDOR || user?.role === UserRole.EDITOR || user?.role === UserRole.ADMIN,
        isCliente: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
