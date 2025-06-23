import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userService } from '../services/api'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    tenant_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    setSuccess('')

    try {
      const response = await userService.register(formData)
      console.log('Registro exitoso:', response)
      setSuccess('Usuario registrado exitosamente. Puedes iniciar sesión.')
      
      // Limpiar formulario
      setFormData({
        email: '',
        password: '',
        nombre: '',
        tenant_id: ''
      })

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      
    } catch (err) {
      console.error('Error en registro:', err)
      setError(err.error || err.message || 'Error al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2 className="form-title">Registro de Usuario</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre completo:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

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
            minLength="8"
            required
          />
          <small style={{ color: '#666', fontSize: '0.8rem' }}>
            Mínimo 8 caracteres
          </small>
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
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <div className="form-footer">
        <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
      </div>
    </div>
  )
}

export default Register
