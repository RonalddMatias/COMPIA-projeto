export interface Category {
    id: number;
    name: string;
    image_url?: string;
    description?: string;
}

export const ProductType = {
    PHYSICAL: "PHYSICAL",
    DIGITAL: "DIGITAL",
    KIT: "KIT"
} as const;

export type ProductType = typeof ProductType[keyof typeof ProductType];

export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    stock_quantity: number;
    image_url?: string;
    product_type: ProductType;
    category_id: number;
    category?: Category;
    created_at: string;
    updated_at?: string;
}

export interface ProductCreate {
    title: string;
    description: string;
    price: number;
    stock_quantity: number;
    image_url?: string;
    product_type: ProductType;
    category_id: number;
}
