import { useState, useEffect, useRef } from 'react'
import { useSupportChat } from '../../hooks/useSupportChat'
import './SupportChat.css'

const SupportChat = ({ user, onClose }) => {
  const [messageText, setMessageText] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTicketTitle, setNewTicketTitle] = useState('')
  const [newTicketDescription, setNewTicketDescription] = useState('')
  
  const {
    tickets,
    activeTicket,
    messages,
    isConnected,
    error,
    loading,
    createTicket,
    sendMessage,
    closeTicket,
    selectTicket,
  } = useSupportChat(user)

  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeTicket])

  const handleCreateTicket = async () => {
    if (!newTicketTitle.trim() && !newTicketDescription.trim()) return
    const newTicket = await createTicket(newTicketTitle, newTicketDescription)
    console.log('📌 Создан тикет:', newTicket)
    setShowCreateForm(false)
    setNewTicketTitle('')
    setNewTicketDescription('')
  }

  const handleSendMessage = async () => {
    console.log('🔍 handleSendMessage вызван')
    console.log('activeTicket:', activeTicket)
    console.log('messageText:', messageText)
    
    if (!activeTicket) {
      console.error('❌ Нет активного тикета')
      return
    }
    
    if (!messageText.trim()) {
      console.log('❌ Пустое сообщение')
      return
    }
    
    const ticketId = activeTicket.id
    console.log('📤 ticketId для отправки:', ticketId)
    
    if (!ticketId) {
      console.error('❌ ticketId отсутствует в activeTicket:', activeTicket)
      return
    }
    
    try {
      await sendMessage(ticketId, messageText)
      setMessageText('')
    } catch (err) {
      console.error('❌ Ошибка отправки:', err)
    }
  }

  const handleSelectTicket = (ticket) => {
    console.log('📌 Выбран тикет для загрузки:', ticket)
    selectTicket(ticket)
  }

  const getStatusText = (status) => {
    const statusMap = {
      open: '🟡 Открыт',
      in_progress: '🔵 В обработке',
      resolved: '🟢 Решён',
      closed: '⚫ Закрыт',
    }
    return statusMap[status] || status
  }

  const currentMessages = activeTicket && messages[activeTicket.id] ? messages[activeTicket.id] : []

  return (
    <div className="support-chat">
      <div className="support-chat-header">
        <div className="header-title">
          <h3>🆘 Поддержка</h3>
          {isConnected && <span className="online-status">● Онлайн</span>}
        </div>
        <button onClick={onClose} className="close-button">✕</button>
      </div>

      {error && <div className="support-chat-error">{error}</div>}

      <div className="support-chat-body">
        <div className="support-sidebar">
          <div className="sidebar-header">
            <h4>Мои обращения</h4>
            <button 
              className="create-ticket-btn"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              +
            </button>
          </div>

          {showCreateForm && (
            <div className="create-ticket-form">
              <input
                type="text"
                placeholder="Тема обращения"
                value={newTicketTitle}
                onChange={(e) => setNewTicketTitle(e.target.value)}
              />
              <textarea
                placeholder="Опишите проблему..."
                value={newTicketDescription}
                onChange={(e) => setNewTicketDescription(e.target.value)}
                rows="3"
              />
              <div className="form-buttons">
                <button onClick={() => setShowCreateForm(false)}>Отмена</button>
                <button onClick={handleCreateTicket}>Создать</button>
              </div>
            </div>
          )}

          <div className="tickets-list">
            {loading && <div className="loading">Загрузка...</div>}
            {!loading && (!Array.isArray(tickets) || tickets.length === 0) && (
              <div className="empty-state">Нет обращений</div>
            )}
            {Array.isArray(tickets) && tickets.map((ticket, index) => (
              <div
                key={ticket.id || ticket._id || `ticket-${index}`}
                className={`ticket-item ${activeTicket?.id === ticket.id ? 'active' : ''}`}
                onClick={() => handleSelectTicket(ticket)}
              >
                <div className="ticket-title">{ticket.title}</div>
                <div className="ticket-status">{getStatusText(ticket.status)}</div>
                <div className="ticket-date">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="support-chat-area">
          {activeTicket ? (
            <>
              <div className="chat-header">
                <div>
                  <h4>{activeTicket.title}</h4>
                  <div className="chat-meta">
                    <span>Статус: {getStatusText(activeTicket.status)}</span>
                    <span>ID: {activeTicket.id}</span>
                  </div>
                </div>
                {activeTicket.status !== 'closed' && (
                  <button 
                    className="close-ticket-btn"
                    onClick={() => closeTicket(activeTicket.id)}
                  >
                    Закрыть обращение
                  </button>
                )}
              </div>

              <div className="chat-messages">
                {currentMessages.length === 0 ? (
                  <div className="empty-state">Начните диалог...</div>
                ) : (
                  currentMessages.map((msg, index) => (
                    <div
                      key={msg.id || msg._id || `msg-${index}`}
                      className={`message ${msg.authorRole === 'client' ? 'client' : 'operator'}`}
                    >
                      <div className="message-author">{msg.authorName}</div>
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {activeTicket.status !== 'closed' && (
                <div className="chat-input-area">
                  <input
                    type="text"
                    placeholder="Введите сообщение..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button onClick={handleSendMessage}>Отправить</button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              Выберите обращение из списка
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupportChat