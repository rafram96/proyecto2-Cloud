import React, { useState } from 'react';

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
    <div className="w-64 p-6 h-full">
      <h2 className="text-[32px] font-koulen font-bold mb-2 text-black">FILTER OPTIONS</h2>
      <div className="w-60 h-px bg-amarillo1 mb-2"></div>
      
      {/* Categories Filter */}
      <div className="mb-8">
        <h3 className="text-[24px] font-jaldi font-semibold mb-2 text-black">By Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <label key={category} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="appearance-none w-4 h-4 border-2 border-amarillo1 rounded-sm checked:bg-black checked:border-black focus:outline-none focus:ring-2 focus:ring-amarillo1 transition duration-150"
                checked={category === 'All' ? selectedCategories.length === 0 : selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
              />
              <span className="ml-3 text-black font-jaldi hover:text-gray-800">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="w-60 h-px bg-amarillo1 mb-3"></div>
      <div>
        <h3 className="text-[24px] font-jaldi font-semibold mb-3 text-black">Price</h3>
        <div className="mb-4">
          <div className="flex items-center mb-4">
            <span className="text-[17px] font-jaldi text-black">S/.</span>
            <input
              type="number"
              name="min"
              value={priceRange.min}
              onChange={handlePriceChange}
              className="w-15 text-[15px] px-2 py-1  "
              min="100"
              max={priceRange.max - 100}
            />
            <span className="text-[17px] font-jaldi text-black mx-2">-</span>
            <span className="text-[17px] ml-6 font-jaldi text-black">S/.</span>
            <input
              type="number"
              name="max"
              value={priceRange.max}
              onChange={handlePriceChange}
              className="w-15 text-[15px] px-2 py-1 "
              min={priceRange.min + 100}
              max="4000"
            />
          </div>
          
          {/* Price Range Slider */}
          <div className="relative mb-2">
            {/* Slider para MIN */}
            <div className="mb-3">
              <input
                type="range"
                min="100"
                max="3900"
                value={priceRange.min}
                onChange={(e) => onPriceRangeChange(parseInt(e.target.value), priceRange.max)}
                className="w-full h-2 bg-amarillo3 rounded-lg appearance-none cursor-pointer price-slider"
                style={{
                  background: ` ${((priceRange.min - 100) / 3800) * 100}%, ${((priceRange.min - 100) / 3800) * 100}%)`
                }}
              />
            </div>
            
            {/* Slider para MAX */}
            <div className="mb-3">
              
              <input
                type="range"
                min="200"
                max="4000"
                value={priceRange.max}
                onChange={(e) => onPriceRangeChange(priceRange.min, parseInt(e.target.value))}
                className="w-full h-2 bg-amarillo3 rounded-lg appearance-none cursor-pointer price-slider"
                style={{
                  background: ` ${((priceRange.max - 200) / 3800) * 100}%,  ${((priceRange.max - 200) / 3800) * 100}%)`
                }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-1">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;