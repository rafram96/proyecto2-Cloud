import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavbarA: React.FC = () => {
  const navigate = useNavigate();

  const handleHome = () => navigate('/');
  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');

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
          Login
        </button>
        <button
          onClick={handleRegister}
          className="font-jaldi text-[20px] bg-transparent border-none outline-none text-secondary hover:text-[#FFF0AD] transition duration-300"
        >
          Register
        </button>

      </div>
    </div>
  );
};

export default NavbarA;
