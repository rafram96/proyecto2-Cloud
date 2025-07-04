import { request } from './request';

export const productService = {
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

  async crearProducto(productData: any) {
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
