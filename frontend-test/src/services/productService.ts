import { request } from './request';

interface ProductData {
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
      const formData = new FormData();
      formData.append('image', file);
      formData.append('tenant_id', tenantId);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/productos/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Tenant-Id': tenantId,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir imagen');
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al subir imagen' };
    }
  },

  async listarProductos(page = 1, limit = 12) {
    try {
      const data = await request<{ productos: any[]; count: number; pagination: any }>(
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
      const data = await request<any>('/productos/crear', {
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
      const data = await request<any>('/productos/buscar', {
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

      const data = await request<{ productos: any[]; count: number; pagination: any }>(
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
      const data = await request<any>('/productos/actualizar', {
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
      const data = await request<any>('/productos/eliminar', {
        method: 'POST',
        body: JSON.stringify({ codigo }),
      });
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.error || 'Error al eliminar producto' };
    }
  },
};
