import React from 'react';
import foto1 from '../assets/lenovo.png';
import foto2 from '../assets/lenovo2.png';
import foto3 from '../assets/lenovo3.png';
import foto4 from '../assets/lenovo4.png'; 

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
  return (
    <div className="min-h-screen  pt-[40px] font-lato ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-koulen text-black text-[40px] mb-12">MY ORDERS</h1>

      <div className="flex flex-col gap-16">
        {orders.map((order, index) => (
          <div
            key={index}
            className="flex justify-between gap-10 border-b border-[#dcdcdc] pb-10"
          >
            {/* Columna izquierda: estado, total y enlace */}
            <div className="w-1/4 flex flex-col gap-5 self-end text-gris2 text-[14px] font-lato text-[#434343]">
              <p className="uppercase">{order.status}</p>
              <p className="font-semibold">{order.total}</p>
              <a
                href={`/view-order/${order.id}`}
                className="underline text-[#434343] hover:text-amarillo1 transition-colors duration-200"
              >
                View Order
              </a>
            </div>
             {/* Columna derecha: galería de productos */}
            <div className="w-3/4 grid grid-cols-3 gap-6">
              {order.products.map((src, idx) => (
                <div
                  key={idx}
                  className="w-70 h-[200px] flex items-center justify-center"
                >
                  <img
                    src={src}
                    alt={`Producto ${idx + 1}`}
                    className="object-contain "
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

