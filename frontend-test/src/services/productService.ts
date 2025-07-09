import { requestProducts } from './request';

interface ProductData {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
  imagen_url?: string;
  tags?: string[];
}

export const productService = {
  async uploadImage(file: File, tenantId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Convertir archivo a Base64 para evitar multipart/form-data
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        Array.from(new Uint8Array(arrayBuffer))
          .map(byte => String.fromCharCode(byte))
          .join('')
      );
      const mimeType = file.type || 'image/jpeg';
      const payload = { base64, mimeType }; // tenantId se obtiene desde requestProducts

      const data = await requestProducts<any>('/productos/upload-image', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return { success: true, data: data.data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al subir imagen' };
    }
  },

  async listarProductos(page = 1, limit = 12) {
    try {
      const data = await requestProducts<{ productos: any[]; count: number; pagination: any }>(
        '/productos/listar',
        {
          method: 'POST',
          body: JSON.stringify({ page, limit }),
        }
      );
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.error || 'Error al listar productos' };
    }
  },

  async crearProducto(productData: ProductData) {
    try {
      const data = await requestProducts<any>('/productos/crear', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.error || 'Error al crear producto' };
    }
  },

  async buscarProducto(codigo: string) {
    try {
      const data = await requestProducts<any>('/productos/buscar', {
        method: 'POST',
        body: JSON.stringify({ codigo }),
      });
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.error || 'Producto no encontrado' };
    }
  },

  async buscarProductos(searchQuery?: string, categoria?: string, page = 1, limit = 12) {
    try {
      const searchParams = {
        page,
        limit,
        ...(searchQuery && { search: searchQuery }),
        ...(categoria && { categoria })
      };

      const data = await requestProducts<{ productos: any[]; count: number; pagination: any }>(
        '/productos/listar',
        {
          method: 'POST',
          body: JSON.stringify(searchParams),
        }
      );
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.error || 'Error al buscar productos' };
    }
  },

  async actualizarProducto(codigo: string, updates: any) {
    try {
      const data = await requestProducts<any>('/productos/actualizar', {
        method: 'POST',
        body: JSON.stringify({ codigo, ...updates }),
      });
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.error || 'Error al actualizar producto' };
    }
  },

  async eliminarProducto(codigo: string) {
    try {
      const data = await requestProducts<any>('/productos/eliminar', {
        method: 'POST',
        body: JSON.stringify({ codigo }),
      });
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.error || 'Error al eliminar producto' };
    }
  },

  // Nuevas funciones para búsqueda con Elasticsearch
  async searchProducts(searchParams: {
    query?: string;
    filters?: {
      categoria?: string;
      precio_min?: number;
      precio_max?: number;
      tags?: string[];
    };
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const data = await requestProducts<any>('/productos/search', {
        method: 'POST',
        body: JSON.stringify(searchParams),
      });
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.error || 'Error en la búsqueda' };
    }
  },

  async autocompleteProducts(query: string, limit = 5) {
    try {
      const data = await requestProducts<any>('/productos/autocomplete', {
        method: 'POST',
        body: JSON.stringify({ query, limit }),
      });
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.error || 'Error en autocompletado' };
    }
  },
};
