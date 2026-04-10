import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import PostsCrud from './components/PostsCrud'
import ProductsCrud from './components/ProductsCrud'
import NewsCrud from './components/NewsCrud'
import SupportButton from './components/SupportChat/SupportButton'
import './styles/auth.css'

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
      <div className="auth-container" style={{textAlign: 'center'}}>
        <h2>Загрузка...</h2>
      </div>
    )
  }

  // Авторизованный пользователь
  if (currentUser) {
    return (
      <>
        <Profile user={currentUser} onLogout={handleLogout} />

        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setEntityTab('posts')}
            style={{ marginRight: 8, fontWeight: entityTab === 'posts' ? 700 : 400 }}
          >
            Посты
          </button>
          <button
            type="button"
            onClick={() => setEntityTab('products')}
            style={{ marginRight: 8, fontWeight: entityTab === 'products' ? 700 : 400 }}
          >
            Товары
          </button>
          <button
            type="button"
            onClick={() => setEntityTab('news')}
            style={{ fontWeight: entityTab === 'news' ? 700 : 400 }}
          >
            Новости
          </button>
        </div>

        {entityTab === 'posts' && <PostsCrud token={token} />}
        {entityTab === 'products' && <ProductsCrud token={token} />}
        {entityTab === 'news' && <NewsCrud token={token} />}

        {/* Кнопка чата поддержки - передаём реального пользователя */}
        <SupportButton user={currentUser} />

        {message && (
          <div style={{position: 'fixed', bottom: '20px', right: '20px', zIndex: 1001}}>
            <div className={`auth-message ${message.type}`}>
              {message.text}
              <button 
                onClick={clearMessage}
                style={{marginLeft: '10px', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer'}}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  // Неавторизованный пользователь (страница входа/регистрации)
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
          <button 
            onClick={clearMessage}
            style={{marginLeft: '10px', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer'}}
          >
            ✕
          </button>
        </div>
      )}

      <div className="auth-demo-note">
        Для работы с CRUD используйте ваш аккаунт в базе данных (JWT).
      </div>
      
      {/* Чат только для авторизованных - не показываем на странице входа */}
    </div>
  )
}

export default App