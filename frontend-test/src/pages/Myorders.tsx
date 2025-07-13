import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, Eye, AlertCircle } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import { comprasService, type Compra } from '../services/comprasService';

const Myorders: React.FC = () => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [nextKey, setNextKey] = useState<string | undefined>();

  useEffect(() => {
    loadCompras();
  }, []);

  const loadCompras = async (lastKey?: string) => {
    try {
      setLoading(true);
      const response = await comprasService.listarCompras(20, lastKey);
      
      if (response.success) {
        const nuevas = response.data.compras;
        if (lastKey) {
          setCompras(prev => [...prev, ...nuevas]);
        } else {
          setCompras(nuevas);
        }
        
        setHasMore(response.data.pagination?.hasMore || false);
        setNextKey(response.data.pagination?.nextKey);
      } else {
        setError('Error al cargar las compras');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Error al cargar las compras');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && nextKey && !loading) {
      loadCompras(nextKey);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completada':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'en_progreso':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'cancelada':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  // Filtrar y ordenar compras por término de búsqueda y fecha
  const filteredCompras = compras
    .filter(compra => 
      !filter || 
      compra.compra_id.toLowerCase().includes(filter.toLowerCase()) ||
      compra.estado.toLowerCase().includes(filter.toLowerCase()) ||
      compra.productos.some(p => p.nombre.toLowerCase().includes(filter.toLowerCase()))
    )
    .sort((a, b) => {
      // Ordenar por fecha de creación (más recientes primero)
      const dateA = new Date(a.fecha_compra).getTime();
      const dateB = new Date(b.fecha_compra).getTime();
      return dateB - dateA;
    });

  if (loading && compras.length === 0) {
    return (
      <div className="min-h-screen pt-[40px] bg-gray-50 dark:bg-gray-900 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-koulen text-gray-900 dark:text-gray-100 text-[40px] mb-12 drop-shadow-sm">MIS ÓRDENES</h1>
          
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between">
                  <div className="w-1/4 space-y-3">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                  <div className="w-3/4 grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-[40px] bg-gray-50 dark:bg-gray-900 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-koulen text-gray-900 dark:text-gray-100 text-[40px] mb-12 drop-shadow-sm">MIS ÓRDENES</h1>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Error al cargar las órdenes
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => loadCompras()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[40px] font-lato bg-gray-50 dark:bg-gray-900 theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-koulen text-gray-900 dark:text-gray-100 text-[40px] mb-12 drop-shadow-sm">MIS ÓRDENES</h1>

        {/* Barra de filtrado */}
        <div className="mb-6">
          <SearchBar 
            placeholder="Filtrar órdenes por ID, estado o producto..." 
            onSearch={setFilter} 
          />
          
          {/* Indicador de ordenamiento */}
          <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Ordenadas por fecha (más recientes primero)</span>
          </div>
        </div>

        {filteredCompras.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {filter ? 'No se encontraron órdenes' : 'No tienes órdenes'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter ? 'Intenta con un filtro diferente' : 'Cuando realices compras aparecerán aquí'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {filteredCompras.map((compra) => (
              <div
                key={compra.compra_id}
                className="flex justify-between gap-10 border-b border-gray-300 dark:border-gray-600 pb-10 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg dark:shadow-2xl theme-transition hover:shadow-xl dark:hover:shadow-3xl transition-shadow"
              >
                {/* Columna izquierda: información de la orden */}
                <div className="w-1/4 flex flex-col gap-4 self-start">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Orden</p>
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                      #{compra.compra_id.slice(-8)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estado</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(compra.estado)}`}>
                      {compra.estado}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total</p>
                    <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      {formatPrice(compra.total)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Fecha</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(compra.fecha_compra)}
                    </p>
                  </div>
                  
                  <Link
                    to={`/view-order/${compra.compra_id}`}
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 font-medium text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver Orden
                  </Link>
                </div>
                
                {/* Columna derecha: productos */}
                <div className="w-3/4">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {compra.productos.length} {compra.productos.length === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {compra.productos.slice(0, 3).map((producto, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="w-full h-24 bg-gray-200 dark:bg-gray-600 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                          <img
                            src={producto.imagen_url || '/placeholder.png'}
                            alt={producto.nombre}
                            className="w-full h-full object-contain transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src !== window.location.origin + '/placeholder.png') {
                                target.onerror = null;
                                target.src = '/placeholder.png';
                              }
                            }}
                          />
                        </div>
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                          {producto.nombre}
                        </h4>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Cant: {producto.cantidad}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatPrice(producto.subtotal)}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {compra.productos.length > 3 && (
                      <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-4 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          +{compra.productos.length - 3} más
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Botón cargar más */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Cargando...' : 'Cargar más órdenes'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Myorders;

