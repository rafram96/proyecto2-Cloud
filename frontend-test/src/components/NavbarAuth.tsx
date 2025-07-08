import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const NavbarAuth: React.FC = () => {
  const navigate = useNavigate();

  const handleHome = () => navigate('/');
  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');

  // Para páginas de auth, usar nombre genérico ya que no hay usuario logueado
  const brandName = 'E-COMMERCE';

  return (
    <div className="bg-black dark:bg-gray-950 fixed inset-x-0 top-0 h-16 px-8 flex items-center justify-between text-2xl w-full z-50 border-b border-gray-800 dark:border-gray-800 theme-transition shadow-lg">
      <button
          onClick={handleHome}
          className="relative bg-transparent border-none outline-none text-white hover:text-yellow-400 dark:hover:text-yellow-300 transition duration-300 glow-text"
        >
        <div className="font-rubik text-xl cursor-pointer font-bold tracking-wide" onClick={handleHome}>
          {brandName}
        </div>
      </button>

      <div className="flex gap-4 items-center">
        <ThemeToggle />
        <button
          onClick={handleLogin}
          className="font-jaldi text-[18px] bg-transparent border-none outline-none text-gray-200 dark:text-gray-300 hover:text-yellow-400 dark:hover:text-yellow-300 transition duration-300 px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800 border border-transparent hover:border-yellow-400 dark:hover:border-yellow-300"
        >
          Login
        </button>
        <button
          onClick={handleRegister}
          className="font-jaldi text-[18px] bg-yellow-500 dark:bg-yellow-400 text-black dark:text-gray-900 hover:bg-yellow-400 dark:hover:bg-yellow-300 transition duration-300 px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl border border-yellow-500 dark:border-yellow-400"
        >
          Register
        </button>

      </div>
    </div>
  );
};

export default NavbarAuth;
