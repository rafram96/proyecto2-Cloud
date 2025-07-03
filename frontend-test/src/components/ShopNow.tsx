import { useNavigate } from 'react-router-dom';

const ShopNowButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/search');
  };

  return (
    <button
      onClick={handleClick}
      className="bg-white text-black font-bold py-6 px-12 rounded-full text-lg hover:underline transition duration-200"
    >
      SHOP NOW
    </button>
  );
};

export default ShopNowButton;
