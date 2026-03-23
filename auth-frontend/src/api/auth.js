import { endpoints } from './endpoints';
import { apiFetch } from './http';

export async function login(email, password) {
  return apiFetch(endpoints.auth.login, {
    method: 'POST',
    body: { email, password },
  });
}

export async function register(username, email, password) {
  return apiFetch(endpoints.auth.register, {
    method: 'POST',
    body: { username, email, password },
  });
}

export async function logout(token) {
  return apiFetch(endpoints.auth.logout, {
    method: 'POST',
    token,
  });
}

