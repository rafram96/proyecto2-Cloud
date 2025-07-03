import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleHome = () => navigate('/');
  const handleCart = () => navigate('/cart');
  const handleOrders = () => navigate('/orders');
  const handleLogin = () => navigate('/login');

  return (
    <div className=" bg-[#000000] fixed inset-x-0 top-0 h-16 px-8 flex items-center justify-between text-2xl  w-full z-50">
      
      <button
          onClick={handleHome}
          className="relative bg-transparent border-none outline-none text-secondary hover:text-[#FFF0AD] transition duration-300"
        >
        <div className="font-rubik text-xl cursor-pointer text-secondary" onClick={handleHome}>
          ELEKTRA
        </div>
      </button>

      <div className="flex gap-8">
        <button
          onClick={handleLogin}
          className="font-jaldi text-[20px] bg-transparent border-none outline-none text-secondary hover:text-[#FFF0AD] transition duration-300"
        >
          Account
        </button>
        <button
          onClick={handleOrders}
          className="font-jaldi text-[20px] bg-transparent border-none outline-none text-secondary hover:text-[#FFF0AD] transition duration-300"
        >
          My Orders
        </button>
        <button
          onClick={handleCart}
          className="relative bg-transparent border-none outline-none text-secondary hover:text-[#FFF0AD] transition duration-300"
        >
          <svg
            className="h-8 w-8 text-secondary hover:text-[#FFF0AD] transition duration-300"
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

          <span className="sr-only"></span>

          <div className="absolute -bottom-1 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-black bg-white rounded-full">
            2
          </div>
        </button>

      </div>
    </div>
  );
};

export default Navbar;
