import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    image: string;
    category: string;
    specs?: string[];
  };
}
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se active el click del producto
    
    // Convertir los datos del ProductCard al formato Product completo
    const productData = {
      tenant_id: 'TADASHI', // Usar el tenant actual
      codigo: product.id,
      nombre: product.name,
      descripcion: `Producto ${product.name}`, // Descripción por defecto
      precio: product.price,
      categoria: product.category,
      stock: 10, // Stock por defecto
      imagen_url: product.image || '',
      tags: product.specs || [],
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user',
      updated_by: 'user'
    };
    
    addToCart(productData, 1);
    alert(`✅ ${product.name} agregado al carrito`);
  };

  const formatPrice = (price: number) => {
    return `S/. ${price.toLocaleString()}`;
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden group theme-transition flex flex-col h-full"
      onClick={handleProductClick}
    >
      <div className="relative overflow-hidden">
        {product.discount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
            -{product.discount}%
          </div>
        )}
        <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.png';
            }}
          />
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-lato font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
            {product.name}
          </h3>
          
          {product.specs && product.specs.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {product.specs.slice(0, 2).map((spec, index) => (
                  <span key={index} className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                    {spec}
                  </span>
                ))}
                {product.specs.length > 2 && (
                  <span className="inline-block text-gray-400 text-xs px-1">+{product.specs.length - 2}</span>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-lato font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm font-lato text-gray-500 dark:text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {product.category}
            </span>
          </div>
          
          {/* Botón agregar al carrito */}
          <button
            onClick={handleAddToCart}
            disabled={isInCart(product.id)}
            className={`${
              isInCart(product.id) 
                ? 'bg-green-500 text-white cursor-not-allowed' 
                : 'bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-105'
            } p-2.5 rounded-full transition-all duration-200 flex items-center justify-center shadow-md`}
            title={isInCart(product.id) ? "Ya está en el carrito" : "Agregar al carrito"}
          >
            {isInCart(product.id) ? '✓' : '🛒'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;