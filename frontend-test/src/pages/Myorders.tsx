import React, { useState } from 'react';
import foto2 from '../assets/lenovo2.png';
import foto3 from '../assets/lenovo3.png';
import foto4 from '../assets/lenovo4.png'; 
import SearchBar from '../components/SearchBar';

const orders = [
  {
    id: "1",
    status: "In Progress",
    total: "PEN 8,520",
    products: [foto4, foto2, foto3],
  },
  {
    id: "2",
    status: "Shipped ",
    total: "PEN 5,199",
    products: [foto3, foto4, foto2],
  },
];

const Myorders: React.FC = () => {
  const [filter, setFilter] = useState('');
  const filtered = orders.filter(o => o.id.includes(filter) || o.status.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="min-h-screen pt-[40px] font-lato bg-gray-50 dark:bg-gray-900 theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-koulen text-gray-900 dark:text-gray-100 text-[40px] mb-12 drop-shadow-sm">MY ORDERS</h1>

      {/* Barra de filtrado */}
      <SearchBar placeholder="Filtrar órdenes..." onSearch={setFilter} />

      <div className="flex flex-col gap-16">
        {filtered.map((order, index) => (
          <div
            key={index}
            className="flex justify-between gap-10 border-b border-gray-300 dark:border-gray-600 pb-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg dark:shadow-2xl theme-transition"
          >
            {/* Columna izquierda: estado, total y enlace */}
            <div className="w-1/4 flex flex-col gap-5 self-end text-gray-700 dark:text-gray-300 text-[14px] font-lato">
              <p className="uppercase font-medium text-blue-600 dark:text-blue-400">{order.status}</p>
              <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{order.total}</p>
              <a
                href={`/view-order/${order.id}`}
                className="underline text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
              >
                View Order
              </a>
            </div>
             {/* Columna derecha: galería de productos */}
            <div className="w-3/4 grid grid-cols-3 gap-6">
              {order.products.map((src, idx) => (
                <div
                  key={idx}
                  className="w-70 h-[200px] flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md dark:hover:shadow-xl theme-transition"
                >
                  <img
                    src={src}
                    alt={`Producto ${idx + 1}`}
                    className="object-contain max-h-[180px] rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Myorders;

