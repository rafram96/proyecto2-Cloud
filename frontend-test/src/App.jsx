import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AuthStatus from './pages/AuthStatus'

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth-status" element={<AuthStatus />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
