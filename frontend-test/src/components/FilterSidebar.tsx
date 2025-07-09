import React from 'react';

interface FilterSidebarProps {
  onCategoryChange: (categories: string[]) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  selectedCategories: string[];
  priceRange: { min: number; max: number };
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  onCategoryChange,
  onPriceRangeChange,
  selectedCategories,
  priceRange
}) => {
  const categories = [
    'All',
    'Gaming Gear',
    'Smartphones',
    'Laptops & PCs',
    'Audio & Headphones',
    'Accessories',
    'TV & Monitors'
  ];

  const handleCategoryChange = (category: string) => {
    if (category === 'All') {
      onCategoryChange([]);
      return;
    }

    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    onCategoryChange(updatedCategories);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = parseInt(value);
    
    if (name === 'min') {
      onPriceRangeChange(newValue, priceRange.max);
    } else {
      onPriceRangeChange(priceRange.min, newValue);
    }
  };

  return (
    <div className="w-full lg:w-64 p-4 lg:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-2xl theme-transition">
      <h2 className="text-[28px] lg:text-[32px] font-koulen font-bold mb-2 text-gray-900 dark:text-gray-100">FILTER OPTIONS</h2>
      <div className="w-full h-px bg-yellow-400 dark:bg-yellow-500 mb-4"></div>
      
      {/* Categories Filter */}
      <div className="mb-6 lg:mb-8">
        <h3 className="text-[20px] lg:text-[24px] font-jaldi font-semibold mb-3 text-gray-900 dark:text-gray-100">By Categories</h3>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-3">
          {categories.map((category) => (
            <label key={category} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                className="appearance-none w-4 h-4 border-2 border-yellow-400 dark:border-yellow-500 rounded-sm checked:bg-gray-900 dark:checked:bg-gray-100 checked:border-gray-900 dark:checked:border-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 transition duration-150 flex-shrink-0"
                checked={category === 'All' ? selectedCategories.length === 0 : selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
              />
              <span className="ml-3 text-sm lg:text-base text-gray-900 dark:text-gray-100 font-jaldi group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-200">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="w-full h-px bg-yellow-400 dark:bg-yellow-500 mb-4"></div>
      <div>
        <h3 className="text-[20px] lg:text-[24px] font-jaldi font-semibold mb-3 text-gray-900 dark:text-gray-100">Price</h3>
        <div className="mb-4">
          <div className="flex items-center justify-center lg:justify-start mb-4 gap-2">
            <span className="text-[17px] font-jaldi text-gray-900 dark:text-gray-100">S/.</span>
            <input
              type="number"
              name="min"
              value={priceRange.min}
              onChange={handlePriceChange}
              className="w-16 lg:w-15 text-[15px] px-1 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 theme-transition"
              min="100"
              max={priceRange.max - 100}
            />
            <span className="text-[17px] font-jaldi text-gray-900 dark:text-gray-100">-</span>
            <span className="text-[17px] font-jaldi text-gray-900 dark:text-gray-100">S/.</span>
            <input
              type="number"
              name="max"
              value={priceRange.max}
              onChange={handlePriceChange}
              className="w-16 lg:w-15 text-[15px] px-1 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 theme-transition"
              min={priceRange.min + 100}
              max="4000"
            />
          </div>
          
          {/* Sliders superpuestos */}
            <div className="relative h-6">
              {/* Barra de fondo gris */}
              <div className="absolute top-1 left-0 right-0 h-2 bg-amarillo3 rounded-full -translate-y-1/2 z-10" />


              {/* Barra activa */}
              <div
                className="absolute top-1 h-2 bg-black rounded-full -translate-y-1 z-10"
                style={{
                  left: `${((priceRange.min - 100) / 3900) * 100}%`,
                  width: `${((priceRange.max - priceRange.min) / 3900) * 100}%`,
                }}
              />

              {/* Slider MIN */}
              <input
                type="range"
                min="100"
                max="4000"
                value={priceRange.min}
                onChange={(e) =>
                  onPriceRangeChange(Math.min(+e.target.value, priceRange.max - 100), priceRange.max)
                }
                className="absolute w-full h-2 appearance-none rounded-full bg-transparent z-30 pointer-events-none
                  [&::-webkit-slider-thumb]:pointer-events-auto
                  [&::-webkit-slider-thumb]:bg-black
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:appearance-none"
            />

              {/* Slider MAX */}
              <input
                type="range"
                min="100"
                max="4000"
                value={priceRange.max}
                onChange={(e) =>
                  onPriceRangeChange(priceRange.min, Math.max(+e.target.value, priceRange.min + 100))
                }
                className="absolute w-full h-2 appearance-none rounded-full bg-transparent z-20 pointer-events-none
                  [&::-webkit-slider-thumb]:pointer-events-auto
                  [&::-webkit-slider-thumb]:bg-black
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:appearance-none"
            />

                          

            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>S/. 100.00</span>
              <span>S/. 4000.00</span>
            </div>
            
          
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;