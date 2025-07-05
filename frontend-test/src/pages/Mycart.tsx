import React from 'react';

const Cart: React.FC = () => {
  


  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">MY CART</h2>
              <p className="text-gray-600 mb-6">You have a total of 4 products.</p>
              
              <div className="space-y-6">
                
                  <div  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="w-16 h-16 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm"></h3>
                      <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">
                        
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <span className="text-gray-600 font-bold">-</span>
                      </button>
                      <span className="w-8 text-center font-medium"></span>
                      <button
                        
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <span className="text-gray-600 font-bold">+</span>
                      </button>
                    </div>
                  </div>
                
              </div>
            </div>
          </div>
          
          {/* Payment Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">PAYMENT INFORMATION</h3>
              
              <div className="space-y-4">
                <div className="border-2 border-gray-300 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="w-8 h-6 bg-gray-800 rounded"></div>
                    <div className="text-right">
                      <div className="h-1 bg-gray-300 w-8 mb-1"></div>
                      <div className="h-1 bg-gray-300 w-12"></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NAME ON CARD
                  </label>
                  <input
                    type="text"
                    placeholder="Name on card"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CARD NUMBER
                  </label>
                  <input
                    type="text"
                    placeholder="Card number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      EXPIRATION DATE
                    </label>
                    <input
                      type="text"
                      placeholder="MM / YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="CVV / Security code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ORDER SUMMARY</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">SUBTOTAL</span>
                  <span className="font-semibold"></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SHIPPING COSTS</span>
                  <span className="font-semibold"></span>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL</span>
                  <span></span>
                </div>
              </div>
              
              <button className="w-full bg-black text-white py-3 mt-6 rounded-md hover:bg-gray-800 transition duration-300 font-semibold">
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
