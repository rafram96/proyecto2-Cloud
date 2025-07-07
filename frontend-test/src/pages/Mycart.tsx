import React, { useState, useEffect } from 'react';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import foto1 from '../assets/lenovo.png';
import foto2 from '../assets/lenovo2.png';
import foto3 from '../assets/lenovo3.png';
import foto4 from '../assets/lenovo4.png';

// Interfaz para los productos del carrito
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  color: string;
  sku: string;
  quantity: number;
}

// Datos de ejemplo para el carrito
const cartItems: CartItem[] = [
  {
    id: '1',
    name: 'IPHONE 16 PRO MAX',
    price: 1200.00,
    image: foto1,
    color: 'DESERT TITANIUM',
    sku: '701635',
    quantity: 1
  },
  {
    id: '2',
    name: 'ROG ZEPHYRUS G14 (2024) GU605',
    price: 1199.00,
    image: foto4,
    color: 'METALLIC GREY',
    sku: '797236',
    quantity: 1
  },
  {
    id: '3',
    name: 'LENOVO LOQ 9NA GEN (15" INTEL CON RTX™ 3050)',
    price: 1199.00,
    image: foto2,
    color: 'METALLIC GREY',
    sku: '781735',
    quantity: 1
  },
  {
    id: '4',
    name: 'SONY ILME-FX30',
    price: 1399.00,
    image: foto3,
    color: 'BLACK',
    sku: '790221',
    quantity: 1
  }
];

const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>(cartItems);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Calcular totales
  useEffect(() => {
    const calculatedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(calculatedSubtotal);
    setTotal(calculatedSubtotal); // Shipping es 0
  }, [items]);

  const handleQuantityChange = (id: string, change: number) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen  pt-[60px] ">
      <div>
        <h2 className="px-[22%] font-koulen text-[40px] mb-4">MY CART</h2>
      </div>
      <div className="max-w-20xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row items-start gap-10 justify-center ">
          
          {/* Cart Items */}
          <div className="flex-2 lg:col-span-2 mr-6">
            <div className="size-[600px] grow">
              <p className="text-gray-600 font-jaldi mb-6">You have a total of {items.length} products.</p>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4   relative">
                    
                 

                    {/* Imagen del producto */}
                    <div className="flex-shrink-0 ">
                        <div className=" flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-40 h-40 object-contain"
                          />
                        </div>
                      
                    </div>
                    
                    {/* Información del producto */}
                    <div className="flex-1 pr-8">
                      <h3 className="font-lato font-bold text-black text-sm mb-4">{item.name}</h3>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="font-lato">{item.color}</div>
                        <div className='font-lato'>PEN {formatPrice(item.price)}</div>
                        <div className='font-lato'>SKU {item.sku}</div>
                      </div>

                      {/* Controles de cantidad */}
                    <div className="flex items-center font-jaldi space-x-2 mt-4 ">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center bg-amarillo2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed  transition-colors duration-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-jaldi text-[16px]">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-amarillo2 hover:bg-gray-50  transition-colors duration-200"
                      >
                        <Plus className=" w-4 h-4" />
                      </button>
                    </div>
                    </div>

                    {/* Botón de eliminar */}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="absolute top-3 right-2 w-8 h-8 flex items-center justify-center  hover: transition-colors duration-200"
                      title="Eliminar producto"
                    >
                      <svg className="w-5 h-5 text-black hover:text-red-600"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <line x1="18" y1="6" x2="6" y2="18" />  <line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>

                  
                  </div>
                ))}

                {/* Mensaje si el carrito está vacío */}
                {items.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 flex items-center justify-center mx-auto ">
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
                    <h3 className="text-lg font-faldi font-medium text-gray-900 mb-2">Your cart is empty</h3>
                    <p className=" font-jaldi text-gray-500">Add some products to get started!</p>
                  </div>
                )}
                
              </div>
            </div>
          </div>
          
          <div className=" w-px h-[750px] mx-0 bg-amarillo1"></div>
          {/* Payment Information */}
          <div className="space-y-6">
            <div className="">
              <h3 className="text-[32px] font-koulen text-black mb-4">PAYMENT INFORMATION</h3>
              
              <div className="space-y-4">
                <div className="border-4 border-gray-600 rounded-lg p-[30px]">
                  <div className='flex flex-row-reverse'>
                  <div className=" h-2 bg-gray-300 w-[100px] mb-5 rounded "></div></div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="w-9 h-7 bg-gray-800 rounded"></div>
                    <div className="text-right">
                      
                    </div>
                    
                  </div>
                  <div className="flex justify-between items-center mt-7">
                  <div className="h-2 bg-gray-300 w-12 rounded"></div>
                  <div className="h-2 bg-gray-300 w-12 rounded"></div>
                  <div className="h-2 bg-gray-300 w-12 rounded"></div>
                  <div className="h-2 bg-gray-300 w-12 rounded"></div>
                  </div>
                  <div className="h-2 bg-gray-300 w-[150px] mt-3 rounded"></div>
                </div>
                
                <div >
                  <label className="block text-[16px] font-lato font-bold text-gris2 mb-2">
                    NAME ON CARD
                  </label>
                  <input
                    type="text"
                    placeholder="Name on card"
                    className="w-full pb-1 bg-transparent border-0 border-b-2 text-[15px] font-jaldi border-gray-300 focus:border-yellow-400 focus:outline-none placeholder-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-[16px] font-lato font-bold text-gris2 mb-2">
                    CARD NUMBER
                  </label>
                  <input
                    type="text"
                    placeholder="Card number"
                    className="w-full pb-1 bg-transparent border-0 border-b-2 text-[15px] font-jaldi border-gray-300 focus:border-yellow-400 focus:outline-none placeholder-gray-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[16px] font-lato font-bold text-gris2 mb-2">
                      EXPIRATION DATE
                    </label>
                    <input
                      type="text"
                      placeholder="MM / YY"
                      className="w-full pb-1 bg-transparent border-0 border-b-2 text-[15px] font-jaldi border-gray-300 focus:border-yellow-400 focus:outline-none placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[16px] font-lato font-bold text-gris2 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="CVV / Security code"
                      className="w-full pb-1 bg-transparent border-0 border-b-2 text-[15px] font-jaldi border-gray-300 focus:border-yellow-400 focus:outline-none placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="flex justify-between">
              <div className="w-[100%] h-px bg-amarillo1 mt-2 mx-auto"></div>
            </div>

            <div className="">
              <h3 className="text-[20px] font-lato font-semibold text-black mb-4">ORDER SUMMARY</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[14px] font-lato font-bold text-gris2">
                  <span >SUBTOTAL</span>
                   <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[14px] font-lato font-bold text-gris2">
                  <span >SHIPPING COSTS</span>
                  <span >0,00</span>
                </div>
                
                <div className="flex justify-between text-[16px] text-black font-lato font-bold">
                  <span>TOTAL</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              
              <button className="w-full bg-black font-lato font-bold text-amarillo4 py-3 mt-6  tracking-widest hover:bg-amarillo2 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300">
                CHECKOUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Cart;
