const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function parseBodySafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = {};

  if (!(body instanceof FormData) && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  // Добавляем токен (из параметра или из localStorage)
  const authToken = token || localStorage.getItem('token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
    console.log('✅ Токен добавлен в запрос к:', path); // Для отладки
  } else {
    console.warn('⚠️ Нет токена для запроса к:', path);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = parseBodySafely(await res.text());

  if (!res.ok) {
    const message = data?.error || data?.errors || data?.message || 'Request failed';
    const err = new Error(typeof message === 'string' ? message : 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  if (res.status === 204) return null;
  return data;
}