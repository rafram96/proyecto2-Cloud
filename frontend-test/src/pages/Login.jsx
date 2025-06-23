import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userService } from '../services/api'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenant_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await userService.login(formData)
      console.log('Login exitoso:', response)
      navigate('/dashboard')
    } catch (err) {
      console.error('Error en login:', err)
      setError(err.error || err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2 className="form-title">Iniciar Sesión</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tenant_id">Tenant ID:</label>
          <input
            type="text"
            id="tenant_id"
            name="tenant_id"
            value={formData.tenant_id}
            onChange={handleChange}
            placeholder="ID de la empresa/tenant"
            required
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="form-footer">
        <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
      </div>
    </div>
  )
}

export default Login
