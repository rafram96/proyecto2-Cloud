import { requestCompras } from './request';

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
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenant_id');
    if (!token || !tenantId) {
      throw new Error("Falta token o tenant_id en localStorage. Por favor, inicia sesión correctamente.");
    }
    return {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Id': tenantId,
      'Content-Type': 'application/json'
    };
  }

  async crearCompra(compraData: CompraData): Promise<CrearCompraResponse> {
    try {
      const token = localStorage.getItem('token');
      const tenant_id = localStorage.getItem('tenant_id');
      console.log('🛒 [comprasService] tenant_id:', tenant_id);
      console.log('🛒 [comprasService] productos:', compraData.productos);
      console.log('🛒 [comprasService] compraData:', compraData);
      const headers = this.getAuthHeaders();
      console.log('📡 [comprasService] Headers enviados:', headers);

      const response = await requestCompras(`/compras`, {
        method: 'POST',
        headers,
        body: JSON.stringify(compraData)
      }) as any;

      console.log('✅ [comprasService] Respuesta crear compra:', response);
      console.log('🧾 Codigos enviados:', compraData.productos.map(p => p.codigo));

      if (response.success) {
        return response as CrearCompraResponse;
      } else {
        console.error('❌ [comprasService] Error en respuesta exitosa:', response);
        throw new Error(response.error || 'Error al crear la compra');
      }
    } catch (error) {
      console.error('💥 [comprasService] Error en crearCompra:', error);

      // Log más detallado del error
      if (error instanceof Response) {
        console.error('🌐 [comprasService] Response status:', error.status);
        console.error('🌐 [comprasService] Response statusText:', error.statusText);
        try {
          const errorText = await error.text();
          console.error('📄 [comprasService] Response body:', errorText);
        } catch (textError) {
          console.error('📄 [comprasService] No se pudo leer response body:', textError);
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al crear la compra'
      };
    }
  }

  async listarCompras(limit = 20, lastKey?: string): Promise<ComprasResponse> {
    try {
      console.log('Listando compras, limit:', limit, 'lastKey:', lastKey);

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
