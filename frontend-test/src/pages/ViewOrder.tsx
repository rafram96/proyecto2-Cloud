import React from "react";
import foto1 from '../assets/lenovo.png';
import foto2 from '../assets/lenovo2.png';
import foto3 from '../assets/lenovo3.png';
import foto4 from '../assets/lenovo4.png';

const ViewOrder: React.FC = () => {
  const orderNumber = "54046838624";
  const purchaseDate = "20/06/2025";
  const returnDeadline = "20/07/2025";
  const images = [
    {
      src: foto1,
      name: "IPHONE 16 PRO MAX",
      price: "PEN 2.199,90",
      sku: "SKU001",
    },
    {
      src: foto2,
      name: "ROG Zephyrus G16 (2024) GU605",
      price: "PEN 2.199,90",
      sku: "SKU002",
    },
    {
      src: foto3,
      name: "Lenovo LOQ 9na Gen (15' Intel) con RTX™ 350",
      price: "PEN 2.199,90",
      sku: "SKU003",
    },
    {
      src: foto4,
      name: "SONY ILME-FX30",
      price: "PEN 2.199,90",
      sku: "SKU004",
    },
    {
      src: foto2,
      name: "IPHONE 16 PRO MAX",
      price: "PEN 2.199,90",
      sku: "SKU001",
    },
    {
      src: foto1,
      name: "ROG Zephyrus G16 (2024) GU605",
      price: "PEN 2.199,90",
      sku: "SKU002",
    },
    {
      src: foto3,
      name: "Lenovo LOQ 9na Gen (15' Intel) con RTX™ 3asdfasdfs050",
      price: "PEN 2.199,90",
      sku: "SKU003",
    },
    {
      src: foto4,
      name: "SONY ILME-FX30",
      price: "PEN 2.199,90",
      sku: "SKU004",
    },
  ];

  return (
    <div className="p-10">
      {/* Título */}
      <h1 className="font-koulen text-[40px] mb-13">VER PEDIDO</h1>

      {/* Info principal y QR */}
      <div className="mb-15 flex justify-between items-end gap-5">
        {/* Bloque de información */}
        <div className="flex flex-col gap-3 text-[14px] font-lato text-[#434343] uppercase">
          <p className="text-[20px] font-semibold normal-case mb-5">
            N° {orderNumber}
          </p>

          <div className="flex items-center gap-5">
            <span className="w-[400px] font-semibold mb-0">
              Fecha de Compra
            </span>
            <span className="font-normal normal-case">{purchaseDate}</span>
          </div>

          <div className="flex items-center gap-5">
            <span className="w-[400px] font-semibold mb-0">
              Límite de Devolución
            </span>
            <span className="font-normal normal-case">{returnDeadline}</span>
          </div>
        </div>

        {/* QR alineado abajo */}
        <div className="w-56 h-56 bg-[#D9D9D9] flex items-center justify-center shrink-0">
          <img
            src="/qr.png"
            alt="QR code"
            className="w-52 h-52 object-contain"
          />
        </div>
      </div>

      {/* Listo para la entrega */}
      <div className="flex items-center gap-24 mt-20 text-[#000000] font-lato">
        <span className="w-[200px] font-semibold uppercase">
          Listo para la entrega
        </span>
        <span className="font-normal normal-case"></span>
      </div>

      {/* Galería de imágenes */}
      <div className="grid grid-cols-4 gap-10 mb-10 mt-10">
        {images.map((item, index) => (
          <div key={index} className="w-full">
            <div className="aspect-square bg-[#D9D9D9] flex items-center justify-center">
              <img
                src={item.src}
                alt={`Producto ${index + 1}`}
                className="object-cover w-full h-full"
              />
            </div>
            {/* Detalles del producto */}
            <div className="mt-2 text-left text-[14px] font-semibold uppercase text-[#434343]">
              <p className="font-semibold mb-0 min-h-[48px] leading-snug">
                {item.name}
              </p>
              <p>{item.price}</p>
              <p>{item.sku}</p>
            </div>
          </div>
        ))}
      </div>

      {/* DETALLES ENVÍO + RESUMEN */}
      <div className="flex justify-between gap-20 mt-16 text-[14px] font-lato text-[#434343] w-full">
        {/* DETALLES ENVÍO */}
        <div className="flex flex-col gap-1 uppercase w-1/2">
          <p className="text-[20px] font-semibold normal-case mb-5">
            DETALLES ENVÍO
          </p>

          <span className="font-semibold">DIRECCIÓN DE ENTREGA</span>
          <span className="font-normal normal-case">
            Universidad de Ingeniería y Tecnología - UTEC
          </span>
          <span className="font-normal normal-case mt-4">
            JR. MEDRANO SILVA 165
          </span>
          <span className="font-normal normal-case">BARRANCO</span>
          <span className="font-normal normal-case">LIMA</span>
          <span className="font-normal normal-case">LIMA METROPOLITANA</span>
          <span className="font-normal normal-case">PERÚ</span>
        </div>

        {/* RESUMEN */}
        <div className="flex flex-col gap-3 w-1/2 text-[14px] font-lato text-[#434343]">
          <p className="text-[20px] font-semibold normal-case mb-5 uppercase">
            RESUMEN
          </p>

          <div className="flex justify-between">
            <span className="uppercase">6 ARTÍCULOS</span>
            <span className="text-end">14.999,90</span>
          </div>

          <div className="flex justify-between">
            <span className="uppercase">GASTOS DE ENVÍO</span>
            <span className="text-end">0,00</span>
          </div>

          <div className="flex justify-between border-t border-[#B4B2B2] pt-2 mt-2">
            <span className="uppercase font-semibold">TOTAL</span>
            <span className="text-end font-semibold">14.999,90</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;