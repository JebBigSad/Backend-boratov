import { Router } from 'express'

const router = Router()

// Хранилище в памяти (временно)
let tickets: any[] = []
let messages: any[] = []

// Получить все тикеты
router.get('/tickets', async (req, res) => {
  res.json(tickets)
})

// Создать новый тикет
router.post('/tickets', async (req, res) => {
  const { title, description, clientName } = req.body
  const newTicket = {
    id: Date.now().toString(),
    title: title || 'Новое обращение',
    description: description || '',
    clientName: clientName || 'Пользователь',
    status: 'open',
    createdAt: new Date().toISOString()
  }
  tickets.unshift(newTicket)
  console.log('✅ Создан тикет:', newTicket.id, newTicket.title)
  res.json(newTicket)
})

// Получить сообщения тикета
router.get('/tickets/:ticketId/messages', async (req, res) => {
  const { ticketId } = req.params
  const ticketMessages = messages.filter(m => m.ticketId === ticketId)
  res.json(ticketMessages)
})

// Отправить сообщение
router.post('/tickets/:ticketId/messages', async (req, res) => {
  const { ticketId } = req.params
  const { text } = req.body
  const userId = (req as any).user?.id || 1
  const userName = (req as any).user?.username || (req as any).user?.email || 'Пользователь'
  const userRole = (req as any).user?.role || 'client'
  
  const newMessage = {
    id: Date.now().toString(),
    ticketId: ticketId,
    text: text,
    authorId: userId,
    authorName: userName,
    authorRole: userRole,
    createdAt: new Date().toISOString()
  }
  messages.push(newMessage)
  console.log(`💬 Сообщение в тикет ${ticketId} от ${userName}: ${text}`)
  res.json(newMessage)
})

// Закрыть тикет
router.patch('/tickets/:ticketId/close', async (req, res) => {
  const { ticketId } = req.params
  const ticket = tickets.find(t => t.id === ticketId)
  if (ticket) {
    ticket.status = 'closed'
  }
  res.json(ticket)
})

// Получить операторов
router.get('/operators', async (req, res) => {
  res.json([])
})

export default router