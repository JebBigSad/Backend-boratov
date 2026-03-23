const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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

  // 204 No Content
  if (res.status === 204) return null;

  return data;
}

