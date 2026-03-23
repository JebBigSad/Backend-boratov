import { endpoints } from './endpoints';
import { apiFetch } from './http';

export function productsUrl(id) {
  return id === undefined ? endpoints.products.root : `${endpoints.products.root}/${id}`;
}

export async function listProducts(token) {
  return apiFetch(productsUrl(), { token });
}

export async function getProduct(id, token) {
  return apiFetch(productsUrl(id), { token });
}

export async function createProduct({ title, description, price }, token) {
  return apiFetch(productsUrl(), {
    method: 'POST',
    token,
    body: { title, description, price },
  });
}

export async function updateProduct(id, { title, description, price }, token) {
  return apiFetch(productsUrl(id), {
    method: 'PUT',
    token,
    body: { title, description, price },
  });
}

export async function deleteProduct(id, token) {
  return apiFetch(productsUrl(id), {
    method: 'DELETE',
    token,
  });
}

