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

      const response = await requestProducts<any>('/productos/upload-image', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('📸 Upload response:', response);
      console.log('📸 Upload response type:', typeof response);
      console.log('📸 Upload response keys:', Object.keys(response || {}));

      // Si la respuesta viene en formato Lambda (statusCode + body)
      if (response.statusCode === 200 && response.body) {
        const parsedData = typeof response.body === 'string' 
          ? JSON.parse(response.body) 
          : response.body;
        
        console.log('📸 Parsed data:', parsedData);
        
        if (parsedData.success && parsedData.data) {
          console.log('✅ Imagen subida exitosamente:', parsedData.data);
          return { success: true, data: parsedData.data };
        } else {
          console.log('❌ Error en upload:', parsedData);
          return { success: false, error: parsedData.error || 'Error al subir imagen' };
        }
      }

      // Si la respuesta ya viene parseada directamente
      if (response && response.success && response.data) {
        console.log('✅ Imagen subida exitosamente (directo):', response.data);
        return { success: true, data: response.data };
      }

      // Si hay error en la respuesta
      if (response && !response.success) {
        console.log('❌ Error en respuesta:', response.error);
        return { success: false, error: response.error || 'Error al subir imagen' };
      }

      console.log('🤷 Respuesta no reconocida:', response);
      return { success: false, error: 'Respuesta no válida del servidor' };
    } catch (error: any) {
      console.error('💥 Error en uploadImage:', error);
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        error: error.error,
        statusCode: error.statusCode
      });
      return { 
        success: false, 
        error: error.error || error.message || 'Error al subir imagen' 
      };
    }
  },

  async listarProductos(page = 1, limit = 12) {
    try {
      const response = await requestProducts<any>(
        '/productos/listar',
        {
          method: 'POST',
          body: JSON.stringify({ page, limit }),
        }
      );
      
      // Si la respuesta viene en formato Lambda (statusCode + body)
      if (response.statusCode === 200 && response.body) {
        const parsedData = typeof response.body === 'string' 
          ? JSON.parse(response.body) 
          : response.body;
        
        if (parsedData.success && parsedData.data) {
          return { success: true, data: parsedData.data };
        } else {
          return { success: false, error: parsedData.error || 'Error al listar productos' };
        }
      }
      
      // Si la respuesta ya viene parseada
      return { success: true, data: response };
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
      const response = await requestProducts<any>('/productos/search', {
        method: 'POST',
        body: JSON.stringify(searchParams),
      });
      
      // Si la respuesta viene en formato Lambda (statusCode + body)
      if (response.statusCode === 200 && response.body) {
        const parsedData = typeof response.body === 'string' 
          ? JSON.parse(response.body) 
          : response.body;
        
        if (parsedData.success && parsedData.data) {
          return { success: true, data: parsedData.data };
        } else {
          return { success: false, error: parsedData.error || 'Error en la búsqueda' };
        }
      }
      
      // Si la respuesta ya viene parseada
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.error || 'Error en la búsqueda' };
    }
  },

  async autocompleteProducts(query: string, limit = 5) {
    try {
      const response = await requestProducts<any>('/productos/autocomplete', {
        method: 'POST',
        body: JSON.stringify({ query, limit }),
      });
      
      // Si la respuesta viene en formato Lambda (statusCode + body)
      if (response.statusCode === 200 && response.body) {
        const parsedData = typeof response.body === 'string' 
          ? JSON.parse(response.body) 
          : response.body;
        
        if (parsedData.success && parsedData.data) {
          return { success: true, data: parsedData.data };
        } else {
          return { success: false, error: parsedData.error || 'Error en autocompletado' };
        }
      }
      
      // Si la respuesta ya viene parseada
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.error || 'Error en autocompletado' };
    }
  },
};
