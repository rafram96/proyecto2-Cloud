import React, { useState, useEffect } from 'react';
import '../components/ShopNow.tsx'
import ShopNowButton from '../components/ShopNow.tsx';
import { FaGamepad, FaMobileAlt, FaLaptop, FaHeadphones, FaPlug, FaTv } from 'react-icons/fa';
import CategoryButtons from '../components/CategoryButtons';
import imagen1 from '../assets/images/imagen1.jpg';
import ProductCard from '../components/ProductCard.tsx';
import { productService } from '../services/productService';
import type { Product } from '../types/product';
import { useAuth } from '../contexts/AuthContext';

const categories = [
  { icon: <FaGamepad size={50} />, label: 'Gaming Gear' },
  { icon: <FaMobileAlt size={50} />, label: 'Smartphones' },
  { icon: <FaLaptop size={50} />, label: 'Laptops & PCs' },
  { icon: <FaHeadphones size={50} />, label: 'Audio & Headphones' },
  { icon: <FaPlug size={50} />, label: 'Accessories' },
  { icon: <FaTv size={50} />, label: 'TV & Monitors' },
];

// Función para convertir el producto de la API al formato esperado por ProductCard
const convertToProductCardFormat = (product: Product) => ({
  id: product.codigo,
  name: product.nombre,
  price: product.precio,
  image: product.imagen_url || '/placeholder-image.jpg',
  category: product.categoria,
});

const Home: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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
        <section className="text-center mt-20">
          <h3 className="font-koulen text-[32px] text-gray-800 dark:text-white">popular categories</h3>
        </section>
        <section className="flex flex-wrap justify-center mt-10 gap-6">
          {categories.map((category) => (
            <CategoryButtons
              key={category.label}
              icon={category.icon}
              label={category.label}
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
    </div>
  );
};


export default Home;

