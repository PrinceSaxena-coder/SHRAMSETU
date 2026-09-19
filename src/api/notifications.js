import { apiRequest } from './apiClient'

function normalizeNotification(notification) {
  const item = notification || {}
  const isRead = item.read ?? item.isRead ?? false

  return {
    id: item.id || item._id,
    type: item.type || 'GENERAL',
    title: item.title || 'Notification',
    text: item.message || item.text || item.title || 'Notification',
    message: item.message || item.text || item.title || 'Notification',
    read: Boolean(isRead),
    isRead: Boolean(isRead),
    createdAt: item.createdAt || item.created_at || null,
    time: item.time || item.createdAt || item.created_at || new Date().toISOString(),
  }
}

export async function getNotifications() {
  const response = await apiRequest('/notifications')
  const items = Array.isArray(response?.notifications) ? response.notifications : []
  return items.map(normalizeNotification)
}

export async function listNotifications() {
  return getNotifications()
}

export async function getUnreadNotificationCount() {
  const response = await apiRequest('/notifications/unread-count')
  return Number(response?.count || 0)
}

export async function markNotificationAsRead(id) {
  const response = await apiRequest(`/notifications/${id}/read`, {
    method: 'PATCH',
  })
  return normalizeNotification(response?.notification)
}

export async function markAllNotificationsAsRead() {
  const response = await apiRequest('/notifications/read-all', {
    method: 'PATCH',
  })

  const items = Array.isArray(response?.notifications) ? response.notifications : []
  return items.map(normalizeNotification)
}

export const markAllRead = markAllNotificationsAsRead
