import { endpoints } from './endpoints';
import { apiFetch } from './http';

export async function login(username, password) {
  return apiFetch(endpoints.auth.login, {
    method: 'POST',
    body: { username, password },
  });
}

export async function register(username, email, password, confirmPassword) {
  return apiFetch(endpoints.auth.register, {
    method: 'POST',
    body: { username, email, password, confirmPassword },
  });
}

export async function logout(token) {
  return apiFetch(endpoints.auth.logout, {
    method: 'POST',
    token,
  });
}
