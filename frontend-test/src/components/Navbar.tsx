import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import ThemeToggle from './ThemeToggle';
import { TenantSwitcher } from './TenantSwitcher';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();

  const handleHome = () => navigate('/');
  const handleCart = () => navigate('/cart');
  const handleOrders = () => navigate('/orders');
  const handleMyProducts = () => navigate('/my-products');
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartItemCount = getItemCount();

  // Usar tenantId como nombre de marca, con fallback a 'ELEKTRA'
  const brandName = user?.tenantId?.toUpperCase() || 'ELEKTRA';

  return (
    <div className="fixed inset-x-0 top-0 h-16 px-8 flex items-center justify-between text-2xl w-full z-50 bg-black dark:bg-gray-950 text-white border-b border-gray-800 dark:border-gray-800 theme-transition shadow-lg">
      <button
        onClick={handleHome}
        className="relative bg-transparent border-none outline-none transition duration-300 text-white hover:text-yellow-400 dark:hover:text-yellow-300 glow-text"
      >
        <div className="font-rubik text-xl cursor-pointer font-bold tracking-wide">
          {brandName}
        </div>
      </button>

      <div className="flex gap-4 items-center">
        <TenantSwitcher />
        <span className="font-jaldi text-[16px] text-gray-300 dark:text-gray-400">
          {user?.email}
        </span>
        <ThemeToggle />
        <button 
          onClick={handleOrders} 
          className="font-jaldi text-[18px] bg-transparent border-none outline-none transition duration-300 text-gray-200 dark:text-gray-300 hover:text-yellow-400 dark:hover:text-yellow-300 px-3 py-1 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800"
        >
          My Orders
        </button>
        <button 
          onClick={handleMyProducts} 
          className="font-jaldi text-[18px] bg-transparent border-none outline-none transition duration-300 text-gray-200 dark:text-gray-300 hover:text-yellow-400 dark:hover:text-yellow-300 px-3 py-1 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800"
        >
          My Products
        </button>
        <button
          onClick={handleCart}
          className="relative bg-transparent border-none outline-none transition duration-300 text-gray-200 dark:text-gray-300 hover:text-yellow-400 dark:hover:text-yellow-300 p-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800"
        >
          <svg
            className="h-7 w-7 transition duration-300"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" />
            <circle cx="9" cy="19" r="2" />
            <circle cx="17" cy="19" r="2" />
            <path d="M3 3h2l2 12a3 3 0 0 0 3 2h7a3 3 0 0 0 3-2l1-7h-15.2" />
          </svg>
          <div className="absolute -bottom-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-black bg-yellow-400 dark:bg-yellow-300 rounded-full shadow-lg">
            {cartItemCount}
          </div>
        </button>
        <button 
          onClick={handleLogout} 
          className="font-jaldi text-[18px] bg-transparent border-none outline-none transition duration-300 text-gray-200 dark:text-gray-300 hover:text-red-400 dark:hover:text-red-300 px-3 py-1 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
