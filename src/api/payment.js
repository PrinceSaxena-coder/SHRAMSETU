import { apiRequest } from './apiClient';

export async function createPaymentOrder(bookingId) {
  const data = await apiRequest('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({ bookingId }),
  });

  return data.order || data;
}

export async function verifyPayment(paymentData) {
  const data = await apiRequest('/payments/verify', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });

  return data;
}

export async function getPaymentById(paymentId) {
  const data = await apiRequest(`/payments/${paymentId}`);
  return data.payment || data;
}