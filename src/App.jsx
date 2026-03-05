import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import './styles/auth.css'

function App() {
  const [activeTab, setActiveTab] = useState('login')
  const [message, setMessage] = useState(null)
  const { currentUser, loading, error, register, login, logout } = useAuth()

  const handleRegister = async (userData) => {
    const result = await register(userData)
    if (result.success) {
      setMessage({ type: 'success', text: 'Регистрация прошла успешно!' })
      setActiveTab('login')
    }
  }

  const handleLogin = async (email, password) => {
    const result = await login(email, password)
    if (result.success) {
      setMessage({ type: 'success', text: 'Вход выполнен успешно!' })
    }
  }

  const handleLogout = () => {
    logout()
    setMessage({ type: 'info', text: 'Вы вышли из аккаунта' })
  }

  if (loading) {
    return (
      <div className="auth-container" style={{textAlign: 'center'}}>
        <h2>Загрузка...</h2>
      </div>
    )
  }

  if (currentUser) {
    return (
      <>
        <Profile user={currentUser} onLogout={handleLogout} />
        {message && (
          <div style={{position: 'fixed', bottom: '20px', right: '20px'}}>
            <div className={`auth-message ${message.type}`}>
              {message.text}
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <div 
          className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          Вход
        </div>
        <div 
          className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          Регистрация
        </div>
      </div>

      {activeTab === 'login' ? (
        <Login onLogin={handleLogin} error={error} />
      ) : (
        <Register onRegister={handleRegister} error={error} />
      )}

      {message && (
        <div className={`auth-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="auth-demo-note">
        ⚡ Демо-версия: данные сохраняются в localStorage браузера<br />
        Демо-аккаунт: demo@example.com / demo123
      </div>
    </div>
  )
}

export default App