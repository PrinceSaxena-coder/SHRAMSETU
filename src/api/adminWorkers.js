import { apiRequest } from './apiClient';

export async function listWorkers() {
  const data = await apiRequest('/workers');
  return Array.isArray(data.workers) ? data.workers : [];
}