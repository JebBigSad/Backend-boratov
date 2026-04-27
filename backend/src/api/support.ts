import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
const { getIO } = require("../socket");

const router = Router();

// Хранилище в памяти
let tickets: any[] = [];
let messages: any[] = [];

router.use(authenticateToken);

function normalizeRole(userRole?: string) {
  return String(userRole || "")
    .trim()
    .toLowerCase();
}

function isSupportStaff(userRole?: string) {
  const role = normalizeRole(userRole);
  return role === "operator" || role === "manager" || role === "admin";
}

function canAccessTicket(ticket: any, userId?: number, userRole?: string) {
  if (!ticket || !userId) return false;
  if (isSupportStaff(userRole)) return true;
  return ticket.clientId === userId;
}

router.get("/tickets", (req, res) => {
  const userRole = req.user?.role;
  const userId = req.user?.id;

  let result;
  if (isSupportStaff(userRole)) {
    result = tickets;
  } else {
    result = tickets.filter((t) => t.clientId === userId);
  }
  res.json(result);
});

router.post("/tickets", (req, res) => {
  const { title, description } = req.body;
  const userId = req.user?.id;
  const userName = req.user?.username;
  const userRole = req.user?.role || "client";
  if (!userId) {
    return res.status(401).json({ error: "Не авторизован" });
  }
  if (isSupportStaff(userRole)) {
    return res
      .status(403)
      .json({ error: "Оператор не может создавать обращения" });
  }
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Тема обращения обязательна" });
  }

  const newTicket = {
    id: Date.now().toString(),
    title: title.trim(),
    description,
    clientId: userId,
    clientName: userName,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  tickets.unshift(newTicket);
  const io = getIO();
  if (io) {
    io.emit("support:ticketCreated", newTicket);
  }
  res.json(newTicket);
});

router.get("/tickets/:ticketId/messages", (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) {
    return res.status(404).json({ error: "Обращение не найдено" });
  }
  if (!canAccessTicket(ticket, userId, userRole)) {
    return res.status(403).json({ error: "Нет доступа к обращению" });
  }
  const ticketMessages = messages.filter((m) => m.ticketId === ticketId);
  res.json(ticketMessages);
});

router.post("/tickets/:ticketId/messages", (req, res) => {
  const { ticketId } = req.params;
  const { text } = req.body;
  const userId = req.user?.id;
  const userName = req.user?.username;
  const userRole = req.user?.role || "client";
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) {
    return res.status(404).json({ error: "Обращение не найдено" });
  }
  if (!canAccessTicket(ticket, userId, userRole)) {
    return res.status(403).json({ error: "Нет доступа к обращению" });
  }
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Текст сообщения обязателен" });
  }

  const newMessage = {
    id: Date.now().toString(),
    ticketId: ticketId,
    text: text.trim(),
    authorId: userId,
    authorName: userName,
    authorRole: userRole,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  const io = getIO();
  if (io) {
    io.to(`ticket_${ticketId}`).emit("support:newMessage", newMessage);
  }
  res.json(newMessage);
});

router.patch("/tickets/:ticketId/close", (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) {
    return res.status(404).json({ error: "Обращение не найдено" });
  }
  if (!canAccessTicket(ticket, userId, userRole)) {
    return res.status(403).json({ error: "Нет доступа к обращению" });
  }
  ticket.status = "closed";
  const io = getIO();
  if (io) {
    io.emit("support:ticketUpdated", ticket);
  }
  res.json(ticket);
});

router.get("/operators", (req, res) => {
  res.json([]);
});

export default router;
