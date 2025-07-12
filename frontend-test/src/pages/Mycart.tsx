import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { comprasService, type CompraData } from '../services/comprasService';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart, getTotal, getItemCount } = useCart();
  
  // Estados para el checkout
  const [direccionEntrega, setDireccionEntrega] = useState('');
  
  // Estados para el proceso de compra
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const subtotal = getTotal();
  const shipping = 0;
  const total = subtotal + shipping;

  const handleQuantityChange = (productCode: string, change: number) => {
    const currentItem = items.find(item => item.product.codigo === productCode);
    if (currentItem) {
      const newQuantity = currentItem.quantity + change;
      updateQuantity(productCode, newQuantity);
    }
  };

  const handleDeleteItem = (productCode: string) => {
    removeFromCart(productCode);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  };

  const validateCheckoutForm = (): boolean => {
    if (!direccionEntrega.trim()) {
      setOrderError('La dirección de entrega es requerida');
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateCheckoutForm()) return;

    setProcessingOrder(true);
    setOrderError(null);

    try {
      // Preparar datos de la compra
      const compraData: CompraData = {
        productos: items.map(item => ({
          codigo: item.product.codigo,
          cantidad: item.quantity
        })),
        direccion_entrega: direccionEntrega,
        metodo_pago: 'TARJETA'
      };

      const response = await comprasService.crearCompra(compraData);

      if (response.success) {
        setOrderSuccess(true);
        clearCart();
        
        // Redirigir a la orden creada después de 3 segundos
        setTimeout(() => {
          if (response.data) {
            navigate(`/view-order/${response.data.compra_id}`);
          } else {
            navigate('/my-orders');
          }
        }, 3000);
      } else {
        setOrderError(response.error || 'Error al procesar la compra');
      }
    } catch (error) {
      setOrderError('Error inesperado al procesar la compra');
      console.error('Checkout error:', error);
    } finally {
      setProcessingOrder(false);
    }
  };

  // Si el carrito está vacío
  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen pt-[40px] bg-gray-50 dark:bg-gray-900 theme-transition">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="font-koulen text-gray-900 dark:text-gray-100 text-[40px] mb-8 drop-shadow-sm">MI CARRITO</h2>
          
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Tu carrito está vacío
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              Agrega algunos productos para comenzar tu compra
            </p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Explorar productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si la orden fue exitosa
  if (orderSuccess) {
    return (
      <div className="min-h-screen pt-[40px] bg-gray-50 dark:bg-gray-900 theme-transition">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              ¡Compra realizada exitosamente!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tu orden ha sido procesada. Serás redirigido automáticamente...
            </p>
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[40px] bg-gray-50 dark:bg-gray-900 theme-transition">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-koulen text-gray-900 dark:text-gray-100 text-[40px] mb-8 drop-shadow-sm">MI CARRITO</h2>
        
        <div className="flex flex-col lg:flex-row items-start gap-10 justify-center">
          
          {/* Cart Items */}
          <div className="flex-2 lg:w-2/3">
            <p className="text-gray-600 dark:text-gray-400 font-jaldi mb-6">
              Tienes un total de {getItemCount()} {getItemCount() === 1 ? 'producto' : 'productos'}.
            </p>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={`${item.product.codigo}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md theme-transition">
                  <div className="flex items-center gap-6">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product.imagen_url ? (
                        <img
                          src={item.product.imagen_url}
                          alt={item.product.nombre}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm">Sin imagen</div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {item.product.nombre}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Código: {item.product.codigo}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.product.descripcion}
                      </p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(item.product.codigo, -1)}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product.codigo, 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Price and Delete */}
                    <div className="text-right">
                      <p className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                        {formatPrice(typeof item.product.precio === 'string' ? parseFloat(item.product.precio) : item.product.precio)}
                      </p>
                      <button
                        onClick={() => handleDeleteItem(item.product.codigo)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Checkout Section */}
          <div className="lg:w-1/3 w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md theme-transition">
              
              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  DIRECCIÓN DE ENTREGA
                </h3>
                <textarea
                  value={direccionEntrega}
                  onChange={(e) => setDireccionEntrega(e.target.value)}
                  placeholder="Ingresa tu dirección completa..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-yellow-400 dark:focus:border-yellow-500 theme-transition"
                  rows={3}
                />
              </div>
              
              {/* Order Summary */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">RESUMEN DE ORDEN</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>SUBTOTAL</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>ENVÍO</span>
                    <span>{formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-600 pt-3">
                    <span>TOTAL</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                
                {/* Error Message */}
                {orderError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center text-red-600 dark:text-red-400">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm">{orderError}</span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleCheckout}
                  disabled={processingOrder}
                  className="w-full bg-gray-900 dark:bg-gray-100 font-lato font-bold text-yellow-400 dark:text-gray-900 py-3 tracking-widest hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-gray-900 dark:hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 rounded-lg shadow-lg hover:shadow-xl"
                >
                  {processingOrder ? 'PROCESANDO...' : 'FINALIZAR COMPRA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
