import { apiFetch } from './http';

export const getTickets = (token) => {
  return apiFetch('/api/support/tickets', { token });
};

export const createTicket = (data, token) => {
  return apiFetch('/api/support/tickets', {
    method: 'POST',
    body: data,
    token
  });
};

export const getMessages = (ticketId, token) => {
  return apiFetch(`/api/support/tickets/${ticketId}/messages`, { token });
};

export const sendMessage = (ticketId, text, token) => {
  return apiFetch(`/api/support/tickets/${ticketId}/messages`, {
    method: 'POST',
    body: { text },
    token
  });
};

export const closeTicket = (ticketId, token) => {
  return apiFetch(`/api/support/tickets/${ticketId}/close`, {
    method: 'PATCH',
    token
  });
};

export const getOperators = (token) => {
  return apiFetch('/api/support/operators', { token });
};
