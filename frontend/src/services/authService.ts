import api from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, User, ActivityLog } from '../types';

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

    async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
        const response = await api.put<{ message: string }>('/auth/me/password', {
            current_password: currentPassword,
            new_password: newPassword,
        });
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

    async getActivityLogs(filters?: { 
        skip?: number; 
        limit?: number; 
        action?: string; 
        resource?: string; 
        username?: string; 
    }): Promise<ActivityLog[]> {
        const params = new URLSearchParams();
        if (filters?.skip !== undefined) params.append('skip', filters.skip.toString());
        if (filters?.limit !== undefined) params.append('limit', filters.limit.toString());
        if (filters?.action) params.append('action', filters.action);
        if (filters?.resource) params.append('resource', filters.resource);
        if (filters?.username) params.append('username', filters.username);
        
        const response = await api.get<ActivityLog[]>(`/auth/logs?${params.toString()}`);
        return response.data;
    },
};
