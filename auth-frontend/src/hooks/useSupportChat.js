import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import * as supportAPI from '../api/support';

export const useSupportChat = (user) => {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef(null);
  const activeTicketRef = useRef(activeTicket);

  useEffect(() => {
    activeTicketRef.current = activeTicket;
  }, [activeTicket]);

  useEffect(() => {
    if (user && user.token) {
      loadTickets();
      connectWebSocket();
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  const connectWebSocket = () => {
    if (!user?.token) return;
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('��� WebSocket подключён');
      setIsConnected(true);
      socket.emit('support:register', {
        userId: user.id,
        role: user.role || 'client',
        name: user.username
      });
    });

    socket.on('support:newMessage', (message) => {
      // Показываем сообщения только от ДРУГИХ пользователей
      if (message.authorId !== user.id) {
        console.log('��� Сообщение от другого пользователя:', message);
        setMessages(prev => ({
          ...prev,
          [message.ticketId]: [...(prev[message.ticketId] || []), message]
        }));
      }
    });

    socket.on('disconnect', () => {
      console.log('��� WebSocket отключён');
      setIsConnected(false);
    });
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await supportAPI.getTickets(user.token);
      setTickets(data || []);
      if (data && data.length > 0 && !activeTicket) {
        setActiveTicket(data[0]);
        await loadMessages(data[0].id);
      }
    } catch (err) {
      setError('Ошибка загрузки обращений');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId) => {
    try {
      const data = await supportAPI.getMessages(ticketId, user.token);
      setMessages(prev => ({ ...prev, [ticketId]: data || [] }));
      if (socketRef.current) {
        socketRef.current.emit('support:joinTicket', ticketId);
      }
    } catch (err) {
      setError('Ошибка загрузки сообщений');
    }
  };

  const createTicket = async (title, description) => {
    try {
      const newTicket = await supportAPI.createTicket({ title, description, clientName: user.username }, user.token);
      setTickets(prev => [newTicket, ...prev]);
      setActiveTicket(newTicket);
      if (socketRef.current) {
        socketRef.current.emit('support:joinTicket', newTicket.id);
      }
      return newTicket;
    } catch (err) {
      setError('Ошибка создания обращения');
      throw err;
    }
  };

  const sendMessage = async (ticketId, text) => {
    if (!text.trim()) return;
    try {
      // Отправляем через API
      const newMessage = await supportAPI.sendMessage(ticketId, text, user.token);
      
      // Добавляем своё сообщение сразу
      setMessages(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), newMessage]
      }));
      
      // Уведомляем других через WebSocket
      if (socketRef.current && isConnected) {
        socketRef.current.emit('support:sendMessage', {
          ticketId: ticketId,
          text: text,
          userId: user.id,
          userName: user.username,
          userRole: user.role || 'client'
        });
      }
    } catch (err) {
      setError('Ошибка отправки сообщения');
      throw err;
    }
  };

  const closeTicket = async (ticketId) => {
    try {
      await supportAPI.closeTicket(ticketId, user.token);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'closed' } : t));
    } catch (err) {
      setError('Ошибка закрытия обращения');
    }
  };

  const selectTicket = async (ticket) => {
    setActiveTicket(ticket);
    if (!messages[ticket.id]) {
      await loadMessages(ticket.id);
    }
    if (socketRef.current) {
      socketRef.current.emit('support:joinTicket', ticket.id);
    }
  };

  return {
    tickets,
    activeTicket,
    messages,
    loading,
    error,
    isConnected,
    createTicket,
    sendMessage,
    closeTicket,
    selectTicket
  };
};
