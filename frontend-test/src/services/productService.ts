import api from './api';

export const productService = {
  async listarProductos(page = 1, limit = 12) {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/productos/listar',
        { page, limit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Error al listar productos' };
    }
  },

  async crearProducto(productData: any) {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/productos/crear', productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Error al crear producto' };
    }
  },

  async buscarProducto(codigo: string) {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/productos/buscar',
        { codigo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Producto no encontrado' };
    }
  },

  async actualizarProducto(codigo: string, updates: any) {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/productos/actualizar',
        { codigo, ...updates },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Error al actualizar producto' };
    }
  },

  async eliminarProducto(codigo: string) {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/productos/eliminar',
        { codigo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Error al eliminar producto' };
    }
  },
};
