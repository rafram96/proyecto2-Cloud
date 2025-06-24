import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
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

// Interceptor para manejar respuestas y desenvolver el body de API Gateway
api.interceptors.response.use(
  (response) => {
    let resData = response.data
    // Si es un envelope con .body string, parsearlo
    if (resData && typeof resData.body === 'string') {
      try {
        resData = JSON.parse(resData.body)
      } catch (e) {
        console.warn('No se pudo parsear response.body:', e)
      }
    }
    response.data = resData
    return response
  },
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
export const userService = {  // Registro de usuario
  register: async (userData) => {
    try {
      console.log('Enviando registro:', userData)
      const response = await api.post('/auth/registro', userData)
      console.log('Respuesta registro completa:', response)
      console.log('Status code:', response.status)
      console.log('Response data:', response.data)
      console.log('Response headers:', response.headers)
      
      // Verificar si la respuesta contiene errores del backend
      if (response.data.errorMessage || response.data.errorType) {
        console.log('Error detectado en respuesta:', response.data)
        throw { error: response.data.errorMessage || 'Error en el servidor' }
      }        // Por ahora, aceptar cualquier respuesta exitosa del servidor
      console.log('Registro exitoso - respuesta:', response.data)
      return response.data
    } catch (error) {
      console.error('Error en registro:', error)
      console.error('Error completo:', JSON.stringify(error, null, 2))
      if (error.code === 'ERR_NETWORK') {
        throw { error: 'Error de conexión. Verifica que la API esté funcionando.' }
      }
      // Si ya es un error personalizado, lo pasamos tal como está
      if (error.error) {
        throw error
      }
      throw error.response?.data || { error: error.message || 'Error desconocido' }
    }
  },  // Login de usuario
  login: async (credentials) => {
    try {
      console.log('Enviando login:', credentials)
      const response = await api.post('/auth/login', credentials)
      console.log('Respuesta login completa:', response)
      console.log('Status code:', response.status)
      console.log('Response data:', response.data)
      
      // Verificar si la respuesta contiene errores del backend
      if (response.data.errorMessage || response.data.errorType) {
        console.log('Error detectado en respuesta:', response.data)
        throw { error: response.data.errorMessage || 'Error en el servidor' }
      }
        // Verificar que la respuesta tenga los datos esperados (temporalmente relajado)
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        if (response.data.user) {
          localStorage.setItem('userData', JSON.stringify(response.data.user))
        }
      }
      
      console.log('Login procesado - respuesta:', response.data)
      return response.data
    } catch (error) {
      console.error('Error en login:', error)
      console.error('Error completo:', JSON.stringify(error, null, 2))
      if (error.code === 'ERR_NETWORK') {
        throw { error: 'Error de conexión. Verifica que la API esté funcionando.' }
      }
      // Si ya es un error personalizado, lo pasamos tal como está
      if (error.error) {
        throw error
      }
      throw error.response?.data || { error: error.message || 'Error desconocido' }
    }
  },
  // Validar token
  validateToken: async () => {
    try {
      const response = await api.get('/auth/validar')
      
      // Verificar si la respuesta contiene errores del backend
      if (response.data.errorMessage || response.data.errorType) {
        throw { error: response.data.errorMessage || 'Token inválido' }
      }
      
      return response.data
    } catch (error) {
      console.error('Error validando token:', error)
      if (error.code === 'ERR_NETWORK') {
        throw { error: 'Error de conexión. Verifica que la API esté funcionando.' }
      }
      // Si ya es un error personalizado, lo pasamos tal como está
      if (error.error) {
        throw error
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
