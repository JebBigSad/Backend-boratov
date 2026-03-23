import { useState } from 'react'
import '../styles/auth.css'

function Login({ onLogin, error }) {
  const [formData, setFormData] = useState({
    email: '',
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
    onLogin(formData.email, formData.password)
  }

  return (
    <div>
      <h2 className="auth-title">Вход в аккаунт</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-input-group">
          <label className="auth-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Введите email"
            className={`auth-input ${error?.email ? 'error' : ''}`}
          />
          {error?.email && <small style={{color: '#e53e3e'}}>{error.email}</small>}
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