import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import foto from '../assets/lenovo.png';

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
// Mock data - reemplaza esto con tu API real
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto,
    category: 'Laptops & PCs',
    specs: ['Intel i5', 'RTX 3050', '16GB RAM']
  },
  {
    id: '2',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto,
    category: 'Laptops & PCs',
    specs: ['Intel i5', 'RTX 3050', '16GB RAM']
  },
  {
    id: '3',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto,
    category: 'Laptops & PCs',
    specs: ['Intel i5', 'RTX 3050', '16GB RAM']
  },
  {
    id: '4',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto,
    category: 'Laptops & PCs',
    specs: ['Intel i5', 'RTX 3050', '16GB RAM']
  },
  {
    id: '5',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto,
    category: 'Laptops & PCs',
    specs: ['Intel i5', 'RTX 3050', '16GB RAM']
  },
  {
    id: '6',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto,
    category: 'Laptops & PCs',
    specs: ['Intel i5', 'RTX 3050', '16GB RAM']
  },
  {
    id: '7',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto,
    category: 'Laptops & PCs',
    specs: ['Intel i5', 'RTX 3050', '16GB RAM']
  },
  {
    id: '8',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto,
    category: 'Laptops & PCs',
    specs: ['Intel i5', 'RTX 3050', '16GB RAM']
  },
  {
    id: '9',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto,
    category: 'Laptops & PCs',
    specs: ['Intel i5', 'RTX 3050', '16GB RAM']
  },
  {
    id: '10',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto,
    category: 'Laptops & PCs',
    specs: ['Intel i5', 'RTX 3050', '16GB RAM']
  },
  {
    id: '11',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto,
    category: 'Laptops & PCs',
    specs: ['Intel i5', 'RTX 3050', '16GB RAM']
  },
  {
    id: '12',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto,
    category: 'Laptops & PCs',
    specs: ['Intel i5', 'RTX 3050', '16GB RAM']
  },
  {
    id: '13',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: foto,
    category: 'Laptops & PCs',
    specs: ['Intel i5', 'RTX 3050', '16GB RAM']
  },
  
  // Agrega más productos aquí...
];

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 100, max: 4000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [products] = useState<Product[]>(mockProducts);
  
  const productsPerPage = 12;

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchQuery, selectedCategories, priceRange]);

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredProducts, currentPage]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
    setCurrentPage(1);
  };

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
    setCurrentPage(1);
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
    <div className="min-h-screen">
      {/* Header con buscador */}
      <div className="bg-white mt-4 ">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-3 pl-12 border border-black font-jaldi rounded-full focus:outline-none focus:ring-2 focus:ring-amarillo1 focus:border-transparent"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar de filtros */}
        <FilterSidebar
          onCategoryChange={handleCategoryChange}
          onPriceRangeChange={handlePriceRangeChange}
          selectedCategories={selectedCategories}
          priceRange={priceRange}
        />

        {/* Contenido principal */}
        
        <div className="flex-1 p-6">
          {/* Resultados info */}
          <div className="mt-6 mb-2">
            <p className="text-gray-600 text-[16px] font-jaldi">
              Showing {((currentPage - 1) * productsPerPage) + 1}-{Math.min(currentPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length} results
            </p>
          </div>
          <div className="w-95 h-px bg-amarillo1 mb-2"></div>
          {/* Grid de productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Mensaje si no hay productos */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            </div>
          )}
          
          {/* Paginación */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;