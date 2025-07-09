import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import { productService } from '../services/productService';
import type { Product } from '../types/product';
import { useAuth } from '../contexts/AuthContext';

export interface ProductCardFormat {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  specs?: string[];
}

// Función para convertir el producto de la API al formato esperado por ProductCard
const convertToProductCardFormat = (product: Product): ProductCardFormat => ({
  id: product.codigo,
  name: product.nombre,
  price: product.precio,
  image: product.imagen_url || '/placeholder-image.jpg',
  category: product.categoria,
  specs: product.tags || [],
});

const Search: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const categoryParam = searchParams.get('category');

  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryParam ? [categoryParam] : []);
  const [priceRange, setPriceRange] = useState({ min: 100, max: 4000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const productsPerPage = 16;

  // Cargar productos desde la API
  useEffect(() => {
    const loadProducts = async () => {
      if (user?.tenantId) {
        try {
          setLoading(true);
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

   // Escucha cambios en la URL y actualiza la categoría
  useEffect(() => {
    const param = searchParams.get('category');
    if (param) {
      setSelectedCategories([param]);
    }
  }, [searchParams]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.categoria);
      const matchesPrice = product.precio >= priceRange.min && product.precio <= priceRange.max;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchQuery, selectedCategories, priceRange]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage).map(convertToProductCardFormat);
  }, [filteredProducts, currentPage]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
    setCurrentPage(1);
  };

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
    setCurrentPage(1);
    // Cerrar filtros en móvil después de seleccionar
    if (window.innerWidth < 1024) {
      setShowFilters(false);
    }
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con buscador */}
        <div className="bg-white dark:bg-gray-800 mt-7 rounded-xl shadow-lg dark:shadow-2xl theme-transition">
          <div className="px-6 py-6">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-jaldi rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 theme-transition"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Contenedor principal con sidebar y contenido */}
        <div className="lg:flex gap-6 mt-6 space-y-6 lg:space-y-0">
          {/* Botón de filtros para móvil */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors theme-transition"
            >
              <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300 font-jaldi">
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </span>
            </button>
          </div>

          {/* Sidebar de filtros */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-80 lg:flex-shrink-0`}>
            <FilterSidebar
              onCategoryChange={handleCategoryChange}
              onPriceRangeChange={handlePriceRangeChange}
              selectedCategories={selectedCategories}
              priceRange={priceRange}
            />
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            {/* Resultados info */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 text-[16px] font-jaldi">
                {loading ? 'Cargando productos...' : 
                 `Mostrando ${((currentPage - 1) * productsPerPage) + 1}-${Math.min(currentPage * productsPerPage, filteredProducts.length)} de ${filteredProducts.length} resultados`}
              </p>
              <div className="w-full h-px bg-yellow-400 dark:bg-yellow-500 mt-2"></div>
            </div>
            
            {/* Grid de productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {loading ? (
                // Skeleton loading
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse shadow-sm">
                    <div className="bg-gray-300 dark:bg-gray-600 h-48 rounded mb-4"></div>
                    <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded mb-2"></div>
                    <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded w-2/3"></div>
                  </div>
                ))
              ) : (
                paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>

            {/* Mensaje si no hay productos */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="flex flex-col items-center">
                  <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-jaldi">No se encontraron productos que coincidan con tus criterios.</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Intenta ajustar los filtros o la búsqueda.</p>
                </div>
              </div>
            )}
            
            {/* Paginación */}
            {!loading && totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;