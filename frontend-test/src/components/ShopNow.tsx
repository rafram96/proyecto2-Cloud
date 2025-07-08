import { useNavigate } from 'react-router-dom';

const ShopNowButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/search');
  };

  return (
    <button
      onClick={handleClick}
      className="bg-white dark:bg-gray-200 text-black dark:text-gray-900 font-jomhuria font-bold px-10 h-[70px] rounded-full text-[60px] 
             flex items-center justify-center 
             hover:bg-black hover:text-white dark:hover:bg-gray-800 dark:hover:text-white
             hover:scale-110 transition-all duration-300 ease-in-out theme-transition"
>
    <span className="relative top-[4px]">SHOP NOW</span>
    </button>
  );
};

export default ShopNowButton;
