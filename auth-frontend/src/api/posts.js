import { endpoints } from './endpoints';
import { apiFetch } from './http';

export function postsUrl(id) {
  return id === undefined ? endpoints.posts.root : `${endpoints.posts.root}/${id}`;
}

export async function listPosts(token) {
  return apiFetch(postsUrl(), { token });
}

export async function getPost(id, token) {
  return apiFetch(postsUrl(id), { token });
}

export async function createPost({ title, content }, token) {
  return apiFetch(postsUrl(), {
    method: 'POST',
    token,
    body: { title, content },
  });
}

export async function updatePost(id, { title, content }, token) {
  return apiFetch(postsUrl(id), {
    method: 'PUT',
    token,
    body: { title, content },
  });
}

export async function deletePost(id, token) {
  return apiFetch(postsUrl(id), {
    method: 'DELETE',
    token,
  });
}

