import { Router } from 'express'

const router = Router()

// Временное API для проверки
router.get('/tickets', async (req, res) => {
  res.json({ message: 'API работает, но Prisma не подключён' })
})

router.post('/tickets', async (req, res) => {
  res.json({ message: 'Тикет создан (демо-режим)', data: req.body })
})

router.get('/tickets/:ticketId/messages', async (req, res) => {
  res.json({ messages: [] })
})

router.post('/tickets/:ticketId/messages', async (req, res) => {
  res.json({ message: 'Сообщение отправлено (демо-режим)', text: req.body.text })
})

router.get('/operators', async (req, res) => {
  res.json([])
})

export default router
