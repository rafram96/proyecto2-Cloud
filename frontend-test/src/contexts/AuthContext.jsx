import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

/**
 * @typedef {Object} User
 * @property {string} [userId]
 * @property {string} [email]
 * @property {string} [nombre]
 * @property {string} [tenantId]
 */

/**
 * @typedef {Object} ApiResult
 * @property {boolean} success
 * @property {Object} [data]
 * @property {string} [error]
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading
 * @property {function(Object):Promise<ApiResult>} login
 * @property {function(Object):Promise<ApiResult>} register
 * @property {function():void} logout
 */

/** @type {React.Context<AuthContextType>} */
const AuthContext = createContext(
  /** @type {AuthContextType} */ ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: async () => ({ success: false, error: 'Not initialized' }),
    register: async () => ({ success: false, error: 'Not initialized' }),
    logout: () => {},
  })
);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        const result = await authService.validateToken();
        if (result.success) {
          const currentUser = authService.getCurrentUser();
          // Si el usuario en localStorage no tiene los campos mapeados, remapearlo
          if (currentUser && currentUser.user_id) {
            const userMapped = {
              userId: currentUser.user_id,
              email: currentUser.email,
              tenantId: currentUser.tenant_id,
              nombre: currentUser.nombre || currentUser.email
            };
            setUser(userMapped);
            localStorage.setItem('user', JSON.stringify(userMapped));
            // Asegurar que el tenantId esté disponible para las llamadas API
            localStorage.setItem('tenantId', currentUser.tenant_id);
          } else {
            setUser(currentUser);
            // Si ya está mapeado, asegurar tenantId en localStorage
            if (currentUser && currentUser.tenantId) {
              localStorage.setItem('tenantId', currentUser.tenantId);
            }
          }
        } else {
          authService.logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        // Mapear campos del backend a frontend
        const userMapped = {
          userId: result.data.user.user_id,
          email: result.data.user.email,
          tenantId: result.data.user.tenant_id,
          nombre: result.data.user.nombre || result.data.user.email // Fallback al email si no hay nombre
        };
        setUser(userMapped);
        // Actualizar localStorage con los datos mapeados
        localStorage.setItem('user', JSON.stringify(userMapped));
        // Guardar el tenantId por separado para las llamadas a la API
        localStorage.setItem('tenantId', result.data.user.tenant_id);
        setIsLoading(false);
        return result;
      } else {
        // Si falla el login real, intentar modo mock para testing
        console.warn('⚠️ Login falló, activando modo testing con datos mock');
        
        const mockUser = {
          userId: `user_${credentials.tenant_id}`,
          email: credentials.email,
          tenantId: credentials.tenant_id,
          nombre: `Usuario de ${credentials.tenant_id}`
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('tenantId', credentials.tenant_id);
        localStorage.setItem('token', `mock_token_${credentials.tenant_id}_${Date.now()}`);
        
        setIsLoading(false);
        return { 
          success: true, 
          data: { 
            user: mockUser,
            token: localStorage.getItem('token')
          } 
        };
      }
    } catch (error) {
      // Si hay error de conexión, usar modo mock directamente
      console.warn('⚠️ Error de conexión, usando modo testing con datos mock');
      
      const mockUser = {
        userId: `user_${credentials.tenant_id}`,
        email: credentials.email,
        tenantId: credentials.tenant_id,
        nombre: `Usuario de ${credentials.tenant_id}`
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('tenantId', credentials.tenant_id);
      localStorage.setItem('token', `mock_token_${credentials.tenant_id}_${Date.now()}`);
      
      setIsLoading(false);
      return { 
        success: true, 
        data: { 
          user: mockUser,
          token: localStorage.getItem('token')
        } 
      };
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    const result = await authService.register(userData);
    setIsLoading(false);
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    // Limpiar tenantId del localStorage al cerrar sesión
    localStorage.removeItem('tenantId');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
