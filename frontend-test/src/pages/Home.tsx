import React from 'react';
import '../components/ShopNow.tsx'
import ShopNowButton from '../components/ShopNow.tsx';
import { FaGamepad, FaMobileAlt, FaLaptop, FaHeadphones, FaPlug, FaTv } from 'react-icons/fa';
import CategoryButtons from '../components/CategoryButtons';
import imagen1 from '../assets/images/imagen1.jpg';
import ProductCard from '../components/ProductCard.tsx';
import Lenovo from '../assets/lenovo.png';

const categories = [
  { icon: <FaGamepad size={28} />, label: 'Gaming', to: '/category/gaming' },
  { icon: <FaMobileAlt size={28} />, label: 'Mobile', to: '/category/mobile' },
  { icon: <FaLaptop size={28} />, label: 'Laptops', to: '/category/laptops' },
  { icon: <FaHeadphones size={28} />, label: 'Audio', to: '/category/audio' },
  { icon: <FaPlug size={28} />, label: 'Accessories', to: '/category/accessories' },
  { icon: <FaTv size={28} />, label: 'Monitors', to: '/category/monitors' },
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
    <div className="flex flex-col  justify-items-center min-h-screen bg-black text-white">
        <section className="relative text-center" style={{
  backgroundImage: `url(${imagen1})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '600px',}}>
    <div className="absolute inset-0 bg-black opacity-50"></div>
    <div className="relative z-10 flex flex-col items-center justify-center h-full">
      <h1 className="font-koulen mt-40 font-bold text-[128px] text-white ">Up to 30% off laptops</h1> 
      <ShopNowButton />
    </div>
        </section>
        <section className="text-center mt-10">
          <h3 className="font-koulen text-lg text-gray-500">popular categories</h3>
        </section>
        <section className="flex flex-wrap justify-center mt-10 gap-6">
          {categories.map((category) => (
            <CategoryButtons
              key={category.label}
              icon={category.icon}
              to={category.to}
              label={category.label}
            />
          ))}
        </section>
        <section className="text-center text-white mt-16">
          <h2 className="font-koulen text-xl mb-6">TRENDING PRODUCTS</h2>
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
        <section className="text-center text-white mt-16">
          <h2 className="font-koulen text-xl mb-6">NEW PRODUCTS</h2>
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

