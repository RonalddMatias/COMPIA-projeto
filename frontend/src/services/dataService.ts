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
};

export type PaymentMethod = 'CARD' | 'PIX';
export type DeliveryType = 'SHIPPING' | 'PICKUP' | 'DIGITAL';

export interface ShippingAddressInput {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
}

export const orderService = {
    checkout: async (
        items: { product_id: number; quantity: number }[],
        payment_method: PaymentMethod,
        delivery_type: DeliveryType,
        shipping_address?: ShippingAddressInput
    ) => {
        const response = await api.post<{ order_id: number; message: string; total_amount: number }>(
            '/orders/checkout',
            { items, payment_method, delivery_type, shipping_address: shipping_address ?? null }
        );
        return response.data;
    },
    list: async () => {
        const response = await api.get<OrderDetail[]>('/orders/');
        return response.data;
    },
    get: async (id: number) => {
        const response = await api.get<OrderDetail>(`/orders/${id}`);
        return response.data;
    },
};

export interface OrderItemResponse {
    product_id: number;
    product_title?: string;
    quantity: number;
    unit_price: number;
    download_url?: string;
}

export interface OrderDetail {
    id: number;
    total_amount: number;
    payment_method: string;
    delivery_type: string;
    shipping_address?: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zip: string;
    } | null;
    created_at: string;
    items: OrderItemResponse[];
}

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
