import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    image: string;
    category: string;
    stock: number; // ✅ Agregar stock
    specs?: string[];
    description?: string;
    fullProduct?: Product; // ✅ Producto completo para referencia
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
    
    // ✅ Validar stock antes de agregar
    if (product.stock <= 0) {
      alert(`❌ ${product.name} está agotado. Stock disponible: ${product.stock}`);
      return;
    }
    
    // ✅ Usar el producto completo si está disponible, sino crear uno basado en los datos
    const productData = product.fullProduct || {
      tenant_id: 'TADASHI', // Usar el tenant actual
      codigo: product.id,
      nombre: product.name,
      descripcion: product.description || '',
      precio: product.price,
      categoria: product.category,
      stock: product.stock, // ✅ Usar el stock real
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
      style={{ maxWidth: 240, minWidth: 200, width: '100%', minHeight: 340 }}
      onClick={handleProductClick}
    >
      <div className="relative overflow-hidden" style={{ height: 160 }}>
        {product.discount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
            -{product.discount}%
          </div>
        )}
        <div className="w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="object-contain max-h-[140px] max-w-[90%] group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.png';
            }}
          />
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-lato font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
            {product.name}
          </h3>

          {product.specs && product.specs.length > 0 && (
            <div className="mb-2">
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
              <span className="text-base font-lato font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm font-lato text-gray-500 dark:text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {product.category}
              </span>
              {/* ✅ Indicador de stock */}
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                product.stock <= 0 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                  : product.stock <= 5 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {product.stock <= 0 ? 'Agotado' : `Stock: ${product.stock}`}
              </span>
            </div>
          </div>

          {/* Botón agregar al carrito */}
          <button
            onClick={handleAddToCart}
            disabled={isInCart(product.id) || product.stock <= 0} // ✅ Deshabilitar si no hay stock
            className={`${
              product.stock <= 0
                ? 'bg-gray-400 text-white cursor-not-allowed' // Sin stock
                : isInCart(product.id) 
                  ? 'bg-green-500 text-white cursor-not-allowed' // Ya en carrito
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-105' // Disponible
            } p-2.5 rounded-full transition-all duration-200 flex items-center justify-center shadow-md`}
            title={
              product.stock <= 0 
                ? "Sin stock disponible" 
                : isInCart(product.id) 
                  ? "Ya está en el carrito" 
                  : "Agregar al carrito"
            }
          >
            {product.stock <= 0 ? '❌' : isInCart(product.id) ? '✓' : '🛒'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;