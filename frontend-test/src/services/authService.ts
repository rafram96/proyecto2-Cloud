import api from './api';

/**
 * Servicio de autenticación: register, login, validateToken y logout.
 */
export const authService = {
  async register(userData: { tenant_id: string; email: string; password: string; nombre: string }) {
    try {
      const response = await api.post('/auth/registro', userData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Error en registro' };
    }
  },

  async login(credentials: { tenant_id: string; email: string; password: string }) {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Error en login' };
    }
  },

  async validateToken() {
    try {
      const response = await api.get('/auth/validar', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      if (error.response?.status === 401) {
        return { success: false };
      }
      return { success: false, error: error.response?.data?.error || 'Token inválido' };
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  }
};
