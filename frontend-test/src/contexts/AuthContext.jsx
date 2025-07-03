import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/api';

/**
 * @typedef {Object} User
 * @property {string} [userId]
 * @property {string} [email]
 * @property {string} [nombre]
 * @property {string} [tenantId]
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading
 * @property {function(Object):Promise<Object>} login
 * @property {function(Object):Promise<Object>} register
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
      const token = userService.getToken();
      if (token) {
        const result = await userService.validateToken();
        if (result.success) {
          const currentUser = userService.getCurrentUser();
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
          } else {
            setUser(currentUser);
          }
        } else {
          userService.logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    const result = await userService.login(credentials);
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
    }
    setIsLoading(false);
    return result;
  };

  const register = async (userData) => {
    setIsLoading(true);
    const result = await userService.register(userData);
    setIsLoading(false);
    return result;
  };

  const logout = () => {
    userService.logout();
    setUser(null);
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
