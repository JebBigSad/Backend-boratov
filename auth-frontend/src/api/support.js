import { endpoints } from './endpoints';
import { apiFetch } from './http';

// Вспомогательные функции для формирования URL
export function ticketsUrl(id) {
  return id === undefined ? endpoints.support.tickets : `${endpoints.support.tickets}/${id}`;
}

export function messagesUrl(ticketId, messageId) {
  const base = endpoints.support.messages(ticketId);
  return messageId === undefined ? base : `${base}/${messageId}`;
}

// Получить все тикеты пользователя
export async function listTickets(token) {
  return apiFetch(ticketsUrl(), { token });
}

// Получить конкретный тикет
export async function getTicket(id, token) {
  return apiFetch(ticketsUrl(id), { token });
}

// Создать новый тикет
export async function createTicket({ title, description, clientName }, token) {
  return apiFetch(ticketsUrl(), {
    method: 'POST',
    token,
    body: { title, description, clientName },
  });
}

// Получить сообщения тикета
export async function listMessages(ticketId, token) {
  return apiFetch(messagesUrl(ticketId), { token });
}

// Отправить сообщение
export async function sendMessage(ticketId, { text }, token) {
  return apiFetch(messagesUrl(ticketId), {
    method: 'POST',
    token,
    body: { text },
  });
}

// Закрыть тикет
export async function closeTicket(ticketId, token) {
  return apiFetch(endpoints.support.close(ticketId), {
    method: 'PATCH',
    token,
  });
}

// Получить список операторов
export async function listOperators(token) {
  return apiFetch(endpoints.support.operators, { token });
}

// Получить количество непрочитанных сообщений
export async function getUnreadCount(token) {
  return apiFetch(endpoints.support.unread, { token });
}