import { requestCompras } from './request';

const API_URL = import.meta.env.VITE_COMPRAS_API_URL || 'TBD';

export interface Producto {
  codigo: string;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

export interface CompraData {
  productos: Array<{
    codigo: string;
    cantidad: number;
    nombre?: string; // Opcional - nombre del producto
    precio?: number | string; // Opcional - precio del producto
  }>;
  direccion_entrega: string;
  metodo_pago: string;
}

export interface Compra {
  compra_id: string;
  productos: Producto[];
  total: number;
  direccion_entrega: string;
  metodo_pago: string;
  estado: string;
  fecha_compra: string;
  created_at: string;
}

export interface ComprasResponse {
  success: boolean;
  data: {
    compras: Compra[];
    count: number;
    user_id: string;
    tenant_id: string;
    pagination?: {
      hasMore: boolean;
      nextKey?: string;
    };
  };
}

export interface CrearCompraResponse {
  success: boolean;
  data?: {
    compra_id: string;
    total: number;
    productos: Producto[];
    estado: string;
    created_at: string;
  };
  error?: string;
}

class ComprasService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token'); // Cambié de 'authToken' a 'token' para coincidir con authService
    const tenantId = localStorage.getItem('tenant_id') || 'test1';
    
    return {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Id': tenantId,
      'Content-Type': 'application/json'
    };
  }

  async crearCompra(compraData: CompraData): Promise<CrearCompraResponse> {
    try {
      console.log('Creando compra:', compraData);
      
      if (API_URL === 'TBD') {
        console.log('🔄 MOCK: API de compras no configurada, simulando flujo completo...');
        
        // Simular validación de datos
        console.log('📋 MOCK: Validando datos de compra...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simular creación en DynamoDB
        console.log('💾 MOCK: Guardando compra en DynamoDB...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simular trigger de DynamoDB Streams
        console.log('🌊 MOCK: DynamoDB Streams activado...');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Simular Lambda de ingesta
        console.log('⚡ MOCK: Lambda Actualizar Compras ejecutándose...');
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // Simular guardado en S3
        console.log('📁 MOCK: Guardando datos en S3 (CSV/JSON)...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Simular actualización de stock en productos
        console.log('📦 MOCK: Actualizando stock de productos...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        console.log('✅ MOCK: Ingesta en tiempo real completada exitosamente!');
        
        // Generar respuesta mock realista
        const compraId = `COMPRA-${Date.now()}`;
        const total = compraData.productos.reduce((sum, p) => {
          // Simular precios basados en el código del producto
          const precioMock = p.codigo.includes('PHONE') ? 1200 : 
                           p.codigo.includes('LAPTOP') ? 1500 : 
                           p.codigo.includes('TABLET') ? 800 : 
                           p.codigo.includes('LENOVO') ? 666 :
                           300;
          return sum + (p.cantidad * precioMock);
        }, 0);
        
        const nuevaCompra = {
          compra_id: compraId,
          productos: compraData.productos.map(p => {
            // Usar precio real si está disponible, sino usar mock
            const precioReal = p.precio ? (typeof p.precio === 'string' ? parseFloat(p.precio) : p.precio) : null;
            const precioFinal = precioReal || (
              p.codigo.includes('PHONE') ? 1200 : 
              p.codigo.includes('LAPTOP') ? 1500 : 
              p.codigo.includes('TABLET') ? 800 :
              p.codigo.includes('LENOVO') ? 666 :
              300
            );
            
            return {
              codigo: p.codigo,
              nombre: p.nombre || `Producto ${p.codigo}`, // Usar nombre real si está disponible
              precio_unitario: precioFinal,
              cantidad: p.cantidad,
              subtotal: p.cantidad * precioFinal
            };
          }),
          total: total,
          direccion_entrega: compraData.direccion_entrega,
          metodo_pago: compraData.metodo_pago,
          estado: 'COMPLETADA',
          fecha_compra: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        
        // Guardar la compra en localStorage para simular persistencia
        const comprasGuardadas = JSON.parse(localStorage.getItem('compras_mock') || '[]');
        comprasGuardadas.unshift(nuevaCompra); // Agregar al inicio
        localStorage.setItem('compras_mock', JSON.stringify(comprasGuardadas));
        
        console.log('💾 MOCK: Compra guardada en localStorage para persistencia local');
        
        return {
          success: true,
          data: {
            compra_id: compraId,
            total: total,
            productos: nuevaCompra.productos,
            estado: 'COMPLETADA',
            created_at: new Date().toISOString()
          }
        };
      }

      const response = await requestCompras(`/compras`, {
        method: 'POST',
        body: JSON.stringify(compraData)
      }) as any;

      console.log('Respuesta crear compra:', response);

      if (response.success) {
        return response as CrearCompraResponse;
      } else {
        throw new Error(response.error || 'Error al crear la compra');
      }
    } catch (error) {
      console.error('Error en crearCompra:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al crear la compra'
      };
    }
  }

  async listarCompras(limit = 20, lastKey?: string): Promise<ComprasResponse> {
    try {
      console.log('Listando compras, limit:', limit, 'lastKey:', lastKey);

      if (API_URL === 'TBD') {
        console.warn('API de compras no configurada, usando datos mock');
        
        // Simular tiempo de carga
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Obtener compras guardadas localmente o generar mock
        const comprasGuardadas = JSON.parse(localStorage.getItem('compras_mock') || '[]');
        
        if (comprasGuardadas.length === 0) {
          // Generar algunas compras de ejemplo si no hay ninguna
          const comprasMock = [
            {
              compra_id: 'COMPRA-1704000000001',
              productos: [
                {
                  codigo: 'PHONE001',
                  nombre: 'iPhone 15 Pro Max',
                  precio_unitario: 1299,
                  cantidad: 1,
                  subtotal: 1299
                }
              ],
              total: 1299,
              direccion_entrega: 'Av. Arequipa 1234, Lima',
              metodo_pago: 'TARJETA',
              estado: 'COMPLETADA',
              fecha_compra: new Date(Date.now() - 86400000 * 2).toISOString(),
              created_at: new Date(Date.now() - 86400000 * 2).toISOString()
            },
            {
              compra_id: 'COMPRA-1704000000002',
              productos: [
                {
                  codigo: 'LAPTOP002',
                  nombre: 'MacBook Air M2',
                  precio_unitario: 1199,
                  cantidad: 1,
                  subtotal: 1199
                },
                {
                  codigo: 'MOUSE003',
                  nombre: 'Magic Mouse',
                  precio_unitario: 99,
                  cantidad: 1,
                  subtotal: 99
                }
              ],
              total: 1298,
              direccion_entrega: 'Jr. Huancavelica 567, Lima',
              metodo_pago: 'PAYPAL',
              estado: 'EN_PROGRESO',
              fecha_compra: new Date(Date.now() - 86400000).toISOString(),
              created_at: new Date(Date.now() - 86400000).toISOString()
            }
          ];
          localStorage.setItem('compras_mock', JSON.stringify(comprasMock));
        }
        
        const todasLasCompras = JSON.parse(localStorage.getItem('compras_mock') || '[]');
        
        return {
          success: true,
          data: {
            compras: todasLasCompras.slice(0, limit),
            count: todasLasCompras.length,
            user_id: 'mock-user',
            tenant_id: 'test1',
            pagination: {
              hasMore: todasLasCompras.length > limit
            }
          }
        };
      }

      const queryParams = new URLSearchParams({
        limit: limit.toString()
      });

      if (lastKey) {
        queryParams.append('lastKey', lastKey);
      }

      let path = `/compras?${queryParams.toString()}`;

      const response = await requestCompras(path, {
        method: 'GET',
        headers: this.getAuthHeaders()
      }) as any;

      console.log('Respuesta listar compras:', response);

      if (response.success) {
        return response as ComprasResponse;
      } else {
        throw new Error(response.error || 'Error al listar las compras');
      }
    } catch (error) {
      console.error('Error en listarCompras:', error);
      return {
        success: false,
        data: {
          compras: [],
          count: 0,
          user_id: '',
          tenant_id: '',
          pagination: { hasMore: false }
        }
      };
    }
  }

  async obtenerCompra(compraId: string): Promise<{ success: boolean; data?: Compra; error?: string }> {
    try {
      console.log('Obteniendo compra:', compraId);

      if (API_URL === 'TBD') {
        console.warn('API de compras no configurada, usando datos mock');
        
        // Simular tiempo de carga
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Buscar en las compras guardadas localmente
        const comprasGuardadas = JSON.parse(localStorage.getItem('compras_mock') || '[]');
        const compra = comprasGuardadas.find((c: Compra) => c.compra_id === compraId);
        
        if (compra) {
          return {
            success: true,
            data: compra
          };
        }
        
        // Si no se encuentra, generar una compra de ejemplo
        return {
          success: true,
          data: {
            compra_id: compraId,
            productos: [
              {
                codigo: 'PROD001',
                nombre: 'Producto de ejemplo',
                precio_unitario: 299,
                cantidad: 1,
                subtotal: 299
              }
            ],
            total: 299,
            direccion_entrega: 'Dirección de ejemplo',
            metodo_pago: 'TARJETA',
            estado: 'COMPLETADA',
            fecha_compra: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        };
      }

      const response = await requestCompras(`/compras/${compraId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      }) as any;

      console.log('Respuesta obtener compra:', response);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        throw new Error(response.error || 'Error al obtener la compra');
      }
    } catch (error) {
      console.error('Error en obtenerCompra:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener la compra'
      };
    }
  }
}

export const comprasService = new ComprasService();
