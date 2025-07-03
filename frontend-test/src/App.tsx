// src/App.tsx
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import Navbar   from './components/Navbar';
import NavbarA  from './components/NavbarA';

import Home     from './pages/Home';
import Login    from './pages/Login';
import Register from './pages/Register';
import Cart     from './pages/Mycart';
import Orders   from './pages/Myorders';
import Product  from './pages/Product';
import Search   from './pages/Search';

const AppLayout: React.FC = () => {
  const { pathname } = useLocation();

  // Definimos las rutas que deben ser de fondo negro
  const blackPages = ['/', '/login', '/register'];
  const isBlack = blackPages.includes(pathname);

  return (
    <div className={`${isBlack ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen`}>
      {/* Elegimos el Navbar apropiado */}
      {['/login', '/register'].includes(pathname) ? <NavbarA /> : <Navbar />}

      <div className="pt-16">
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/cart"    element={<Cart />} />
          <Route path="/orders"  element={<Orders />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/search"  element={<Search />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
