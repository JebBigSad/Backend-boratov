import { useState } from 'react'
import '../styles/auth.css'

function Login({ onLogin, error }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin(formData.username, formData.password)
  }

  return (
    <div>
      <h2 className="auth-title">Вход в аккаунт</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-input-group">
          <label className="auth-label">Имя пользователя</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Введите имя пользователя"
            className={`auth-input ${error?.username ? 'error' : ''}`}
          />
          {error?.username && <small style={{color: '#e53e3e'}}>{error.username}</small>}
        </div>
        <div className="auth-input-group">
          <label className="auth-label">Пароль</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Введите пароль"
            className={`auth-input ${error?.password ? 'error' : ''}`}
          />
          {error?.password && <small style={{color: '#e53e3e'}}>{error.password}</small>}
        </div>
        {error?.general && (
          <div className="auth-message error">{error.general}</div>
        )}
        <button type="submit" className="auth-button">
          Войти
        </button>
      </form>
    </div>
  )
}

export default Login
