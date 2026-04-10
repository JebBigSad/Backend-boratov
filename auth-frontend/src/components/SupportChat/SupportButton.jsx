import { useState } from 'react'
import SupportChat from './SupportChat'
import './SupportButton.css'

const SupportButton = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false)

  // Если есть авторизованный пользователь - используем его
  // Если нет - создаём анонимного
  const chatUser = user && user.token ? user : {
    id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: 'Гость',
    email: 'guest@example.com',
    role: 'client',
    token: null,
    isAnonymous: true
  }

  return (
    <>
      {!isOpen && (
        <button 
          className="support-button"
          onClick={() => setIsOpen(true)}
          title="Открыть чат поддержки"
        >
          <span className="support-icon">💬</span>
          <span className="support-text">Поддержка</span>
        </button>
      )}
      
      {isOpen && (
        <SupportChat 
          user={chatUser}
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  )
}

export default SupportButton