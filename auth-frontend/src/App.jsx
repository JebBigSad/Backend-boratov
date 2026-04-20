import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/Header/Header'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import PostsCrud from './components/PostsCrud'
import ProductsCrud from './components/ProductsCrud'
import NewsCrud from './components/NewsCrud'
import SupportButton from './components/SupportChat/SupportButton'
import './styles/global.css'

function App() {
  const [activeTab, setActiveTab] = useState('login')
  const [entityTab, setEntityTab] = useState('posts')
  const [message, setMessage] = useState(null)
  const { currentUser, loading, error, register, login, logout, token } = useAuth()

  const handleRegister = async (userData) => {
    const result = await register(userData)
    if (result.success) {
      setMessage({ type: 'success', text: 'Регистрация прошла успешно!' })
      setActiveTab('login')
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleLogin = async (email, password) => {
    const result = await login(email, password)
    if (result.success) {
      setMessage({ type: 'success', text: 'Вход выполнен успешно!' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleLogout = () => {
    logout()
    setMessage({ type: 'info', text: 'Вы вышли из аккаунта' })
    setTimeout(() => setMessage(null), 3000)
  }

  const clearMessage = () => setMessage(null)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="app">
        <Header user={currentUser} onLogout={handleLogout} />

        <main className="main-content">
          {currentUser ? (
            <>
              <div className="crud-tabs">
                <button
                  className={`crud-tab ${entityTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setEntityTab('posts')}
                >
                  📝 Посты
                </button>
                <button
                  className={`crud-tab ${entityTab === 'products' ? 'active' : ''}`}
                  onClick={() => setEntityTab('products')}
                >
                  🛍️ Товары
                </button>
                <button
                  className={`crud-tab ${entityTab === 'news' ? 'active' : ''}`}
                  onClick={() => setEntityTab('news')}
                >
                  📰 Новости
                </button>
              </div>

              <div className="crud-container">
                {entityTab === 'posts' && <PostsCrud token={token} />}
                {entityTab === 'products' && <ProductsCrud token={token} />}
                {entityTab === 'news' && <NewsCrud token={token} />}
              </div>

              <SupportButton user={currentUser} />
            </>
          ) : (
            <div className="auth-wrapper">
              <div className="auth-card">
                <div className="auth-tabs">
                  <button
                    className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                    onClick={() => setActiveTab('login')}
                  >
                    Вход
                  </button>
                  <button
                    className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                    onClick={() => setActiveTab('register')}
                  >
                    Регистрация
                  </button>
                </div>

                {activeTab === 'login' ? (
                  <Login onLogin={handleLogin} error={error} />
                ) : (
                  <Register onRegister={handleRegister} error={error} />
                )}
              </div>
            </div>
          )}
        </main>

        {message && (
          <div className={`toast-message ${message.type}`}>
            {message.text}
            <button onClick={clearMessage} className="toast-close">✕</button>
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}

export default App