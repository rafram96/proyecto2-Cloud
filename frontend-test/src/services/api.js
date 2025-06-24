import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  timeout: 10000
})

// Interceptor para agregar token de autorización
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    if (error.response?.status === 401) {
      // Token expirado o inválido
      userService.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Servicios de usuario
export const userService = {
  // Registro de usuario
  register: async (userData) => {
    try {
      console.log('Enviando registro:', userData)
      const response = await api.post('/auth/registro', userData)
      console.log('Respuesta registro:', response.data)
      return response.data
    } catch (error) {
      console.error('Error en registro:', error)
      if (error.code === 'ERR_NETWORK') {
        throw { error: 'Error de conexión. Verifica que la API esté funcionando.' }
      }
      throw error.response?.data || { error: error.message || 'Error desconocido' }
    }
  },

  // Login de usuario
  login: async (credentials) => {
    try {
      console.log('Enviando login:', credentials)
      const response = await api.post('/auth/login', credentials)
      console.log('Respuesta login:', response.data)
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('userData', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (error) {
      console.error('Error en login:', error)
      if (error.code === 'ERR_NETWORK') {
        throw { error: 'Error de conexión. Verifica que la API esté funcionando.' }
      }
      throw error.response?.data || { error: error.message || 'Error desconocido' }
    }
  },

  // Validar token
  validateToken: async () => {
    try {
      const response = await api.get('/auth/validar')
      return response.data
    } catch (error) {
      console.error('Error validando token:', error)
      if (error.code === 'ERR_NETWORK') {
        throw { error: 'Error de conexión. Verifica que la API esté funcionando.' }
      }
      throw error.response?.data || { error: error.message || 'Error desconocido' }
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
