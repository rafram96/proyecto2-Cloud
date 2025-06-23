import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../services/api'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [tokenValid, setTokenValid] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si está autenticado
    if (!userService.isAuthenticated()) {
      navigate('/login')
      return
    }

    // Obtener datos del usuario
    const userData = userService.getCurrentUser()
    setUser(userData)

    // Validar token con el servidor
    validateToken()
  }, [navigate])

  const validateToken = async () => {
    try {
      const response = await userService.validateToken()
      setTokenValid(true)
      console.log('Token válido:', response)
    } catch (error) {
      console.error('Token inválido:', error)
      setTokenValid(false)
      userService.logout()
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      {user && (
        <div className="welcome-message">
          <h3>¡Bienvenido, {user.nombre}!</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Usuario ID:</strong> {user.usuario_id}</p>
          <p><strong>Tenant ID:</strong> {user.tenant_id}</p>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3>Estado del Token</h3>
        {tokenValid === true && (
          <div className="success-message">
            ✅ Token válido - Sesión activa
          </div>
        )}
        {tokenValid === false && (
          <div className="error-message">
            ❌ Token inválido - Será redirigido al login
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Acciones Disponibles</h3>
        <p>Aquí podrás probar las funcionalidades de la API:</p>
        <ul>
          <li>✅ Registro de usuarios</li>
          <li>✅ Login de usuarios</li>
          <li>✅ Validación de tokens</li>
          <li>🚧 Crear usuarios admin (próximamente)</li>
          <li>🚧 Gestión de tenants (próximamente)</li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
