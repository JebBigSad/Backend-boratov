import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import './Header.css'

const Header = ({ user, onLogout }) => {
  const { isDark, toggleTheme } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  const tabs = [
    { id: 'home', label: '🏠 Главная', path: '/' },
    { id: 'about', label: '📖 О нас', path: '/about' },
    { id: 'reviews', label: '⭐ Отзывы', path: '/reviews' },
    { id: 'contacts', label: '📞 Контакты', path: '/contacts' },
  ]

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">MyApp</span>
        </div>

        <nav className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDark ? '☀️' : '🌙'}
          </button>

          {user && (
            <div className="user-menu">
              <button 
                className="user-avatar"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="avatar-icon">👤</span>
                <span className="user-name">{user.name || user.username}</span>
                <span className="dropdown-arrow">▼</span>
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <strong>{user.name || user.username}</strong>
                    <small>{user.email}</small>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={() => alert('Профиль')}>
                    👤 Профиль
                  </button>
                  <button className="dropdown-item" onClick={() => alert('Настройки')}>
                    ⚙️ Настройки
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={onLogout}>
                    🚪 Выйти
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header