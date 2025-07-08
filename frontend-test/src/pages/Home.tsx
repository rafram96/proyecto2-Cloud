import React from 'react';
import '../components/ShopNow.tsx'
import ShopNowButton from '../components/ShopNow.tsx';
import { FaGamepad, FaMobileAlt, FaLaptop, FaHeadphones, FaPlug, FaTv } from 'react-icons/fa';
import CategoryButtons from '../components/CategoryButtons';
import imagen1 from '../assets/images/imagen1.jpg';
import ProductCard from '../components/ProductCard.tsx';
import Lenovo from '../assets/lenovo.png';

const categories = [
  { icon: <FaGamepad size={50} />, label: 'Gaming Gear' },
  { icon: <FaMobileAlt size={50} />, label: 'Smartphones' },
  { icon: <FaLaptop size={50} />, label: 'Laptops & PCs' },
  { icon: <FaHeadphones size={50} />, label: 'Audio & Headphones' },
  { icon: <FaPlug size={50} />, label: 'Accessories' },
  { icon: <FaTv size={50} />, label: 'TV & Monitors' },
];

const sampleProducts = [
  {
    id: '1',
    name: 'Lenovo LOQ 9na Gen (15" Intel) con RTX™ 3050',
    price: 3700,
    originalPrice: 4000,
    discount: 26,
    image: Lenovo,
    category: 'laptops',
  },
];



const Home: React.FC = () => {
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
            {sampleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
            ))}
            {sampleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
            ))}
            {sampleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
            ))}
            {sampleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
        <section className="text-center mt-16">
          <h2 className="font-koulen text-[32px] text-gray-800 dark:text-white mb-6">NEW PRODUCTS</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {sampleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
            ))}
            {sampleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
            ))}
            {sampleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
            ))}
            {sampleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
        <section className="text-center text-white mt-16 mb-10"></section>
    </div>
  );
};


export default Home;

