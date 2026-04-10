export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
  },
  posts: {
    root: '/api/posts',
  },
  products: {
    root: '/api/products',
  },
  news: {
    root: '/api/news',
  },
  // Добавляем поддержку чата
  support: {
    tickets: '/api/support/tickets',
    operators: '/api/support/operators',
    messages: (ticketId) => `/api/support/tickets/${ticketId}/messages`,
    unread: '/api/support/tickets/unread',
    close: (ticketId) => `/api/support/tickets/${ticketId}/close`,
  },
}