import React from 'react';
import { useNavigate } from 'react-router-dom';
import Product from '../pages/Product';
interface ProductCardProps {
  product: Product;
}
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  specs?: string[];
}
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  const formatPrice = (price: number) => {
    return `S/. ${price.toLocaleString()}`;
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 hover:shadow-lg dark:hover:shadow-2xl transition-shadow duration-300 cursor-pointer w-[255px] h-[303px] border border-gray-200 dark:border-gray-700 rounded-lg theme-transition"
      onClick={handleProductClick}
    >
      <div className="relative">
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-xl text-sm font-lato font-bold z-10">
            -{product.discount}%
          </div>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="mx-auto w-48 h-48 object-cover rounded-t-lg"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-lato text-black dark:text-white mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex items-center space-x-2">
          <span className="text-lg font-lato font-bold text-black dark:text-white">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm font-lato text-gray-500 dark:text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;