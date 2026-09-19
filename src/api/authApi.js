import { apiRequest } from './apiClient';

export async function registerUser(payload) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function loginUser(payload) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function fetchCurrentUser() {
  const data = await apiRequest('/auth/me');
  return data.user || null;
}
