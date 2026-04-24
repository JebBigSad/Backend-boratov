import { Router } from 'express';

const router = Router();

// Хранилище в памяти
let tickets: any[] = [];
let messages: any[] = [];

router.get('/tickets', (req, res) => {
  const userRole = (req as any).user?.role;
  const userId = (req as any).user?.id;
  
  let result;
  if (userRole === 'operator') {
    result = tickets;
  } else {
    result = tickets.filter(t => t.clientId === userId);
  }
  res.json(result);
});

router.post('/tickets', (req, res) => {
  const { title, description } = req.body;
  const userId = (req as any).user?.id;
  const userName = (req as any).user?.username;
  
  const newTicket = {
    id: Date.now().toString(),
    title,
    description,
    clientId: userId,
    clientName: userName,
    status: 'open',
    createdAt: new Date().toISOString()
  };
  tickets.unshift(newTicket);
  res.json(newTicket);
});

router.get('/tickets/:ticketId/messages', (req, res) => {
  const { ticketId } = req.params;
  const ticketMessages = messages.filter(m => m.ticketId === ticketId);
  res.json(ticketMessages);
});

router.post('/tickets/:ticketId/messages', (req, res) => {
  const { ticketId } = req.params;
  const { text } = req.body;
  const userId = (req as any).user?.id;
  const userName = (req as any).user?.username;
  const userRole = (req as any).user?.role || 'client';
  
  const newMessage = {
    id: Date.now().toString(),
    ticketId: ticketId,
    text: text,
    authorId: userId,
    authorName: userName,
    authorRole: userRole,
    createdAt: new Date().toISOString()
  };
  messages.push(newMessage);
  res.json(newMessage);
});

router.patch('/tickets/:ticketId/close', (req, res) => {
  const { ticketId } = req.params;
  const ticket = tickets.find(t => t.id === ticketId);
  if (ticket) ticket.status = 'closed';
  res.json(ticket);
});

router.get('/operators', (req, res) => {
  res.json([]);
});

export default router;
