import React from 'react';

const orders = [
  {
    id: "54046838624",
    status: "EN CURSO",
    total: "PEN 8,520",
    products: ["/img2.png", "/img1.png", "/img4.png"],
  },
  {
    id: "54046838625",
    status: "ENVIADO",
    total: "PEN 5,199",
    products: ["/img1.png", "/img3.png"],
  },
];

const Myorders: React.FC = () => {
  return (
    <div className="p-10 font-lato text-[#434343]">
      <h1 className="font-koulen text-[40px] mb-12">MY ORDERS</h1>

      <div className="flex flex-col gap-16">
        {orders.map((order, index) => (
          <div
            key={index}
            className="flex justify-between gap-10 border-b border-[#dcdcdc] pb-10"
          >
            {/* Columna izquierda: estado, total y enlace */}
            <div className="w-1/4 flex flex-col gap-5 self-end text-[14px] font-lato text-[#434343]">
              <p className="uppercase">{order.status}</p>
              <p className="font-semibold">{order.total}</p>
              <a
                href={`/view-order/${order.id}`}
                className="underline text-[#434343]"
              >
                Ver pedido
              </a>
            </div>
             {/* Columna derecha: galería de productos */}
            <div className="w-3/4 grid grid-cols-3 gap-6">
              {order.products.map((src, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-[#D9D9D9] flex items-center justify-center"
                >
                  <img
                    src={src}
                    alt={`Producto ${idx + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Myorders;

