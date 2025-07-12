import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../hooks/useCart';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart: addProductToCart, isInCart, getItemCount } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productData, setProductData] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadProduct = async () => {
      console.log('Iniciando carga del producto con ID:', id);
      
      if (!id) {
        setError('ID de producto no válido');
        setLoading(false);
        return;
      }

      try {
        console.log('Llamando a productService.buscarProducto...');
        const response = await productService.buscarProducto(id);
        console.log('Respuesta recibida:', response);
        
        if (response.success && response.data) {
          console.log('Producto encontrado:', response.data);
          
          // Verificar si response.data es un string que necesita ser parseado
          let productInfo;
          if (typeof response.data === 'string') {
            const parsed = JSON.parse(response.data);
            productInfo = parsed.data;
          } else if (response.data.body && typeof response.data.body === 'string') {
            // Si viene en formato {statusCode, headers, body}
            const parsed = JSON.parse(response.data.body);
            productInfo = parsed.data;
          } else {
            productInfo = response.data;
          }
          
          console.log('Datos del producto procesados:', productInfo);
          setProductData(productInfo);

          // Cargar productos relacionados de la misma categoría
          if (productInfo.categoria) {
            console.log('🔍 Buscando productos relacionados de:', productInfo.categoria);
            const relatedResponse = await productService.buscarProductos('', productInfo.categoria, 1, 4);
            
            if (relatedResponse.success && relatedResponse.data) {
              const relatedData = relatedResponse.data;
              
              // Filtrar el producto actual y limitar a 3
              const filteredRelated = relatedData.productos?.filter((p: any) => p.codigo !== id).slice(0, 3) || [];
              console.log('📦 Productos relacionados encontrados:', filteredRelated);
              setRelatedProducts(filteredRelated);
            }
          }
        } else {
          console.log('Producto no encontrado o error en respuesta');
          setError('Producto no encontrado');
        }
      } catch (err) {
        console.error('Error en la carga:', err);
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const changeQuantity = (change: number) => {
    const newQty = quantity + change;
    if (newQty >= 1 && newQty <= productData.stock) {
      setQuantity(newQty);
    }
  };

  const addToCart = () => {
    if (productData && quantity > 0) {
      console.log('🛒 Agregando al carrito:', { productData, quantity });
      
      // Convertir productData al formato Product completo
      const productForCart = {
        tenant_id: 'TADASHI', // Usar el tenant actual
        codigo: productData.codigo,
        nombre: productData.nombre,
        descripcion: productData.descripcion || '',
        precio: productData.precio,
        categoria: productData.categoria,
        stock: productData.stock || 10,
        imagen_url: productData.imagen_url || '',
        tags: productData.tags || [],
        activo: productData.activo !== undefined ? productData.activo : true,
        created_at: productData.created_at || new Date().toISOString(),
        updated_at: productData.updated_at || new Date().toISOString(),
        created_by: productData.created_by || 'user',
        updated_by: productData.updated_by || 'user'
      };
      
      console.log('🛒 Producto preparado para carrito:', productForCart);
      
      try {
        addProductToCart(productForCart, quantity);
        
        // Mostrar confirmación
        const cartItems = getItemCount() + quantity;
        alert(`✅ Agregado: ${quantity} x ${productData.nombre}\n🛒 Total en carrito: ${cartItems} productos`);
        console.log('✅ Producto agregado exitosamente al carrito');
      } catch (error) {
        console.error('❌ Error al agregar al carrito:', error);
        alert('❌ Error al agregar el producto al carrito');
      }
    } else {
      console.log('❌ No se puede agregar: productData o quantity inválidos');
    }
  };

  console.log('Estado actual:', { loading, error, productData });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans theme-transition">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <div className="text-5xl mb-4">🔄</div>
          <h1 className="text-2xl font-bold mb-2">Cargando producto...</h1>
          <p className="text-gray-600 dark:text-gray-400">ID: {id}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans theme-transition">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
            Error: {error}
          </h1>
          <button 
            onClick={() => navigate('/search')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            🔍 Volver a búsqueda
          </button>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans theme-transition">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <div className="text-5xl mb-4">❓</div>
          <h1 className="text-2xl font-bold mb-4">No se encontró el producto</h1>
          <button 
            onClick={() => navigate('/search')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            🔍 Volver a búsqueda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans theme-transition">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-5 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer text-sm font-medium transition-colors duration-200"
        >
          ← Volver
        </button>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 bg-white dark:bg-gray-800 rounded-xl p-6 lg:p-10 shadow-lg">
          
          {/* Columna izquierda - Imagen */}
          <div className="flex justify-center">
            {productData.imagen_url ? (
              <img 
                src={productData.imagen_url} 
                alt={productData.nombre}
                className="w-full max-w-md h-auto border border-gray-200 dark:border-gray-600 rounded-xl shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full max-w-md h-80 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 text-6xl">
                📷
              </div>
            )}
          </div>

          {/* Columna derecha - Info del producto */}
          <div className="space-y-6">
            
            {/* Título */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {productData.nombre}
            </h1>
            
            {/* Precio */}
            <div className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400">
              S/. {productData.precio?.toLocaleString()}
            </div>
            
            {/* Categoría */}
            <div>
              <span className="inline-block bg-yellow-400 dark:bg-yellow-500 text-gray-900 dark:text-gray-800 px-4 py-2 rounded-full text-sm font-semibold">
                📂 {productData.categoria}
              </span>
            </div>
            
            {/* Stock */}
            <div className={`p-3 rounded-lg font-semibold ${
              productData.stock > 0 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
              {productData.stock > 0 ? 
                `✅ En stock: ${productData.stock} unidades` : 
                '❌ Agotado'
              }
            </div>
            
            {/* Descripción */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Descripción:</p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {productData.descripcion}
              </p>
            </div>

            {/* Selector de cantidad */}
            {productData.stock > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Cantidad:</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => changeQuantity(-1)}
                    disabled={quantity <= 1}
                    className={`w-10 h-10 rounded-lg font-bold text-lg transition-colors ${
                      quantity <= 1 
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                        : 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                    }`}
                  >
                    -
                  </button>
                  
                  <span className="text-2xl font-bold min-w-[40px] text-center text-gray-900 dark:text-gray-100">
                    {quantity}
                  </span>
                  
                  <button
                    onClick={() => changeQuantity(1)}
                    disabled={quantity >= productData.stock}
                    className={`w-10 h-10 rounded-lg font-bold text-lg transition-colors ${
                      quantity >= productData.stock 
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                        : 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                    }`}
                  >
                    +
                  </button>
                  
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    (Máx: {productData.stock})
                  </span>
                </div>
              </div>
            )}

            {/* Botón agregar al carrito */}
            {productData.stock > 0 && (
              <button
                onClick={addToCart}
                className="w-full py-4 px-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🛒 Agregar al carrito - S/. {(productData.precio * quantity).toLocaleString()}
              </button>
            )}

            {/* Info adicional */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">ℹ️ Información adicional:</p>
              <div className="space-y-1 text-blue-800 dark:text-blue-200">
                <p>• Código: {productData.codigo}</p>
                <p>• Estado: {productData.activo ? '✅ Activo' : '❌ Inactivo'}</p>
                {productData.tags && productData.tags.length > 0 && (
                  <p>• Etiquetas: {productData.tags.join(', ')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl p-6 lg:p-10 shadow-lg">
            <h2 className="text-2xl lg:text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
              🔍 Productos relacionados
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((product: any) => (
                <div
                  key={product.codigo}
                  onClick={() => navigate(`/product/${product.codigo}`)}
                  className="border border-gray-200 dark:border-gray-600 rounded-xl p-5 cursor-pointer transition-all duration-300 bg-white dark:bg-gray-700 hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Imagen del producto relacionado */}
                  <div className="w-full h-44 bg-gray-100 dark:bg-gray-600 rounded-lg mb-4 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    {product.imagen_url ? (
                      <img 
                        src={product.imagen_url}
                        alt={product.nombre}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            target.parentElement.innerHTML = '<span class="text-4xl">📷</span>';
                          }
                        }}
                      />
                    ) : (
                      <span className="text-4xl">📷</span>
                    )}
                  </div>
                  
                  {/* Info del producto relacionado */}
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                    {product.nombre}
                  </h3>
                  
                  <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                    S/. {product.precio?.toLocaleString()}
                  </div>
                  
                  <div className={`text-sm font-semibold ${
                    product.stock > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {product.stock > 0 ? `✅ Stock: ${product.stock}` : '❌ Agotado'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
