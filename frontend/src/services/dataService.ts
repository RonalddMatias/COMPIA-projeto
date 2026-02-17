import api from './api';
import type { Product, ProductCreate, Category } from '../types';

export const productService = {
    getAll: async (categoryId?: number) => {
        const params = categoryId ? { category_id: categoryId } : {};
        const response = await api.get<Product[]>('/products/', { params });
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
    },
    delete: async (id: number) => {
        await api.delete(`/products/${id}`);
    },
    checkout: async (items: { product_id: number; quantity: number }[]) => {
        const response = await api.post('/orders/checkout', { items });
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
    },
    update: async (id: number, data: Omit<Category, 'id'>) => {
        const response = await api.put<Category>(`/categories/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/categories/${id}`);
    }
};
