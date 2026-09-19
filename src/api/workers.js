import { apiRequest } from './apiClient';

export async function getWorkers(category) {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const data = await apiRequest(`/workers${query}`);
  return Array.isArray(data.workers) ? data.workers : [];
}

export async function getWorkerById(workerId) {
  const data = await apiRequest(`/workers/${workerId}`);
  return data.worker || null;
}

export async function getNearbyWorkers({ latitude, longitude, radius, category } = {}) {
  const params = new URLSearchParams({ latitude, longitude, radius });
  if (category) params.set('category', category);
  const data = await apiRequest(`/workers/nearby?${params.toString()}`);
  return Array.isArray(data.workers) ? data.workers : [];
}