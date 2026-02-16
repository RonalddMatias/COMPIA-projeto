import api from './api';
import type { Product, ProductCreate, Category } from '../types';

export const productService = {
    getAll: async () => {
        const response = await api.get<Product[]>('/products/');
        return response.data;
    },
    create: async (data: ProductCreate) => {
        const response = await api.post<Product>('/products/', data);
        return response.data;
    },
    get: async (id: number) => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },
    update: async (id: number, data: ProductCreate) => {
        const response = await api.put<Product>(`/products/${id}`, data);
        return response.data;
    }
};

export const categoryService = {
    getAll: async () => {
        const response = await api.get<Category[]>('/categories/');
        return response.data;
    },
    create: async (data: Omit<Category, 'id'>) => {
        const response = await api.post<Category>('/categories/', data);
        return response.data;
    }
};
