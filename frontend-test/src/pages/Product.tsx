import React, { useState, useEffect } from 'react';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {  useRef } from 'react';
import foto1 from '../assets/lenovo.png';
import foto2 from '../assets/lenovo2.png';
import foto3 from '../assets/lenovo3.png';
import foto4 from '../assets/lenovo4.png';
import ProductCard from '../components/ProductCard';
import type { Product as ProductCardType } from '../components/ProductCard';

// Interfaz extendida para el producto con más detalles
interface ProductDetails {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  colors: Array<{
    name: string;
    value: string;
    available: boolean;
  }>;
  specifications: string[];
  features: string[];
  description?: string;
  inStock: boolean;
  maxQuantity: number;
}

// Productos de ejemplo con datos completos
const sampleProducts: ProductDetails[] = [
  {
    id: '1',
    name: 'ROG ZEPHYRUS G16 (2024) GU605',
    price: 3700,
    originalPrice: 4000,
    discount: 20,
    images: [
      foto1,
      foto2,
      foto3,
      foto4,
    ],
    category: 'Gaming Laptops',
    colors: [
      { name: 'Eclipse Gray', value: '#2D2D2D', available: true },
      { name: 'Platinum White', value: '#F5F5F5', available: true }
    ],
    specifications: [
      'Ultra-slim and lightweight design with a CNC-machined aluminum body (only 1.95 kg)',
      '16-inch OLED WQXGA display (2560×1600 resolution) with a 240Hz refresh rate',
      'Powered by the Intel Core Ultra 9 processor with an integrated NPU for AI acceleration',
      'Equipped with NVIDIA GeForce RTX 40 series GPUs (4060, 4070, 4080, or 4090)',
      'RGB backlit keyboard with full layout, including the Ñ key',
      'Immersive surround sound with a quad-speaker system and Dolby Atmos',
      'Advanced connectivity including Wi-Fi 6E, Bluetooth 5.3, and Thunderbolt 4',
      'Fast charging via USB-C, with a 240W power adapter included',
      'Available in two colors: Eclipse Gray and Platinum White'
    ],
    features: [
      'AI-Enhanced Performance with Intel Core Ultra 9',
      'OLED Display with 240Hz Refresh Rate',
      'RTX 40 Series Graphics',
      'Premium Build Quality',
      'Advanced Cooling System',
      'RGB Customization',
      'Thunderbolt 4 Connectivity',
      'Fast Charging Technology'
    ],
    description: 'The ROG Zephyrus G16 delivers exceptional gaming performance in an ultra-portable design.',
    inStock: true,
    maxQuantity: 5
  },
  {
    id: '2',
    name: 'ROG xd ZEPHYRUS G16 (2024) GU605',
    price: 3700,
    originalPrice: 4000,
    discount: 20,
    images: [
      foto1,
      foto2,
      foto3,
      foto4,
    ],
    category: 'Gaming Laptops',
    colors: [
      { name: 'Eclipse Gray', value: '#2D2D2D', available: true },
      { name: 'Platinum White', value: '#F5F5F5', available: true }
    ],
    specifications: [
      'Ultra-slim and lightweight design with a CNC-machined aluminum body (only 1.95 kg)',
      '16-inch OLED WQXGA display (2560×1600 resolution) with a 240Hz refresh rate',
      'Powered by the Intel Core Ultra 9 processor with an integrated NPU for AI acceleration',
      'Equipped with NVIDIA GeForce RTX 40 series GPUs (4060, 4070, 4080, or 4090)',
      'RGB backlit keyboard with full layout, including the Ñ key',
      'Immersive surround sound with a quad-speaker system and Dolby Atmos',
      'Advanced connectivity including Wi-Fi 6E, Bluetooth 5.3, and Thunderbolt 4',
      'Fast charging via USB-C, with a 240W power adapter included',
      'Available in two colors: Eclipse Gray and Platinum White'
    ],
    features: [
      'AI-Enhanced Performance with Intel Core Ultra 9',
      'OLED Display with 240Hz Refresh Rate',
      'RTX 40 Series Graphics',
      'Premium Build Quality',
      'Advanced Cooling System',
      'RGB Customization',
      'Thunderbolt 4 Connectivity',
      'Fast Charging Technology'
    ],
    description: 'The ROG Zephyrus G16 delivers exceptional gaming performance in an ultra-portable design.',
    inStock: true,
    maxQuantity: 5
  }
];

// Productos recomendados - ahora compatible con ProductCard
const recommendedProducts: ProductCardType[] = [
  {
    id: '2',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto1,
    category: 'Gaming Laptops',
    specs: ['Intel Core i5', 'RTX 3050', '16GB RAM', '512GB SSD']
  },
  {
    id: '3',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto2,
    category: 'Gaming Laptops',
    specs: ['Intel Core i5', 'RTX 3050', '16GB RAM', '512GB SSD']
  },
  {
    id: '4',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto3,
    category: 'Gaming Laptops',
    specs: ['Intel Core i5', 'RTX 3050', '16GB RAM', '512GB SSD']
  },
  {
    id: '5',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto4,
    category: 'Gaming Laptops',
    specs: ['Intel Core i5', 'RTX 3050', '16GB RAM', '512GB SSD']
  },
  {
    id: '6',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto1,
    category: 'Gaming Laptops',
    specs: ['Intel Core i5', 'RTX 3050', '16GB RAM', '512GB SSD']
  },
  {
    id: '7',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto2,
    category: 'Gaming Laptops',
    specs: ['Intel Core i5', 'RTX 3050', '16GB RAM', '512GB SSD']
  },
  {
    id: '8',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto3,
    category: 'Gaming Laptops',
    specs: ['Intel Core i5', 'RTX 3050', '16GB RAM', '512GB SSD']
  },
  {
    id: '9',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto4,
    category: 'Gaming Laptops',
    specs: ['Intel Core i5', 'RTX 3050', '16GB RAM', '512GB SSD']
  }
];

