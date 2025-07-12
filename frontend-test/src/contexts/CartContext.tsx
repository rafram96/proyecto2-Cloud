import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  codigo: string;
  nombre: string;
  precio: number;
  imagen_url?: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string) => boolean;
  getCartItem: (productId: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
        console.log('🛒 Carrito cargado desde localStorage:', parsedCart);
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(items));
    console.log('💾 Carrito guardado:', items);
  }, [items]);

  const addToCart = (product: any, quantity: number) => {
    console.log('🛒 Agregando al carrito:', { product, quantity });
    
    const existingItemIndex = items.findIndex(item => item.id === product.codigo);
    
    if (existingItemIndex > -1) {
      // Si ya existe, actualizar cantidad
      const updatedItems = [...items];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      
      // Verificar stock disponible
      if (newQuantity <= product.stock) {
        updatedItems[existingItemIndex].quantity = newQuantity;
        setItems(updatedItems);
        console.log('✅ Cantidad actualizada en carrito');
      } else {
        alert(`❌ Stock insuficiente. Disponible: ${product.stock}`);
      }
    } else {
      // Agregar nuevo item
      const newItem: CartItem = {
        id: product.codigo,
        codigo: product.codigo,
        nombre: product.nombre,
        precio: product.precio,
        imagen_url: product.imagen_url,
        quantity: quantity,
        stock: product.stock
      };
      
      setItems([...items, newItem]);
      console.log('✅ Producto agregado al carrito');
    }
  };

  const removeFromCart = (productId: string) => {
    setItems(items.filter(item => item.id !== productId));
    console.log('🗑️ Producto eliminado del carrito:', productId);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedItems = items.map(item => {
      if (item.id === productId) {
        if (quantity <= item.stock) {
          return { ...item, quantity };
        } else {
          alert(`❌ Stock insuficiente. Disponible: ${item.stock}`);
          return item;
        }
      }
      return item;
    });
    
    setItems(updatedItems);
  };

  const clearCart = () => {
    setItems([]);
    console.log('🧹 Carrito limpiado');
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  const isInCart = (productId: string) => {
    return items.some(item => item.id === productId);
  };

  const getCartItem = (productId: string) => {
    return items.find(item => item.id === productId);
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    getCartItem
  };

  return (
    <CartContext.Provider value={value}>
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
