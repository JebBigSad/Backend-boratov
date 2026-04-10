import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Загрузка тикетов
  useEffect(() => {
    if (user && user.token) {
      loadTickets();
      loadOperators();
    } else if (user && user.isAnonymous) {
      createAnonymousSession();
    }
  }, [user]);

  const createAnonymousSession = () => {
    const demoTicket = {
      id: `demo_${Date.now()}`,
      title: 'Чат поддержки (демо-режим)',
      clientName: user?.name || 'Гость',
      status: 'open',
      createdAt: Date.now(),
      isAnonymous: true
    };
    
    setTickets([demoTicket]);
    setActiveTicket(demoTicket);
    
    setMessages(prev => ({
      ...prev,
      [demoTicket.id]: [{
        id: 'welcome_msg',
        text: 'Добро пожаловать в чат поддержки! Опишите вашу проблему, и мы поможем.',
        authorName: 'Система',
        authorRole: 'system',
        createdAt: Date.now()
      }]
    }));
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
      return messagesData;
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
      return [];
    }
  };

  const createTicket = async (title, description) => {
    if (!user?.token) {
      // Демо-режим
      const newTicket = {
        id: `anon_${Date.now()}`,
        title: title || 'Вопрос в поддержку',
        description: description,
        clientName: user?.name || 'Гость',
        status: 'open',
        createdAt: Date.now(),
        isAnonymous: true
      };
      
      setTickets(prev => Array.isArray(prev) ? [newTicket, ...prev] : [newTicket]);
      setActiveTicket(newTicket);
      
      if (description) {
        setMessages(prev => ({
          ...prev,
          [newTicket.id]: [{
            id: `msg_${Date.now()}`,
            text: description,
            authorName: user?.name || 'Гость',
            authorRole: 'client',
            createdAt: Date.now()
          }]
        }));
      }
      
      return newTicket;
    }
    
    try {
      setLoading(true);
      const response = await supportAPI.createTicket({
        title,
        description,
        clientName: user?.name || user?.email
      }, user.token);
      
      const newTicket = response.data || response;
      setTickets(prev => Array.isArray(prev) ? [newTicket, ...prev] : [newTicket]);
      setActiveTicket(newTicket);
      
      return newTicket;
    } catch (err) {
      setError('Ошибка создания обращения');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (ticketId, text) => {
    if (!text.trim()) return;
    
    // Демо-режим
    if (!user?.token) {
      const newMessage = {
        id: `msg_${Date.now()}`,
        text: text,
        authorName: user?.name || 'Гость',
        authorRole: 'client',
        createdAt: Date.now()
      };
      
      setMessages(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), newMessage]
      }));
      
      // Автоответ через 2 секунды
      setTimeout(() => {
        const autoReply = {
          id: `reply_${Date.now()}`,
          text: 'Спасибо за ваше сообщение! Наш оператор скоро ответит вам.',
          authorName: 'Оператор',
          authorRole: 'operator',
          createdAt: Date.now()
        };
        
        setMessages(prev => ({
          ...prev,
          [ticketId]: [...(prev[ticketId] || []), autoReply]
        }));
      }, 2000);
      
      return newMessage;
    }
    
    try {
      const response = await supportAPI.sendMessage(ticketId, { text }, user.token);
      const newMessage = response.data || response;
      
      setMessages(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), newMessage]
      }));
      
      return newMessage;
    } catch (err) {
      setError('Ошибка отправки сообщения');
      throw err;
    }
  };

  const closeTicket = async (ticketId) => {
    if (!user?.token) {
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: 'closed' } : ticket
      ));
      return;
    }
    
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
    setActiveTicket(ticket);
    if (user?.token && !messages[ticket.id]) {
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