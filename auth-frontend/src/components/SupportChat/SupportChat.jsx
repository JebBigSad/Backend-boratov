import { useState, useEffect, useRef } from 'react';
import { useSupportChat } from '../../hooks/useSupportChat';
import './SupportChat.css';

const SupportChat = ({ user, onClose }) => {
  const [messageText, setMessageText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  const { tickets, activeTicket, messages, loading, error, createTicket, sendMessage, closeTicket, selectTicket } = useSupportChat(user);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTicket]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createTicket(newTitle, newDesc);
    setShowForm(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleSend = async () => {
    if (!activeTicket || !messageText.trim()) return;
    await sendMessage(activeTicket.id, messageText);
    setMessageText('');
  };

  const currentMessages = activeTicket ? (messages[activeTicket.id] || []) : [];
  const statusMap = { open: 'Открыт', closed: 'Закрыт' };

  return (
    <div className="support-chat">
      <div className="support-header">
        <h3>Поддержка</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      {error && <div className="error-msg">{error}</div>}
      
      <div className="support-body">
        <div className="tickets-sidebar">
          <div className="tickets-header">
            <h4>Мои обращения</h4>
            <button onClick={() => setShowForm(!showForm)} className="new-ticket-btn">+</button>
          </div>
          
          {showForm && (
            <div className="new-ticket-form">
              <input type="text" placeholder="Тема" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              <textarea placeholder="Описание" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} />
              <button onClick={handleCreate}>Создать</button>
            </div>
          )}
          
          <div className="tickets-list">
            {loading && <div className="empty-text">Загрузка...</div>}
            {!loading && tickets.length === 0 && <div className="empty-text">Нет обращений</div>}
            {tickets.map(t => (
              <div key={t.id} className={`ticket-item ${activeTicket?.id === t.id ? 'active' : ''}`} onClick={() => selectTicket(t)}>
                <div className="ticket-title">{t.title}</div>
                <div className="ticket-status">{statusMap[t.status]}</div>
                <div className="ticket-date">{new Date(t.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="chat-area">
          {activeTicket ? (
            <>
              <div className="chat-info">
                <span><strong>{activeTicket.title}</strong></span>
                {activeTicket.status !== 'closed' && (
                  <button onClick={() => closeTicket(activeTicket.id)} className="close-ticket-btn">Закрыть</button>
                )}
              </div>
              <div className="messages-list">
                {currentMessages.length === 0 && <div className="empty-text">Нет сообщений</div>}
                {currentMessages.map(m => (
                  <div key={m.id} className={`message ${m.authorRole === 'client' ? 'client' : 'operator'}`}>
                    <strong>{m.authorName}</strong>
                    <p>{m.text}</p>
                    <small>{new Date(m.createdAt).toLocaleTimeString()}</small>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="input-area">
                <input type="text" value={messageText} onChange={e => setMessageText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Введите сообщение..." />
                <button onClick={handleSend}>Отправить</button>
              </div>
            </>
          ) : (
            <div className="empty-chat">Выберите обращение</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportChat;
