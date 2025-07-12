import React, { useState, useEffect } from 'react';
import '../components/ShopNow.tsx'
import ShopNowButton from '../components/ShopNow.tsx';
import { FaGamepad, FaMobileAlt, FaLaptop, FaHeadphones, FaPlug, FaTv } from 'react-icons/fa';
import CategoryButtons from '../components/CategoryButtons';
import SearchBar from '../components/SearchBar';
import { ProductModal } from '../components/ProductModal';
import imagen1 from '../assets/images/imagen1.jpg';
import ProductCard from '../components/ProductCard.tsx';
import { productService } from '../services/productService';
import type { Product } from '../types/product';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';

const categories = [
  { icon: <FaGamepad size={50} />, label: 'Gaming Gear', value: 'gaming' },
  { icon: <FaMobileAlt size={50} />, label: 'Smartphones', value: 'smartphones' },
  { icon: <FaLaptop size={50} />, label: 'Laptops & PCs', value: 'laptops' },
  { icon: <FaHeadphones size={50} />, label: 'Audio & Headphones', value: 'audio' },
  { icon: <FaPlug size={50} />, label: 'Accessories', value: 'accessories' },
  { icon: <FaTv size={50} />, label: 'TV & Monitors', value: 'tv' },
];

// Función para convertir el producto de la API al formato esperado por ProductCard
const convertToProductCardFormat = (product: Product) => {
  // Asegurar que la URL de imagen sea válida
  let imageUrl = product.imagen_url;
  if (!imageUrl || imageUrl === '' || imageUrl === 'string') {
    imageUrl = '/placeholder.png';
  }
  // Si la URL no empieza con http/https y no es una ruta local, añadir el dominio base
  else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
    imageUrl = '/' + imageUrl;
  }
  
  return {
    id: product.codigo,
    name: product.nombre,
    price: product.precio,
    image: imageUrl,
    category: product.categoria,
  };
};

const Home: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el modal y búsqueda
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  useEffect(() => {
    const loadProducts = async () => {
      if (user?.tenantId) {
        try {
          const result = await productService.listarProductos();
          if (result.success && result.data) {
            setProducts(result.data.productos || []);
          }
        } catch (error) {
          console.error('Error loading products:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadProducts();
  }, [user?.tenantId]);

  // Funciones para manejar la búsqueda y modal
  const handleAutocomplete = async (query: string) => {
    if (query.length < 1) {  // Cambiado de 2 a 1 para ser más sensible
      setSuggestions([]);
      return;
    }

    try {
      console.log(`🔍 Buscando autocompletado para: "${query}"`);
      const result = await productService.autocompleteProducts(query);
      console.log(`📋 Resultado autocompletado:`, result);
      
      if (result.success && result.data?.suggestions) {
        setSuggestions(result.data.suggestions);
        console.log(`✅ Sugerencias encontradas: ${result.data.suggestions.length}`);
      } else {
        setSuggestions([]);
        console.log(`❌ No se encontraron sugerencias`);
      }
    } catch (error) {
      console.error('❌ Error en autocompletado:', error);
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = async (suggestion: string) => {
    try {
      console.log(`🎯 Sugerencia seleccionada: "${suggestion}"`);
      // Buscar productos que coincidan con la sugerencia
      const result = await productService.searchProducts({ query: suggestion, limit: 1 });
      console.log(`📋 Resultado búsqueda completa:`, result);
      
      if (result.success && result.data?.productos && result.data.productos.length > 0) {
        // Tomar el primer producto encontrado
        const product = result.data.productos[0];
        console.log(`✅ Producto encontrado:`, product);
        setSelectedProduct(product);
        setIsModalOpen(true);
      } else {
        console.log(`❌ No se encontró producto para la sugerencia: "${suggestion}"`);
      }
    } catch (error) {
      console.error('❌ Error al buscar producto:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      console.log(`🔍 Búsqueda directa para: "${query}"`);
      const result = await productService.searchProducts({ query, limit: 1 });
      console.log(`📋 Resultado búsqueda directa:`, result);
      
      if (result.success && result.data?.productos && result.data.productos.length > 0) {
        const product = result.data.productos[0];
        console.log(`✅ Producto encontrado en búsqueda directa:`, product);
        setSelectedProduct(result.data.productos[0]);
        setIsModalOpen(true);
      } else {
        console.log(`❌ No se encontró producto en búsqueda directa para: "${query}"`);
      }
    } catch (error) {
      console.error('❌ Error en búsqueda directa:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    handleCloseModal();
  };

  // Mostrar productos convertidos al formato de ProductCard
  const displayProducts = products.map(convertToProductCardFormat).slice(0, 8);

  return (
    <div className="flex flex-col justify-items-center min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white theme-transition">
      <div className="">
          <section
            className="relative flex items-center justify-center text-center"
            style={{
              backgroundImage: `url(${imagen1})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '600px', // Usa height en lugar de minHeight
            }}
          >
            <div className="absolute inset-0 bg-black opacity-50 dark:opacity-70"></div>
            <div className="relative z-10 flex flex-col items-center justify-center">
              <h1 className="font-koulen font-bold text-[128px] text-white drop-shadow-lg">
                Up to 30% off laptops
              </h1>
              <ShopNowButton />
            </div>
          </section>
        </div>
        
        {/* Sección de búsqueda */}
        <section className="max-w-4xl mx-auto px-4 mt-16">
          <div className="text-center mb-8">
            <h3 className="font-koulen text-[28px] text-gray-800 dark:text-white mb-4">
              ¿Qué estás buscando?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Escribe el nombre del producto y selecciona de las sugerencias
            </p>
          </div>
          <SearchBar
            placeholder="Buscar productos... (ej: headphones, laptop, gaming)"
            onSearch={handleSearch}
            onAutocomplete={handleAutocomplete}
            onSuggestionSelect={handleSuggestionSelect}
            suggestions={suggestions}
          />
        </section>
        
        <section className="text-center mt-20">
          <h3 className="font-koulen text-[32px] text-gray-800 dark:text-white">popular categories</h3>
        </section>
        <section className="flex flex-wrap justify-center mt-10 gap-6">
          {categories.map((category) => (
            <CategoryButtons
              key={category.value}
              icon={category.icon}
              label={category.label}
              value={category.value}
            />
          ))}
        </section>
        
        <section className="text-center mt-20">
          <h2 className="font-koulen text-[32px] text-gray-800 dark:text-white mb-6">TRENDING PRODUCTS</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-lg text-gray-600 dark:text-gray-400">Cargando productos...</div>
              </div>
            ) : displayProducts.length > 0 ? (
              displayProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-lg text-gray-600 dark:text-gray-400">No hay productos disponibles</div>
              </div>
            )}
          </div>
        </section>
        
        <section className="text-center mt-16">
          <h2 className="font-koulen text-[32px] text-gray-800 dark:text-white mb-6">NEW PRODUCTS</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-lg text-gray-600 dark:text-gray-400">Cargando productos...</div>
              </div>
            ) : displayProducts.length > 4 ? (
              displayProducts.slice(4, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-lg text-gray-600 dark:text-gray-400">No hay productos nuevos disponibles</div>
              </div>
            )}
          </div>
        </section>
        <section className="text-center text-white mt-16 mb-10"></section>
        
        {/* Modal del producto */}
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
        />
    </div>
  );
};


export default Home;

