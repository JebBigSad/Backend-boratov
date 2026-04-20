import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import * as supportAPI from '../api/support';

export const useSupportChat = (user) => {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState({});
  const [operators, setOperators] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && user.token) {
      loadTickets();
      loadOperators();
      connectWebSocket();
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  const connectWebSocket = () => {
    if (!user?.token) return;
    
    const socket = io('http://localhost:3001', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('🔌 WebSocket подключён');
      setIsConnected(true);
      
      socket.emit('support:register', {
        userId: user.id,
        role: user.role || 'client',
        name: user.name || user.username,
        token: user.token
      });
    });

    socket.on('support:newMessage', (message) => {
      console.log('📨 Новое сообщение:', message);
      
      if (message.ticketId === activeTicket?.id) {
        setMessages(prev => ({
          ...prev,
          [message.ticketId]: [...(prev[message.ticketId] || []), message]
        }));
      }
      
      loadTickets();
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket отключён');
      setIsConnected(false);
    });

    socketRef.current = socket;
  };

  const loadTickets = async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const response = await supportAPI.listTickets(user.token);
      const ticketsData = response.data || response || [];
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (err) {
      console.error('Ошибка загрузки обращений:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOperators = async () => {
    if (!user?.token) return;
    try {
      const response = await supportAPI.listOperators(user.token);
      const operatorsData = response.data || response || [];
      setOperators(Array.isArray(operatorsData) ? operatorsData : []);
    } catch (err) {
      console.error('Ошибка загрузки операторов:', err);
      setOperators([]);
    }
  };

  const loadMessages = async (ticketId) => {
    if (!user?.token) return [];
    try {
      const response = await supportAPI.listMessages(ticketId, user.token);
      const messagesData = response.data || response || [];
      setMessages(prev => ({ ...prev, [ticketId]: messagesData }));
      
      if (socketRef.current && ticketId) {
        socketRef.current.emit('support:joinTicket', ticketId);
      }
      
      return messagesData;
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
      return [];
    }
  };

  const createTicket = async (title, description) => {
    if (!user?.token) {
      setError('Для создания обращения необходимо войти в аккаунт');
      return null;
    }
    
    try {
      setLoading(true);
      const response = await supportAPI.createTicket({
        title,
        description,
        clientName: user?.name || user?.username || user?.email
      }, user.token);
      
      const newTicket = response.data || response;
      console.log('✅ Создан тикет:', newTicket);
      
      setTickets(prev => [newTicket, ...prev]);
      setActiveTicket(newTicket);
      
      if (socketRef.current && newTicket.id) {
        socketRef.current.emit('support:joinTicket', newTicket.id);
      }
      
      return newTicket;
    } catch (err) {
      console.error('Ошибка создания тикета:', err);
      setError('Ошибка создания обращения');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (ticketId, text) => {
    if (!text.trim()) return;
    if (!ticketId) {
      console.error('❌ ticketId не передан!');
      setError('Ошибка: идентификатор тикета не найден');
      return null;
    }
    
    if (!user?.token) {
      setError('Для отправки сообщения необходимо войти в аккаунт');
      return null;
    }
    
    try {
      console.log('📤 Отправка сообщения в тикет:', ticketId, text);
      
      const response = await supportAPI.sendMessage(ticketId, { text }, user.token);
      const newMessage = response.data || response;
      
      setMessages(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), newMessage]
      }));
      
      if (socketRef.current && isConnected) {
        socketRef.current.emit('support:sendMessage', {
          ticketId: ticketId,
          text: text,
          userId: user.id,
          userName: user.name || user.username,
          userRole: user.role || 'client'
        });
      }
      
      return newMessage;
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err);
      setError('Ошибка отправки сообщения');
      throw err;
    }
  };

  const closeTicket = async (ticketId) => {
    if (!user?.token) return;
    
    try {
      await supportAPI.closeTicket(ticketId, user.token);
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: 'closed' } : ticket
      ));
    } catch (err) {
      setError('Ошибка закрытия обращения');
    }
  };

  const selectTicket = async (ticket) => {
    console.log('📌 Выбран тикет:', ticket);
    setActiveTicket(ticket);
    if (ticket && ticket.id && !messages[ticket.id]) {
      await loadMessages(ticket.id);
    }
  };

  return {
    tickets,
    activeTicket,
    messages,
    operators,
    isConnected,
    error,
    loading,
    createTicket,
    sendMessage,
    closeTicket,
    selectTicket,
    loadTickets,
  };
};