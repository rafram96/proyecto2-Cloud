import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService } from '../services/api'

const AuthStatus = () => {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState(null)
  const [tokenValid, setTokenValid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      
      // Verificar si hay token y datos de usuario
      const isAuth = userService.isAuthenticated()
      const userData = userService.getCurrentUser()
      
      if (!isAuth || !userData) {
        setError('No hay datos de autenticación')
        setLoading(false)
        return
      }

      setUserInfo(userData)

      // Validar token con el servidor
      try {
        await userService.validateToken()
        setTokenValid(true)
      } catch (validationError) {
        console.error('Token inválido:', validationError)
        setTokenValid(false)
      }
    } catch (err) {
      console.error('Error verificando estado:', err)
      setError('Error al verificar el estado de autenticación')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    userService.logout()
    navigate('/login')
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando estado de autenticación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
              Estado de Autenticación
            </h2>

            {error ? (
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error de Autenticación
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Ir a Login
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Estado de Autenticación */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        ✅ Autenticación Exitosa
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Has completado el registro y login correctamente</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del Usuario */}
                {userInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-3">
                      Información del Usuario
                    </h3>
                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span>{userInfo.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Nombre:</span>
                        <span>{userInfo.nombre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Tenant ID:</span>
                        <span className="font-mono text-xs">{userInfo.tenantId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">User ID:</span>
                        <span className="font-mono text-xs">{userInfo.userId}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Estado del Token */}
                <div className={`border rounded-lg p-4 ${tokenValid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {tokenValid ? (
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${tokenValid ? 'text-green-800' : 'text-yellow-800'}`}>
                        Token de Sesión: {tokenValid ? 'Válido' : 'Inválido/Expirado'}
                      </h3>
                      <div className={`mt-2 text-sm ${tokenValid ? 'text-green-700' : 'text-yellow-700'}`}>
                        <p>
                          {tokenValid 
                            ? 'Tu sesión está activa y puedes acceder a todas las funciones'
                            : 'Tu token puede haber expirado, pero la autenticación inicial fue exitosa'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="space-y-3">
                  <button
                    onClick={handleGoToDashboard}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Ir al Dashboard
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthStatus
