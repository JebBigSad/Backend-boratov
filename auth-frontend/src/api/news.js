import { endpoints } from './endpoints';
import { apiFetch } from './http';

export function newsUrl(id) {
  return id === undefined ? endpoints.news.root : `${endpoints.news.root}/${id}`;
}

export async function listNews(token) {
  return apiFetch(newsUrl(), { token });
}

export async function getNews(id, token) {
  return apiFetch(newsUrl(id), { token });
}

export async function createNews({ title, content }, token) {
  return apiFetch(newsUrl(), {
    method: 'POST',
    token,
    body: { title, content },
  });
}

export async function updateNews(id, { title, content }, token) {
  return apiFetch(newsUrl(id), {
    method: 'PUT',
    token,
    body: { title, content },
  });
}

export async function deleteNews(id, token) {
  return apiFetch(newsUrl(id), {
    method: 'DELETE',
    token,
  });
}

