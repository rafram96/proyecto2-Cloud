import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autorización
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Servicios de usuario
export const userService = {
  // Registro de usuario
  register: async (userData) => {
    try {
      const response = await api.post('/usuarios/crear', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Login de usuario
  login: async (credentials) => {
    try {
      const response = await api.post('/usuarios/login', credentials)
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('userData', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Validar token
  validateToken: async () => {
    try {
      const response = await api.get('/usuarios/validar')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
  },

  // Obtener datos del usuario del localStorage
  getCurrentUser: () => {
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : null
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken')
  }
}

export default api
