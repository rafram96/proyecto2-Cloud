import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { useAuth } from "../contexts/AuthContext";
import './CreateProduct.css'; // Importar estilos

const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    stock: "",
    imagen_url: "",
    tags: "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user?.tenantId) {
      const file = e.target.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona solo archivos de imagen');
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        return;
      }

      setUploadingImage(true);
      setError("");

      try {
        const result = await productService.uploadImage(file, user.tenantId);
        if (result.success && result.data) {
          setForm({ ...form, imagen_url: result.data.imagen_url });
          setSuccess('Imagen subida exitosamente');
        } else {
          setError(result.error || 'Error al subir imagen');
        }
      } catch (error) {
        setError('Error al subir imagen');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nombre || !form.descripcion || !form.precio || !form.categoria || !form.stock) {
      setError('Todos los campos son requeridos');
      return;
    }

    const precio = parseFloat(form.precio);
    const stock = parseInt(form.stock);

    if (isNaN(precio) || precio <= 0) {
      setError('El precio debe ser un número mayor a 0');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      setError('El stock debe ser un número mayor o igual a 0');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const productData = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: precio,
        categoria: form.categoria,
        stock: stock,
        imagen_url: form.imagen_url,
        tags: form.tags ? form.tags.split(',').map(tag => tag.trim()) : [],
      };

      const result = await productService.crearProducto(productData);
      
      if (result.success) {
        setSuccess('Producto creado exitosamente');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(result.error || 'Error al crear producto');
      }
    } catch (error) {
      setError('Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-10 py-8 bg-white dark:bg-gray-900 text-black dark:text-white font-sans theme-transition">
      <h1 className="font-koulen text-[40px] mb-14 text-gray-900 dark:text-gray-100">CREAR PRODUCTO</h1>

      <h2 className="font-lato text-[17px] mb-10 text-gray-700 dark:text-gray-300">
        INFORMACIÓN DEL PRODUCTO
      </h2>

      <div className="mb-10">
        <h3 className="font-lato font-semibold text-[18px] mb-6 text-gray-900 dark:text-gray-100">
          IMAGEN DEL PRODUCTO
        </h3>
        
        {form.imagen_url ? (
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={form.imagen_url}
                alt="Vista previa"
                className="w-[300px] h-[200px] object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, imagen_url: "" })}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
              >
                ×
              </button>
            </div>
            <label htmlFor="file-upload" className="custom-file-upload cursor-pointer">
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="" xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z" fill=""></path>
                  </g>
                </svg>
              </div>
              <div className="text">
                <span>Cambiar imagen</span>
              </div>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <label htmlFor="file-upload" className="custom-file-upload cursor-pointer">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z" fill=""></path>
                </g>
              </svg>
            </div>
            <div className="text">
              <span>{uploadingImage ? 'Subiendo imagen...' : 'Click para subir imagen'}</span>
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />
          </label>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="font-lato font-semibold text-[18px] mb-10 text-gray-900 dark:text-gray-100">
            NOMBRE DEL PRODUCTO
          </h3>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ingrese el nombre del producto"
            className="w-full border-b border-[#B4B2B2] dark:border-gray-600 text-[15px] placeholder-[#B4B2B2] dark:placeholder-gray-500 focus:outline-none focus:border-[#B4B2B2] dark:focus:border-gray-400 bg-transparent text-gray-900 dark:text-gray-100 py-2"
            required
          />
        </div>

        <div className="mb-6">
          <h3 className="font-lato font-semibold text-[18px] mb-10 text-gray-900 dark:text-gray-100">
            DESCRIPCIÓN
          </h3>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Describa el producto"
            className="w-full border-b border-[#B4B2B2] dark:border-gray-600 text-[15px] placeholder-[#B4B2B2] dark:placeholder-gray-500 focus:outline-none focus:border-[#B4B2B2] dark:focus:border-gray-400 bg-transparent text-gray-900 dark:text-gray-100 py-2"
            rows={3}
            required
          />
        </div>

        <div className="mb-6">
          <h3 className="font-lato font-semibold text-[18px] mb-10 text-gray-900 dark:text-gray-100">
            CATEGORÍA
          </h3>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className="w-full border-b border-[#B4B2B2] dark:border-gray-600 text-[15px] focus:outline-none focus:border-[#B4B2B2] dark:focus:border-gray-400 bg-transparent text-gray-900 dark:text-gray-100 py-2"
            required
          >
            <option value="">Seleccione una categoría</option>
            <option value="ropa">Ropa</option>
            <option value="tecnologia">Tecnología</option>
            <option value="hogar">Hogar</option>
            <option value="deportes">Deportes</option>
          </select>
        </div>

        <div className="mb-6">
          <h3 className="font-lato font-semibold text-[18px] mb-10 text-gray-900 dark:text-gray-100">
            PRECIO
          </h3>
          <input
            name="precio"
            type="number"
            step="0.01"
            min="0"
            value={form.precio}
            onChange={handleChange}
            placeholder="Ingrese el precio"
            className="w-full border-b border-[#B4B2B2] dark:border-gray-600 text-[15px] placeholder-[#B4B2B2] dark:placeholder-gray-500 focus:outline-none focus:border-[#B4B2B2] dark:focus:border-gray-400 bg-transparent text-gray-900 dark:text-gray-100 py-2"
            required
          />
        </div>

        <div className="mb-6">
          <h3 className="font-lato font-semibold text-[18px] mb-10 text-gray-900 dark:text-gray-100">
            STOCK
          </h3>
          <input
            name="stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={handleChange}
            placeholder="Cantidad en stock"
            className="w-full border-b border-[#B4B2B2] dark:border-gray-600 text-[15px] placeholder-[#B4B2B2] dark:placeholder-gray-500 focus:outline-none focus:border-[#B4B2B2] dark:focus:border-gray-400 bg-transparent text-gray-900 dark:text-gray-100 py-2"
            required
          />
        </div>

        <div className="mb-6">
          <h3 className="font-lato font-semibold text-[18px] mb-10 text-gray-900 dark:text-gray-100">
            TAGS (separados por comas)
          </h3>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="ej: nuevo, oferta, destacado"
            className="w-full border-b border-[#B4B2B2] dark:border-gray-600 text-[15px] placeholder-[#B4B2B2] dark:placeholder-gray-500 focus:outline-none focus:border-[#B4B2B2] dark:focus:border-gray-400 bg-transparent text-gray-900 dark:text-gray-100 py-2"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="w-full bg-black dark:bg-gray-700 text-white py-3 mt-4 hover:bg-gray-800 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'CREANDO PRODUCTO...' : 'CREAR PRODUCTO'}
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;