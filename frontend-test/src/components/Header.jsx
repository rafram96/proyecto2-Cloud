import { Link } from 'react-router-dom'
import { userService } from '../services/api'

function Header() {
  const isAuthenticated = userService.isAuthenticated()
  const currentUser = userService.getCurrentUser()

  const handleLogout = () => {
    userService.logout()
    window.location.href = '/login'
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          Test API Usuarios
        </div>
        <nav>
          <ul className="nav-links">
            {!isAuthenticated ? (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Registro</Link></li>
              </>            ) : (
              <>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/auth-status">Estado Auth</Link></li>
                <li>
                  <span>Hola, {currentUser?.nombre}</span>
                </li>
                <li>
                  <button onClick={handleLogout} style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'white', 
                    cursor: 'pointer',
                    padding: '0.5rem 1rem'
                  }}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
