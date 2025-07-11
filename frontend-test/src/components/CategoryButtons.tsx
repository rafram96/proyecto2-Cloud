import { useNavigate } from 'react-router-dom';
import type { FC } from 'react';

interface CategoryButtonsProps {
  icon: React.ReactNode;
  label: string; // texto a mostrar
  value: string; // valor real para filtrar categoría
}

const CategoryButtons: FC<CategoryButtonsProps> = ({ icon, label, value }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const query = new URLSearchParams({ category: value }).toString();
    navigate(`/search?${query}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-white dark:bg-gray-700 text-black dark:text-white hover:scale-105 transition transform duration-200 shadow-md hover:shadow-lg theme-transition"
      aria-label={label}
    >
      {icon}
    </button>
  );
};

export default CategoryButtons;
