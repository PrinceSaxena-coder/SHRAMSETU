import { apiRequest } from './apiClient';

export async function getServices() {
  const data = await apiRequest('/services');
  return Array.isArray(data.services) ? data.services : [];
}

export async function getServiceById(serviceId) {
  const data = await apiRequest(`/services/${serviceId}`);
  return data.service || null;
}
