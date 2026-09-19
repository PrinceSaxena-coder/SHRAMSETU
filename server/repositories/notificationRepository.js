import mongoose from 'mongoose';

import Notification from '../models/Notification.js';

const toApiShape = (notification) => {
  if (!notification) {
    return null;
  }

  return {
    id: String(notification._id),
    recipientId: notification.recipientId ? String(notification.recipientId) : null,
    recipientRole: notification.recipientRole,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    bookingId: notification.bookingId ? String(notification.bookingId) : null,
    paymentId: notification.paymentId ? String(notification.paymentId) : null,
    read: Boolean(notification.isRead),
    isRead: Boolean(notification.isRead),
    createdAt: notification.createdAt ? new Date(notification.createdAt).toISOString() : null,
    time: notification.createdAt ? new Date(notification.createdAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) : null,
  };
};

export async function getNotificationsForUser({ userId, role, unreadOnly = false }) {
  const query = {
    recipientId: new mongoose.Types.ObjectId(userId),
    recipientRole: role,
  };

  if (unreadOnly) {
    query.isRead = false;
  }

  const notifications = await Notification.find(query).sort({ createdAt: -1 }).lean();

  return notifications.map(toApiShape);
}

export async function countUnreadNotificationsForUser({ userId, role }) {
  return Notification.countDocuments({
    recipientId: new mongoose.Types.ObjectId(userId),
    recipientRole: role,
    isRead: false,
  });
}

export async function getNotificationForUser({ notificationId, userId, role }) {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    return null;
  }

  return Notification.findOne({
    _id: new mongoose.Types.ObjectId(notificationId),
    recipientId: new mongoose.Types.ObjectId(userId),
    recipientRole: role,
  }).lean();
}

export async function markNotificationAsReadForUser({ notificationId, userId, role }) {
  const notification = await getNotificationForUser({ notificationId, userId, role });

  if (!notification) {
    return null;
  }

  const updated = await Notification.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(notificationId),
      recipientId: new mongoose.Types.ObjectId(userId),
      recipientRole: role,
    },
    { $set: { isRead: true } },
    { new: true }
  ).lean();

  return toApiShape(updated);
}

export async function markAllNotificationsAsReadForUser({ userId, role }) {
  const result = await Notification.updateMany(
    {
      recipientId: new mongoose.Types.ObjectId(userId),
      recipientRole: role,
      isRead: false,
    },
    { $set: { isRead: true } }
  );

  return {
    matchedCount: result?.matchedCount || 0,
    modifiedCount: result?.modifiedCount || 0,
  };
}
