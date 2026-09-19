import Notification from '../models/Notification.js';

function sanitizeId(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }

  return value;
}

export async function createNotification({
  recipientId,
  recipientRole,
  type,
  title,
  message,
  bookingId = null,
  paymentId = null,
}) {
  if (!recipientId || !recipientRole || !type || !title || !message) {
    return null;
  }

  const normalizedRole = String(recipientRole).toLowerCase();
  const allowedRoles = ['customer', 'worker', 'admin'];

  if (!allowedRoles.includes(normalizedRole)) {
    return null;
  }

  const notification = await Notification.create({
    recipientId: sanitizeId(recipientId),
    recipientRole: normalizedRole,
    type: String(type).trim(),
    title: String(title).trim(),
    message: String(message).trim(),
    bookingId: sanitizeId(bookingId),
    paymentId: sanitizeId(paymentId),
    isRead: false,
  });

  return notification.toObject ? notification.toObject() : notification;
}

export async function createBookingNotification({
  recipientId,
  recipientRole,
  type,
  title,
  message,
  bookingId,
}) {
  return createNotification({
    recipientId,
    recipientRole,
    type,
    title,
    message,
    bookingId,
  });
}

export async function createPaymentNotification({
  customerId,
  bookingId,
  paymentId,
  title = 'Payment successful',
  message = 'Your payment has been successfully verified.',
}) {
  return createNotification({
    recipientId: customerId,
    recipientRole: 'customer',
    type: 'PAYMENT_SUCCESS',
    title,
    message,
    bookingId,
    paymentId,
  });
}
