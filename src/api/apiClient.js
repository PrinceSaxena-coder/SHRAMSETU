const DEFAULT_API_BASE = 'http://localhost:5000/api';

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, '');
}

export function getStoredToken() {
  return localStorage.getItem('shramsetu_token');
}

export async function apiRequest(path, options = {}) {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const { headers: extraHeaders = {}, ...rest } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  const token = getStoredToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...rest,
    headers,
  });

  const text = await response.text();
  let payload = {};

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const error = new Error(payload?.message || 'Request failed');
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}
