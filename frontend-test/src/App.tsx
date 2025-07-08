// src/App.tsx
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import Navbar   from './components/Navbar';
import NavbarAuth  from './components/NavbarAuth';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeContext, useThemeState } from './hooks/useTheme';
import ProtectedRoute from './components/ProtectedRoute';
import Home     from './pages/Home';
import Login    from './pages/Login';
import Register from './pages/Register';
import Cart     from './pages/Mycart';
import Orders   from './pages/Myorders';
import Product  from './pages/Product';
import Search   from './pages/Search';
import CreateProduct from './pages/CreateProduct';
import ViewOrder from './pages/ViewOrder';

const AppLayout: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white theme-transition">
      {/* Elegimos el Navbar apropiado */}
      {['/login', '/register'].includes(pathname) ? <NavbarAuth /> : <Navbar />}

      <div className="pt-16">
        <Routes>
          <Route path="/login"   element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-product" element={
            <ProtectedRoute>
            <CreateProduct />
            </ProtectedRoute>
            } />
          <Route path="/view-order" element={
            <ProtectedRoute>
              <ViewOrder />
            </ProtectedRoute>
            } />
          {/* Rutas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
           <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/product/:id" element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          } />
          <Route path="/search" element={
           <ProtectedRoute>
              <Search />
           </ProtectedRoute>
          } />
          
        </Routes>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeState = useThemeState();
  
  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
};
