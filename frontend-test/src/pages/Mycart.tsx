import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { comprasService } from '../services/comprasService';
import { cardsService, type SavedCard } from '../services/cardsService';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, getTotal, getItemCount } = useCart();
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('');
  
  // Estados para el sistema de tarjetas
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<SavedCard | null>(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [cardFormData, setCardFormData] = useState({
    name: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });
  
  // Calcular totales
  useEffect(() => {
    const calculatedSubtotal = getTotal();
    setSubtotal(calculatedSubtotal);
    setTotal(calculatedSubtotal); // Shipping es 0
  }, [items, getTotal]);

  // Cargar tarjetas guardadas al montar el componente
  useEffect(() => {
    const cards = cardsService.getSavedCards();
    setSavedCards(cards);
    
    // Seleccionar tarjeta por defecto
    const defaultCard = cards.find(card => card.isDefault);
    if (defaultCard) {
      setSelectedCard(defaultCard);
    } else if (cards.length > 0) {
      setSelectedCard(cards[0]); // Si no hay default, seleccionar la primera
    }
  }, []);

  const handleQuantityChange = (productCode: string, change: number) => {
    const item = items.find(item => item.product.codigo === productCode);
    if (item) {
      const newQuantity = item.quantity + change;
      
      // Verificar límites de stock
      if (newQuantity < 1) {
        return; // No permitir menos de 1
      }
      
      // Verificar stock disponible
      const stockDisponible = item.product.stock || 0;
      if (newQuantity > stockDisponible) {
        alert(`Solo hay ${stockDisponible} unidades disponibles en stock`);
        return;
      }
      
      updateQuantity(productCode, newQuantity);
    }
  };

  const handleDeleteItem = (productCode: string) => {
    removeFromCart(productCode);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    // Validar que tenga tarjeta seleccionada o datos de nueva tarjeta
    if (!selectedCard && !showNewCardForm) {
      alert('Por favor selecciona una tarjeta o agrega una nueva');
      return;
    }

    // Si está agregando nueva tarjeta, validar campos
    if (showNewCardForm) {
      if (!cardFormData.name || !cardFormData.cardNumber || !cardFormData.expiryDate || !cardFormData.cvv) {
        alert('Por favor completa todos los campos de la tarjeta');
        return;
      }
      
      // Si quiere guardar la tarjeta, guardarla
      if (cardFormData.saveCard) {
        const newCard = cardsService.saveCard({
          name: cardFormData.name,
          cardNumber: cardFormData.cardNumber,
          expiryDate: cardFormData.expiryDate,
          cardType: cardsService.detectCardType(cardFormData.cardNumber),
          isDefault: savedCards.length === 0
        });
        
        setSavedCards(prev => [...prev, newCard]);
        setSelectedCard(newCard);
        setShowNewCardForm(false);
        
        // Limpiar formulario
        setCardFormData({
          name: '',
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          saveCard: false
        });
      }
    }
    
    setIsCheckingOut(true);
    setCheckoutStep('Procesando compra...');
    
    try {
      // Preparar datos para la API de compras
      const compraData = {
        productos: items.map(item => ({
          codigo: item.product.codigo,
          nombre: item.product.nombre, // Agregar nombre del producto
          precio: item.product.precio, // Agregar precio del producto
          cantidad: item.quantity
        })),
        direccion_entrega: "Dirección de entrega por defecto", // Esto se puede obtener de un formulario
        metodo_pago: selectedCard ? 
          `TARJETA (${selectedCard.cardNumber})` : 
          `TARJETA (****${cardFormData.cardNumber.slice(-4)})`
      };

      console.log('🛒 Procesando checkout con:', compraData);
      setCheckoutStep('Creando orden...');
      
      // Crear la compra usando el servicio
      const response = await comprasService.crearCompra(compraData);
      
      if (response.success) {
        setCheckoutStep('Actualizando inventario...');
        
        // Simular tiempo de ingesta/actualización en tiempo real
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCheckoutStep('Sincronizando datos...');
        
        // Aquí es donde ocurre la ingesta en tiempo real:
        // 1. La API de compras guarda en DynamoDB
        // 2. DynamoDB Streams triggea la Lambda
        // 3. Lambda actualiza ElasticSearch
        // 4. Stock se actualiza automáticamente
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ Compra creada exitosamente:', response.data);
        console.log('🔄 Ingesta en tiempo real completada');
        
        setCheckoutStep('¡Completado!');
        
        const tarjetaInfo = selectedCard ? 
          `Tarjeta: ${selectedCard.cardNumber}` : 
          `Tarjeta: ****${cardFormData.cardNumber.slice(-4)}`;
        
        alert(`¡Orden procesada exitosamente! 
ID: ${response.data?.compra_id}
Total: PEN ${formatPrice(response.data?.total || 0)}
${tarjetaInfo}
Stock actualizado en tiempo real`);
        
        clearCart();
      } else {
        console.error('❌ Error en la respuesta:', response.error);
        alert(response.error || 'Error al procesar la orden. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('💥 Error en checkout:', error);
      alert('Error al procesar la orden. Intenta nuevamente.');
    } finally {
      setIsCheckingOut(false);
      setCheckoutStep('');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white theme-transition pt-[60px]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-koulen text-[40px] mb-4 dark:text-white">MY CART</h2>
      </div>
      
      <div className="max-w-20xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row items-start gap-10 justify-center">

          {/* Cart Items */}
          <div className="flex-2 lg:col-span-2 mr-6">
            <div className="size-[600px] grow">
              <p className="text-gray-700 dark:text-gray-400 font-jaldi mb-6">
                You have a total of {getItemCount()} {getItemCount() === 1 ? 'product' : 'products'}.
              </p>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={`${item.product.codigo}-${index}`} className="flex items-center space-x-4 relative">

                    {/* Imagen del producto */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center">
                        {item.product.imagen_url ? (
                          <img
                            src={item.product.imagen_url}
                            alt={item.product.nombre}
                            className="w-40 h-40 object-contain"
                          />
                        ) : (
                          <div className="w-40 h-40 bg-gray-200 dark:bg-gray-600 flex items-center justify-center rounded-lg">
                            <span className="text-gray-400 text-sm">Sin imagen</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 pr-8">
                      <h3 className="font-lato font-bold text-black dark:text-white text-sm mb-4">
                        {item.product.nombre}
                      </h3>
                      <div className="text-xs text-gray-700 dark:text-gray-400 space-y-1">
                        <div className="font-lato text-gray-600 dark:text-gray-300">
                          {item.product.descripcion || 'Sin descripción'}
                        </div>
                        <div className="font-lato font-semibold text-gray-800 dark:text-gray-200">
                          PEN {formatPrice(typeof item.product.precio === 'string' ? parseFloat(item.product.precio) : item.product.precio)}
                        </div>
                        <div className="font-lato text-gray-500 dark:text-gray-400">SKU {item.product.codigo}</div>
                        <div className="font-lato">
                          <span className={`text-xs font-medium ${item.product.stock && item.product.stock > 10 ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'}`}>
                            Stock: {item.product.stock || 0} unidades
                          </span>
                        </div>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center font-jaldi space-x-2 mt-4">
                        <button
                          onClick={() => handleQuantityChange(item.product.codigo, -1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center bg-dorado4 hover:bg-dorado3 border border-dorado3 dark:bg-dorado1 dark:hover:bg-dorado2 dark:border-dorado2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <Minus className="w-4 h-4 text-gray-800 dark:text-black" />
                        </button>
                        <span className="w-8 text-center font-jaldi text-[16px] font-semibold text-gray-800 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product.codigo, 1)}
                          disabled={item.quantity >= (item.product.stock || 0)}
                          className="w-7 h-7 flex items-center justify-center bg-dorado4 hover:bg-dorado3 border border-dorado3 dark:bg-dorado1 dark:hover:bg-dorado2 dark:border-dorado2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <Plus className="w-4 h-4 text-gray-800 dark:text-black" />
                        </button>
                      </div>
                    </div>

                    {/* Botón de eliminar */}
                    <button
                      onClick={() => handleDeleteItem(item.product.codigo)}
                      className="absolute top-3 right-2 w-8 h-8 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900 rounded-full border border-gray-300 dark:border-gray-600 transition-colors duration-200"
                      title="Eliminar producto"
                    >
                      <svg 
                        className="w-4 h-4 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        strokeWidth="2" 
                        stroke="currentColor" 
                        fill="none" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z"/>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>

                  </div>
                ))}

                {/* Mensaje si el carrito está vacío */}
                {items.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 flex items-center justify-center mx-auto">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" />
                        <circle cx="9" cy="19" r="2" />
                        <circle cx="17" cy="19" r="2" />
                        <path d="M3 3h2l2 12a3 3 0 0 0 3 2h7a3 3 0 0 0 3-2l1-7h-15.2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-lato font-medium text-gray-800 dark:text-gray-100 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="font-jaldi text-gray-600 dark:text-gray-400">
                      Add some products to get started!
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Separador vertical */}
          <div className="w-px h-[750px] mx-0 bg-dorado1 dark:bg-dorado2"></div>

          {/* Payment Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-[32px] font-koulen text-gray-800 dark:text-white mb-4">
                PAYMENT INFORMATION
              </h3>

              <div className="space-y-4">
                {/* Selector de tarjetas guardadas */}
                {savedCards.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[16px] font-lato font-bold text-gray-700 dark:text-gray-300">
                      TARJETAS GUARDADAS
                    </h4>
                    <div className="space-y-2">
                      {savedCards.map((card) => (
                        <div
                          key={card.id}
                          onClick={() => {
                            setSelectedCard(card);
                            setShowNewCardForm(false);
                          }}
                          className={`
                            p-3 border-2 rounded-lg cursor-pointer transition-all duration-200
                            ${selectedCard?.id === card.id
                              ? 'border-dorado2 bg-dorado4 bg-opacity-10'
                              : 'border-gray-300 dark:border-gray-600 hover:border-dorado3'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">💳</span>
                              <div>
                                <p className="font-lato font-medium text-gray-800 dark:text-white">
                                  {card.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {card.cardNumber} • {card.expiryDate}
                                </p>
                              </div>
                            </div>
                            
                            {selectedCard?.id === card.id && (
                              <div className="w-5 h-5 bg-dorado2 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Botón para agregar nueva tarjeta */}
                    <button
                      onClick={() => {
                        setShowNewCardForm(!showNewCardForm);
                        if (showNewCardForm) {
                          setSelectedCard(savedCards.find(card => card.isDefault) || null);
                        } else {
                          setSelectedCard(null);
                        }
                      }}
                      className="w-full p-3 border-2 border-dashed border-dorado3 rounded-lg text-dorado3 hover:bg-dorado4 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="font-lato font-medium">
                        {showNewCardForm ? 'Cancelar' : 'Agregar Nueva Tarjeta'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Formulario para nueva tarjeta o primera tarjeta */}
                {(showNewCardForm || savedCards.length === 0) && (
                  <div className="space-y-4">
                    {savedCards.length === 0 && (
                      <h4 className="text-[16px] font-lato font-bold text-gray-700 dark:text-gray-300">
                        INFORMACIÓN DE TARJETA
                      </h4>
                    )}
                    
                    {/* Tarjeta simulada - mantener el diseño original */}
                    <div className="border-4 border-gray-600 dark:border-gray-400 rounded-lg p-[30px] bg-white dark:bg-gray-800">
                      <div className="flex flex-row-reverse">
                        <div className="h-2 bg-gray-300 dark:bg-gray-600 w-[100px] mb-5 rounded"></div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="w-9 h-7 bg-gray-800 dark:bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex justify-between items-center mt-7">
                        <div className="h-2 bg-gray-300 dark:bg-gray-600 w-12 rounded"></div>
                        <div className="h-2 bg-gray-300 dark:bg-gray-600 w-12 rounded"></div>
                        <div className="h-2 bg-gray-300 dark:bg-gray-600 w-12 rounded"></div>
                        <div className="h-2 bg-gray-300 dark:bg-gray-600 w-12 rounded"></div>
                      </div>
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 w-[150px] mt-3 rounded"></div>
                    </div>

                    {/* Campos del formulario - mantener diseño original */}
                    <div>
                      <label className="block text-[16px] font-lato font-bold text-gray-700 dark:text-gray-300 mb-2">
                        NAME ON CARD
                      </label>
                      <input
                        type="text"
                        value={cardFormData.name}
                        onChange={(e) => setCardFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Name on card"
                        className="w-full pb-1 bg-transparent border-0 border-b-2 text-[15px] font-jaldi border-gray-400 dark:border-gray-600 focus:border-dorado3 dark:focus:border-dorado2 focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[16px] font-lato font-bold text-gray-700 dark:text-gray-300 mb-2">
                        CARD NUMBER
                      </label>
                      <input
                        type="text"
                        value={cardFormData.cardNumber}
                        onChange={(e) => setCardFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                        placeholder="Card number"
                        className="w-full pb-1 bg-transparent border-0 border-b-2 text-[15px] font-jaldi border-gray-400 dark:border-gray-600 focus:border-dorado3 dark:focus:border-dorado2 focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[16px] font-lato font-bold text-gray-700 dark:text-gray-300 mb-2">
                          EXPIRATION DATE
                        </label>
                        <input
                          type="text"
                          value={cardFormData.expiryDate}
                          onChange={(e) => setCardFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                          placeholder="MM / YY"
                          className="w-full pb-1 bg-transparent border-0 border-b-2 text-[15px] font-jaldi border-gray-400 dark:border-gray-600 focus:border-dorado3 dark:focus:border-dorado2 focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[16px] font-lato font-bold text-gray-700 dark:text-gray-300 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardFormData.cvv}
                          onChange={(e) => setCardFormData(prev => ({ ...prev, cvv: e.target.value }))}
                          placeholder="CVV / Security code"
                          className="w-full pb-1 bg-transparent border-0 border-b-2 text-[15px] font-jaldi border-gray-400 dark:border-gray-600 focus:border-dorado3 dark:focus:border-dorado2 focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Checkbox para guardar tarjeta */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="saveCard"
                        checked={cardFormData.saveCard}
                        onChange={(e) => setCardFormData(prev => ({ ...prev, saveCard: e.target.checked }))}
                        className="w-4 h-4 text-dorado2 bg-transparent border-2 border-gray-400 rounded focus:ring-dorado2 focus:ring-2"
                      />
                      <label htmlFor="saveCard" className="text-sm font-lato text-gray-700 dark:text-gray-300">
                        Guardar esta tarjeta para futuras compras
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Separador */}
            <div className="flex justify-between">
              <div className="w-[100%] h-px bg-dorado1 dark:bg-dorado2 mt-2 mx-auto"></div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-[20px] font-lato font-semibold text-gray-800 dark:text-white mb-4">
                ORDER SUMMARY
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-[14px] font-lato font-bold text-gray-600 dark:text-gray-300">
                  <span>SUBTOTAL</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[14px] font-lato font-bold text-gray-600 dark:text-gray-300">
                  <span>SHIPPING COSTS</span>
                  <span>0,00</span>
                </div>

                <div className="flex justify-between text-[16px] text-gray-800 dark:text-white font-lato font-bold">
                  <span>TOTAL</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={items.length === 0 || isCheckingOut}
                className="w-full bg-gray-800 dark:bg-gray-800 font-lato font-bold text-dorado4 dark:text-dorado3 py-3 mt-6 tracking-widest hover:bg-dorado3 hover:text-white dark:hover:bg-dorado1 dark:hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 border border-dorado3 dark:border-dorado2"
              >
                {isCheckingOut ? (checkoutStep || 'PROCESSING...') : 'CHECKOUT'}
              </button>
              
              {/* Indicador de progreso de ingesta */}
              {isCheckingOut && checkoutStep && (
                <div className="mt-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dorado3"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-jaldi">
                      {checkoutStep}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-jaldi">
                    Sincronizando con sistemas en tiempo real...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
