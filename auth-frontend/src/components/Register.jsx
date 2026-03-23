import { useState } from 'react'
import '../styles/auth.css'

function Register({ onRegister, error }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onRegister(formData)
  }

  return (
    <div>
      <h2 className="auth-title">Регистрация</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-input-group">
          <label className="auth-label">Имя пользователя</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Введите имя"
            className={`auth-input ${error?.username ? 'error' : ''}`}
          />
          {error?.username && <small style={{color: '#e53e3e'}}>{error.username}</small>}
        </div>
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
            placeholder="Введите пароль (мин. 6 символов)"
            className={`auth-input ${error?.password ? 'error' : ''}`}
          />
          {error?.password && <small style={{color: '#e53e3e'}}>{error.password}</small>}
        </div>
        <div className="auth-input-group">
          <label className="auth-label">Подтверждение пароля</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Повторите пароль"
            className={`auth-input ${error?.confirmPassword ? 'error' : ''}`}
          />
          {error?.confirmPassword && <small style={{color: '#e53e3e'}}>{error.confirmPassword}</small>}
        </div>

        {error?.general && (
          <div className="auth-message error" style={{ marginBottom: 8 }}>
            {error.general}
          </div>
        )}

        <button type="submit" className="auth-button">
          Зарегистрироваться
        </button>
      </form>
    </div>
  )
}

export default Register