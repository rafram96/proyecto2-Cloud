import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, CreditCard, MapPin, CheckCircle } from 'lucide-react';
import { comprasService, type Compra } from '../services/comprasService';

const ViewOrder: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Compra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('ID de orden no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await comprasService.obtenerCompra(orderId);
        
        if (response.success && response.data) {
          setOrder(response.data);
        } else {
          setError(response.error || 'No se pudo cargar la orden');
        }
      } catch (err) {
        setError('Error al cargar la orden');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (loading) {
    return (
      <div className="min-h-screen pt-[40px] bg-gray-50 dark:bg-gray-900 theme-transition">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-[40px] bg-gray-50 dark:bg-gray-900 theme-transition">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Error al cargar la orden
            </h2>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-[40px] bg-gray-50 dark:bg-gray-900 theme-transition">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Orden no encontrada
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[40px] bg-gray-50 dark:bg-gray-900 theme-transition">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a mis órdenes
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Order Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">Orden #{order.compra_id}</h1>
                <p className="text-blue-100">
                  Realizada el {formatDate(order.fecha_compra)}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.estado)}`}>
                  {order.estado}
                </span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Payment Info */}
              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Método de Pago
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.metodo_pago}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Dirección de Entrega
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.direccion_entrega}
                  </p>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Productos ({order.productos.length})
              </h3>
              <div className="space-y-4">
                {order.productos.map((producto, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {producto.nombre}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Precio unitario: {formatPrice(producto.precio_unitario)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Cantidad: {producto.cantidad}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatPrice(producto.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            {/* Status Timeline */}
            {order.estado === 'COMPLETADA' && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Orden completada exitosamente</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;