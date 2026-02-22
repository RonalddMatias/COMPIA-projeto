import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types';
import { productService } from '../services/dataService';

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    checkout: () => Promise<void>;
    cartMessage: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : [];
    });
    const [cartMessage, setCartMessage] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Product) => {
        if (product.stock_quantity <= 0) {
            alert("Este produto está esgotado.");
            return;
        }

        setCartItems((prevItems) => {
            const isItemInCart = prevItems.find((item) => item.id === product.id);

            if (isItemInCart) {
                if (isItemInCart.quantity >= product.stock_quantity) {
                    alert("Quantidade solicitada excede o estoque disponível.");
                    return prevItems;
                }
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prevItems, { ...product, quantity: 1 }];
        });

        setCartMessage(`${product.title} adicionado ao carrinho`);
        setTimeout(() => setCartMessage(null), 2500);
    };

    const removeFromCart = (productId: number) => {
        setCartItems((prevItems) =>
            prevItems.reduce((acc, item) => {
                if (item.id === productId) {
                    if (item.quantity === 1) return acc;
                    return [...acc, { ...item, quantity: item.quantity - 1 }];
                }
                return [...acc, item];
            }, [] as CartItem[])
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const checkout = async () => {
        try {
            const items = cartItems.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            }));
            await productService.checkout(items);
            clearCart();
            alert("Compra realizada com sucesso!");
        } catch (error: any) {
            console.error("Checkout failed", error);
            const message = error.response?.data?.detail || "Erro ao finalizar compra.";
            alert(message);
            throw error;
        }
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                clearCart,
                getCartTotal,
                checkout,
                cartMessage,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
