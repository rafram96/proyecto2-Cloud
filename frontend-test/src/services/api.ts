import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// No necesitamos interceptor - la API devuelve JSON directo

export const userService = {
  async register(userData: { tenant_id: string; email: string; password: string; nombre: string }) {
    try {
      const response = await api.post('/auth/registro', userData);
      console.log('✅ Registro exitoso:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('❌ Error en registro:', error.response?.data);
      return { success: false, error: error.response?.data?.error || 'Error en registro' };
    }
  },

  async login(credentials: { tenant_id: string; email: string; password: string }) {
    try {
      console.log('🔍 Enviando credenciales:', credentials);
      const response = await api.post('/auth/login', credentials);
      console.log('✅ Login exitoso:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('❌ Error en login:', error.response?.data);
      return { success: false, error: error.response?.data?.error || 'Error en login' };
    }
  },

  async validateToken() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, error: 'No token found' };

      const response = await api.get('/auth/validar', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('✅ Token válido:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('❌ Error validando token:', error.response?.data);
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
  },
};

export default api;
