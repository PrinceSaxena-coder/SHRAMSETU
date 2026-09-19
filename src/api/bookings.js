import { apiRequest } from './apiClient';

export async function listBookings() {
  const data = await apiRequest('/bookings');
  return Array.isArray(data.bookings) ? data.bookings : [];
}

export async function createBooking(payload = {}) {
  const normalized = {
    workerId: payload.workerId,
    serviceId: payload.serviceId || payload.service || null,
    address: payload.address || payload.location || 'Customer address',
    latitude: Number(payload.latitude ?? 0),
    longitude: Number(payload.longitude ?? 0),
    scheduledAt: payload.scheduledAt || new Date().toISOString(),
    amount: Number(payload.amount || 0),
  };

  const data = await apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(normalized),
  });

  return data.booking || data;
}

export async function updateBookingStatus(id, status) {
  const data = await apiRequest(`/bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  return data.booking || data;
}
