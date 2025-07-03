import api from './api'

export const productService = {
  list: async ({ limit = 10, lastKey, categoria, busqueda }) => {
    const payload = { limit, lastKey, categoria, busqueda }
    const response = await api.post('/productos/listar', payload)
    return response
  },
  create: async (data) => {
    const response = await api.post('/productos/crear', data)
    return response
  },
  get: async ({ codigo }) => {
    const payload = { codigo }
    const response = await api.post('/productos/buscar', payload)
    return response
  },
  update: async (data) => {
    const response = await api.post('/productos/actualizar', data)
    return response
  },
  remove: async ({ codigo }) => {
    const payload = { codigo }
    const response = await api.post('/productos/eliminar', payload)
    return response
  }
}
