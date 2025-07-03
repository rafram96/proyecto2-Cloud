import React, { useState, useEffect } from 'react';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import foto1 from '../assets/lenovo.png';
import ProductCard from '../components/ProductCard';

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
      foto1,
      foto1,
      foto1,
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

// Productos recomendados
const recommendedProducts = [
  {
    id: '2',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto1,
  },
  {
    id: '3',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto1,
  },
  {
    id: '4',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto1,
  },
  {
    id: '5',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image:foto1,
  }
];

interface ProductProps {
  productId?: string;
  onNavigateBack?: () => void;
  onNavigateToProduct?: (id: string) => void;
}

const Product: React.FC<ProductProps> = ({ 
  productId = '1', 
  onNavigateBack = () => console.log('Navigate back'),
  onNavigateToProduct = (id) => console.log('Navigate to product:', id)
}) => {
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specifications' | 'features'>('features');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de producto
    const fetchProduct = () => {
      const foundProduct = sampleProducts.find(p => p.id === productId);
      setProduct(foundProduct || null);
      setLoading(false);
    };

    setTimeout(fetchProduct, 500);
  }, [productId]);

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
    // Aquí implementarías la lógica del carrito
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
          onClick={onNavigateBack}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Botón de regreso */}
      <button
        onClick={onNavigateBack}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          <div className="relative">
            {product.discount && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-sm font-bold z-10">
                -{product.discount}%
              </div>
            )}
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                  selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-gray-600">{product.category}</p>
          </div>

          {/* Precio */}
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Selector de color */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">COLOR</h3>
            <div className="flex space-x-3">
              {product.colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  disabled={!color.available}
                  className={`w-8 h-8 rounded-full border-2 ${
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
            <h3 className="text-sm font-medium text-gray-700 mb-3">CANTIDAD</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.maxQuantity}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Botón agregar al carrito */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full bg-black text-white py-3 px-6 rounded font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
          </button>

          {/* Pestañas de información */}
          <div>
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('specifications')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'specifications'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                SPECIFICATIONS
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'features'
                    ? 'border-b-2 border-black text-black'
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
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {spec}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Productos recomendados */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">RECOMMENDED FOR YOU</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((recProduct) => (
            <div
              key={recProduct.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onNavigateToProduct(recProduct.id)}
            >
              <div className="relative">
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                  -{recProduct.discount}%
                </div>
                <img
                  src={recProduct.image}
                  alt={recProduct.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                  {recProduct.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(recProduct.price)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(recProduct.originalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Product;