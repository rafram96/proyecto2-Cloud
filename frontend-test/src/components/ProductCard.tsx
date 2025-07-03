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
      className="bg-white hover:shadow-lg transition-shadow duration-300 cursor-pointer w-[255px] h-[303px] "
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
          className="mx-auto w-48 h-48 object-cover "
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-lato  text-black mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex items-center space-x-2">
          <span className="text-lg font-lato font-bold text-black">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm font-lato text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;