interface ProductProps {
  productId?: string;
  onNavigateBack?: () => void;
  onNavigateToProduct?: (id: string) => void;
}

const Product: React.FC<ProductProps> = ({
  productId = '1',
  onNavigateToProduct = (id) => console.log('Navigate to product:', id)
}) => {
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specifications' | 'features'>('features');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const hasHistory = useRef(false);

  // Verifica si hay historial
  useEffect(() => {
    hasHistory.current = window.history.length > 1;
  }, []);

  // Cargar el producto
  useEffect(() => {
    const fetchProduct = () => {
      const foundProduct = sampleProducts.find(p => p.id === productId);
      setProduct(foundProduct || null);
      setLoading(false);
    };

    setTimeout(fetchProduct, 500);
  }, [productId]);

  const handleBack = () => {
    if (hasHistory.current) {
      navigate(-1);
    } else {
      navigate('/search');
    }
  };

  const handleQuantityChange = (change: number) => {
    if (!product) return;
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      color: product.colors[selectedColor].name,
      image: product.images[0]
    };

    console.log('Adding to cart:', cartItem);
    alert('Producto agregado al carrito!');
  };

  const formatPrice = (price: number) => {
    return `S/. ${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando producto...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <div className="text-lg mb-4">Producto no encontrado</div>
        <button
          onClick={handleBack}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to the beginning
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      {/* Botón de regreso */}
      <button
        onClick={handleBack}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Información del producto */}
        <div className="space-y-5">
          
          <div className="flex justify-end items-center space-x-4 mb-2">
            {product.discount && (
              <span className="text-[30px] font-koulen bg-red-600 text-white px-3 py-1 rounded-xl">
                -{product.discount}%
              </span>
            )}
            <h1 className="text-[40px] font-koulen text-black">
              {product.name}
            </h1>
          </div>

          {/* Selector de color */}
          <div className="flex justify-end items-center gap-6 mb-4">
            <h3 className="text-[20px] font-koulen text-[#999999]">COLOR</h3>
            <div className="flex gap-7">
              {product.colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  disabled={!color.available}
                  className={`w-5 h-5 rounded-full border-2 ${
                    selectedColor === index ? 'border-gray-900' : 'border-gray-300'
                  } ${!color.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Selector de cantidad */}
          <div>
            <div className="flex justify-end items-center  space-x-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-8 h-8 flex items-center justify-center bg-amarillo2 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center  font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.maxQuantity}
                className="w-8 h-8 flex items-center justify-center bg-amarillo2 border-gray-300  hover:bg-gray-50 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Precio */}
          <div className="flex justify-end items-center space-x-4">
            <span className="text-3xl font-koulen text-black">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xl font-koulen text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Botón agregar al carrito */}
          <div className='flex justify-end items-center'>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-200  bg-black text-amarillo4 py-2 px-6 font-jaldi font-bold tracking-widest hover:bg-amarillo2 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"

            >
              {product.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
            </button>
          </div>

          {/* Pestañas de información */}
          <div >
            <div className="flex justify-end items-center ">
              <button
                onClick={() => setActiveTab('specifications')}
                className={`px-4 py-2 font-koulen text-[24px] ${
                  activeTab === 'specifications'
                    ? 'border-b-2 border-amarillo1 text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                SPECIFICATIONS
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`px-4 py-2 font-koulen text-[24px] ${
                  activeTab === 'features'
                    ? 'border-b-2 border-amarillo1 text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                FEATURES
              </button>
            </div>

            <div className="py-4">
              {activeTab === 'specifications' ? (
                <ul className="space-y-2">
                  {product.specifications.map((spec, index) => (
                    <li key={index} className="text-[16px] text-black font-jaldi flex items-start">
                      <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {spec}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-[16px] text-black font-jaldi flex items-start">
                      <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {/* Galería de imágenes */}
          <div className="relative">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-[550px] h-[470px]  object-contain"
            />
          </div>
          
          <div className="flex justify-center space-x-7 ">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-[100px] h-[100px]  transition-transform duration-300 ease-in-out ${
                  selectedImage === index
                    ? 'opacity-100 scale-125'
                    : 'opacity-50 scale-70'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Productos recomendados usando ProductCard */}
      <div className="mt-16">
        <h2 className="text-[30px] font-koulen text-black mb-8">RECOMMENDED FOR YOU</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((recProduct) => (
            <ProductCard
              key={recProduct.id}
              product={recProduct}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Product;
