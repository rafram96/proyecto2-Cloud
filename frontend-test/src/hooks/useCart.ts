import { useState, useEffect } from 'react';
import type { Product } from '../types/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UseCartReturn {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productCode: string) => void;
  updateQuantity: (productCode: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  isInCart: (productCode: string) => boolean;
}

const CART_STORAGE_KEY = 'ecommerce_cart';

export const useCart = (): UseCartReturn => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      }
    } catch (error) {
      console.error('Error cargando carrito desde localStorage:', error);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error guardando carrito en localStorage:', error);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.codigo === product.codigo);
      
      if (existingItem) {
        // Si el producto ya existe, actualizar cantidad
        return currentItems.map(item =>
          item.product.codigo === product.codigo
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Si es nuevo producto, agregarlo
        return [...currentItems, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productCode: string) => {
    setItems(currentItems => 
      currentItems.filter(item => item.product.codigo !== productCode)
    );
  };

  const updateQuantity = (productCode: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productCode);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.product.codigo === productCode
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => {
      const price = typeof item.product.precio === 'string' 
        ? parseFloat(item.product.precio) 
        : item.product.precio;
      return total + (price * item.quantity);
    }, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (productCode: string) => {
    return items.some(item => item.product.codigo === productCode);
  };

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    isInCart
  };
};
