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

  const normalizeRole = (role) => String(role || '').trim().toLowerCase();
  const isSupportStaff = ['operator', 'manager', 'admin'].includes(normalizeRole(user?.role));

  const appendMessageUnique = (ticketId, message) => {
    setMessages(prev => {
      const ticketMessages = prev[ticketId] || [];
      const exists = ticketMessages.some((m) => m.id === message.id);
      if (exists) return prev;
      return {
        ...prev,
        [ticketId]: [...ticketMessages, message]
      };
    });
  };

  const upsertTicket = (ticket) => {
    setTickets((prev) => {
      const idx = prev.findIndex((t) => t.id === ticket.id);
      if (idx === -1) return [ticket, ...prev];
      const next = [...prev];
      next[idx] = { ...next[idx], ...ticket };
      return next;
    });
  };

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
        token: user.token
      });
    });

    socket.on('support:newMessage', (message) => {
      appendMessageUnique(message.ticketId, message);
    });

    socket.on('support:ticketCreated', async (ticket) => {
      if (!ticket) return;
      if (!isSupportStaff && ticket.clientId !== user?.id) return;
      upsertTicket(ticket);
      if (isSupportStaff && !activeTicketRef.current) {
        setActiveTicket(ticket);
        await loadMessages(ticket.id);
      }
    });

    socket.on('support:ticketUpdated', (ticket) => {
      if (!ticket) return;
      if (!isSupportStaff && ticket.clientId !== user?.id) return;
      upsertTicket(ticket);
      if (activeTicketRef.current?.id === ticket.id) {
        setActiveTicket((prev) => (prev ? { ...prev, ...ticket } : prev));
      }
    });

    socket.on('support:error', (payload) => {
      setError(payload?.error || 'Ошибка WebSocket');
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
    if (isSupportStaff) {
      setError('Оператор не может создавать обращения');
      return null;
    }
    try {
      const newTicket = await supportAPI.createTicket({ title, description, clientName: user.username }, user.token);
      upsertTicket(newTicket);
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
      const newMessage = await supportAPI.sendMessage(ticketId, text, user.token);
      appendMessageUnique(ticketId, newMessage);
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
