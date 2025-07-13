import { useState, useEffect, useCallback } from 'react';
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
  console.log('🔄 useCart hook instanciado');
  
  const [items, setItems] = useState<CartItem[]>(() => {
    console.log('🔄 useState initializer ejecutándose');
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log('🔄 useCart - datos crudos de localStorage:', parsedCart);
        
        // Eliminar duplicados basados en el código del producto
        const uniqueItems = parsedCart.reduce((acc: CartItem[], current: CartItem) => {
          const existingItem = acc.find(item => item.product.codigo === current.product.codigo);
          if (existingItem) {
            // Si ya existe, sumar las cantidades
            existingItem.quantity += current.quantity;
          } else {
            // Si no existe, agregarlo
            acc.push(current);
          }
          return acc;
        }, []);
        
        console.log('🔄 useCart - inicializando con datos limpios:', uniqueItems);
        return uniqueItems;
      }
      console.log('🔄 useCart - inicializando con array vacío');
      return [];
    } catch (error) {
      console.error('❌ Error cargando carrito desde localStorage:', error);
      return [];
    }
  });

  console.log('🔄 useCart - estado actual items:', items);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    console.log('💾 useCart - useEffect localStorage ejecutándose con items:', items);
    console.log('💾 useCart - guardando en clave:', CART_STORAGE_KEY);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      console.log('💾 useCart - localStorage guardado exitosamente');
    } catch (error) {
      console.error('❌ Error guardando carrito en localStorage:', error);
    }
  }, [items]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    const timestamp = Date.now();
    console.log(`🛒 [${timestamp}] useCart - addToCart llamado con:`, { product, quantity });
    console.log(`🛒 [${timestamp}] useCart - items actuales antes de agregar:`, items);
    
    // ✅ Validar stock antes de agregar
    if (product.stock <= 0) {
      console.log(`❌ [${timestamp}] useCart - producto sin stock:`, product.codigo);
      alert(`❌ ${product.nombre} está agotado. Stock disponible: ${product.stock}`);
      return;
    }
    
    setItems(currentItems => {
      console.log(`🛒 [${timestamp}] useCart - currentItems en setState:`, currentItems);
      
      // Verificar si ya existe el producto
      const existingItemIndex = currentItems.findIndex(item => item.product.codigo === product.codigo);
      
      if (existingItemIndex !== -1) {
        const existingItem = currentItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        // ✅ Validar que no exceda el stock disponible
        if (newQuantity > product.stock) {
          console.log(`❌ [${timestamp}] useCart - cantidad excede stock disponible:`, { newQuantity, stock: product.stock });
          alert(`❌ No puedes agregar más unidades. Stock disponible: ${product.stock}, tienes ${existingItem.quantity} en el carrito`);
          return currentItems; // No modificar el carrito
        }
        
        // Si existe, actualizar cantidad
        const updatedItems = currentItems.map(item =>
          item.product.codigo === product.codigo
            ? { ...item, quantity: newQuantity }
            : item
        );
        console.log(`🛒 [${timestamp}] useCart - actualizando producto existente:`, updatedItems);
        return updatedItems;
      } else {
        // ✅ Validar stock para producto nuevo
        if (quantity > product.stock) {
          console.log(`❌ [${timestamp}] useCart - cantidad inicial excede stock:`, { quantity, stock: product.stock });
          alert(`❌ No puedes agregar ${quantity} unidades. Stock disponible: ${product.stock}`);
          return currentItems; // No modificar el carrito
        }
        
        // Si es nuevo, agregarlo
        const newItem: CartItem = { product, quantity };
        const newItems = [...currentItems, newItem];
        console.log(`🛒 [${timestamp}] useCart - agregando nuevo producto:`, newItems);
        return newItems;
      }
    });
  }, []);

  const removeFromCart = useCallback((productCode: string) => {
    setItems(currentItems => 
      currentItems.filter(item => item.product.codigo !== productCode)
    );
  }, []);

  const updateQuantity = useCallback((productCode: string, quantity: number) => {
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
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((total, item) => {
      const price = typeof item.product.precio === 'string' 
        ? parseFloat(item.product.precio) 
        : item.product.precio;
      return total + (price * item.quantity);
    }, 0);
  }, [items]);

  const getItemCount = useCallback(() => {
    const count = items.reduce((count, item) => count + item.quantity, 0);
    console.log('📊 useCart - getItemCount ejecutándose. Items:', items, 'Count:', count);
    return count;
  }, [items]);

  const isInCart = useCallback((productCode: string) => {
    return items.some(item => item.product.codigo === productCode);
  }, [items]);

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
