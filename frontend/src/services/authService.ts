import api from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

export const authService = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await api.post<AuthResponse>('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    async register(data: RegisterRequest): Promise<User> {
        const response = await api.post<User>('/auth/register', data);
        return response.data;
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    async getAllUsers(): Promise<User[]> {
        const response = await api.get<User[]>('/auth/users');
        return response.data;
    },

    async updateUserRole(userId: number, role: string): Promise<User> {
        const response = await api.put<User>(`/auth/users/${userId}/role?role=${role}`);
        return response.data;
    },

    async deactivateUser(userId: number): Promise<User> {
        const response = await api.put<User>(`/auth/users/${userId}/deactivate`);
        return response.data;
    },

    async activateUser(userId: number): Promise<User> {
        const response = await api.put<User>(`/auth/users/${userId}/activate`);
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getToken(): string | null {
        return localStorage.getItem('token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    getStoredUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    },
};
