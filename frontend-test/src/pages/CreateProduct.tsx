import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

const CreateProduct: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [form, setForm] = useState({
    descripcion: "",
    especificaciones: "",
    categoria: "",
    marca: "",
    color: "",
    año: "",
    precio: "",
    moneda: "",
    peso: "",
    envioNacional: "",
    envioInternacional: "",
    monedaEnvioNacional: "",
    monedaEnvioInternacional: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)].slice(0, 8));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de envío del producto
    console.log(form, images);
  };

  return (
    <div className="min-h-screen px-10 py-8 bg-white text-black font-sans">
      <h1 className="font-koulen text-[40px] mb-14">CREAR PRODUCTO</h1>

      <h2 className="font-lato text-[17px] mb-10">
        COLOQUE LAS IMÁGENES EN .PNG
      </h2>

      <div className="grid grid-cols-4 gap-10 mb-10">
        {[...Array(8)].map((_, index) => (
          <label
            key={index}
            className="w-full aspect-square bg-[#D9D9D9] flex items-center justify-center cursor-pointer"
          >
            {images[index] ? (
              <img
                src={URL.createObjectURL(images[index])}
                alt="preview"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-2xl text-gray-500">&#8682;</span> // icono de upload
            )}
            <input
              type="file"
              accept="image/png"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="font-lato font-semibold text-[18px] mb-10">
            CARACTERÍSTICAS
          </h3>

          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Describa el producto"
            className="w-full border-b border-[#B4B2B2] text-[15px] placeholder-[#B4B2B2] focus:outline-none focus:border-[#B4B2B2]"
            rows={1}
          />
        </div>

        <div className="mb-6">
          <h3 className="font-lato font-semibold text-[18px] mb-10">
            ESPECIFICACIONES
          </h3>

          <textarea
            name="especificaciones"
            value={form.especificaciones}
            onChange={handleChange}
            placeholder="Coloque datos particulares de cada producto (Composición, detalles, materiales, peso, componentes, etc)."
            className="w-full border-b border-[#B4B2B2] text-[15px] placeholder-[#B4B2B2] focus:outline-none focus:border-[#B4B2B2]"
            rows={1}
          />
        </div>

        {/* INFORMACIÓN */}
        <div className="mb-6 w-full">
          <h3 className="font-lato font-semibold text-[18px] mb-10">
            INFORMACIÓN
          </h3>

          <div className="grid grid-cols-2 gap-y-6 gap-x-10 text-sm w-full">
            {/* CATEGORÍA */}
            <div className="flex items-center gap-4 w-full">
              <span className="font-lato font-semibold text-[14px] text-[#6E6B6B] uppercase whitespace-nowrap">
                CATEGORÍA
              </span>
              <div className="flex-1 border-b border-[#6E6B6B]"></div>
              <select
                name="categoria"
                value={form.categoria || ""}
                onChange={handleChange}
                className="w-[160px] text-[14px] font-lato font-semibold uppercase bg-white outline-none"
                style={{
                  color: form.categoria ? "#000000" : "#6E6B6B",
                }}
              >
                <option value="">Seleccione</option>
                <option value="ropa">Ropa</option>
                <option value="tecnologia">Tecnología</option>
              </select>
            </div>

            {/* MARCA */}
            <div className="flex items-center gap-4 w-full">
              <span className="font-lato font-semibold text-[14px] text-[#6E6B6B] uppercase whitespace-nowrap">
                MARCA
              </span>
              <div className="flex-1 border-b border-[#6E6B6B]"></div>
              <select
                name="marca"
                value={form.marca || ""}
                onChange={handleChange}
                className="w-[160px] text-[14px] font-lato font-semibold uppercase bg-white outline-none"
                style={{
                  color: form.marca ? "#000000" : "#6E6B6B",
                }}
              >
                <option value="">Seleccione</option>
                <option value="samsung">Samsung</option>
                <option value="lg">LG</option>
              </select>
            </div>

            {/* COLOR */}
            <div className="flex items-center gap-4 w-full">
              <span className="font-lato font-semibold text-[14px] text-[#6E6B6B] uppercase whitespace-nowrap">
                COLOR
              </span>
              <div className="flex-1 border-b border-[#6E6B6B]"></div>
              <select
                name="color"
                value={form.color || ""}
                onChange={handleChange}
                className="w-[160px] text-[14px] font-lato font-semibold uppercase bg-white outline-none"
                style={{
                  color: form.color ? "#000000" : "#6E6B6B",
                }}
              >
                <option value="">Seleccione</option>
                <option value="negro">Negro</option>
                <option value="blanco">Blanco</option>
              </select>
            </div>

            {/* AÑO */}
            <div className="flex items-center gap-4 w-full">
              <span className="font-lato font-semibold text-[14px] text-[#6E6B6B] uppercase whitespace-nowrap">
                AÑO
              </span>
              <div className="flex-1 border-b border-[#6E6B6B]"></div>
              <select
                name="año"
                value={form.año || ""}
                onChange={handleChange}
                className="w-[160px] text-[14px] font-lato font-semibold uppercase bg-white outline-none"
                style={{
                  color: form.año ? "#000000" : "#6E6B6B",
                }}
              >
                <option value="">Seleccione</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>
        </div>

        {/* PRECIO */}
        <div className="mb-8 w-full">
          <h3 className="font-lato font-semibold text-[18px] mb-10">PRECIO</h3>

          <div className="flex items-center justify-between gap-6 w-full">
            {/* PRECIO (etiqueta izquierda) */}
            <span className="font-lato font-semibold text-[14px] text-[#6E6B6B] uppercase w-[120px]">
              PRECIO
            </span>

            {/* INPUT*/}
            <div className="flex items-center flex-1 gap-2">
              <div className="flex-1 border-b border-[#6E6B6B]"></div>

              <input
                name="precio"
                onChange={handleChange}
                value={form.precio || ""}
                placeholder="Coloque el precio"
                className="text-center text-[14px] font-lato outline-none placeholder-[#B4B2B2] text-[#000000] w-[180px]"
                style={{ border: "none", background: "transparent" }}
              />

              <div className="flex-1 border-b border-[#6E6B6B]"></div>
            </div>

            {/* SELECT MONEDA*/}
            <select
              name="moneda"
              onChange={handleChange}
              value={form.moneda || ""}
              className="w-[160px] text-[14px] font-lato font-semibold uppercase bg-white outline-none text-center"
              style={{
                color: form.moneda ? "#000000" : "#6E6B6B",
              }}
            >
              <option value="">Seleccione</option>
              <option value="PEN">PEN</option>
              <option value="USD">USD</option>
              <option value="MXN">MXN</option>
            </select>
          </div>
        </div>

        {/* ENVÍO */}
        <div className="mb-8 w-full">
          <h3 className="font-lato font-semibold text-[18px] mb-10 uppercase">
            ENVÍO
          </h3>

          {/* PESO */}
          <div className="flex items-center justify-between gap-6 w-full mb-6">
            <span className="font-lato font-semibold text-[14px] text-[#6E6B6B] uppercase w-[220px]">
              PESO (kg)
            </span>

            <div className="flex items-center flex-1 gap-2">
              {/* Línea a la izquierda, más corta */}
              <div className="w-full border-b border-[#6E6B6B] max-w-[40%]"></div>

              {/* Input a la derecha */}
              <input
                name="peso"
                onChange={handleChange}
                value={form.peso || ""}
                placeholder="Coloque el peso en kg"
                className="text-left text-[14px] font-lato outline-none placeholder-[#B4B2B2] text-[#000000] w-[200px]"
                style={{ border: "none", background: "transparent" }}
              />
            </div>

            {/* Sin selector aquí */}
            <div className="w-[160px]"></div>
          </div>

          {/* COSTO DE ENVÍO DOMÉSTICO */}
          <div className="flex items-center justify-between gap-6 w-full mb-6">
            <span className="font-lato font-semibold text-[14px] text-[#6E6B6B] uppercase w-[220px]">
              Costo de Envío Doméstico
            </span>

            <div className="flex items-center flex-1 gap-2">
              <div className="flex-1 border-b border-[#6E6B6B]"></div>

              <input
                name="envioNacional"
                onChange={handleChange}
                value={form.envioNacional || ""}
                placeholder="Coloque el precio"
                className="text-center text-[14px] font-lato outline-none placeholder-[#B4B2B2] text-[#000000] w-[180px]"
                style={{ border: "none", background: "transparent" }}
              />

              <div className="flex-1 border-b border-[#6E6B6B]"></div>
            </div>

            <select
              name="monedaEnvioNacional"
              onChange={handleChange}
              value={form.monedaEnvioNacional || ""}
              className="w-[160px] text-[14px] font-lato font-semibold uppercase bg-white outline-none text-center"
              style={{
                color: form.monedaEnvioNacional ? "#000000" : "#6E6B6B",
              }}
            >
              <option value="">Seleccione</option>
              <option value="PEN">PEN</option>
              <option value="USD">USD</option>
              <option value="MXN">MXN</option>
            </select>
          </div>

          {/* COSTO DE ENVÍO INTERNACIONAL */}
          <div className="flex items-center justify-between gap-6 w-full">
            <span className="font-lato font-semibold text-[14px] text-[#6E6B6B] uppercase w-[220px]">
              Costo de Envío Internacional
            </span>

            <div className="flex items-center flex-1 gap-2">
              <div className="flex-1 border-b border-[#6E6B6B]"></div>

              <input
                name="envioInternacional"
                onChange={handleChange}
                value={form.envioInternacional || ""}
                placeholder="Coloque el precio"
                className="text-center text-[14px] font-lato outline-none placeholder-[#B4B2B2] text-[#000000] w-[180px]"
                style={{ border: "none", background: "transparent" }}
              />

              <div className="flex-1 border-b border-[#6E6B6B]"></div>
            </div>

            <select
              name="monedaEnvioInternacional"
              onChange={handleChange}
              value={form.monedaEnvioInternacional || ""}
              className="w-[160px] text-[14px] font-lato font-semibold uppercase bg-white outline-none text-center"
              style={{
                color: form.monedaEnvioInternacional ? "#000000" : "#6E6B6B",
              }}
            >
              <option value="">Seleccione</option>
              <option value="PEN">PEN</option>
              <option value="USD">USD</option>
              <option value="MXN">MXN</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-3 mt-4 hover:bg-gray-800 transition"
        >
          CREAR PRODUCTO
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;