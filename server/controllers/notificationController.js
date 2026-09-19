import { getNotificationsForUser, countUnreadNotificationsForUser, markNotificationAsReadForUser, markAllNotificationsAsReadForUser } from '../repositories/notificationRepository.js';

export const getNotifications = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const unreadOnly = String(req.query.unread || '').toLowerCase() === 'true';

    const notifications = await getNotificationsForUser({
      userId: req.user.userId,
      role: req.user.role,
      unreadOnly,
    });

    return res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    return next(error);
  }
};

export const getUnreadNotificationCount = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const count = await countUnreadNotificationsForUser({
      userId: req.user.userId,
      role: req.user.role,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    return next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const { id } = req.params;
    const notification = await markNotificationAsReadForUser({
      notificationId: id,
      userId: req.user.userId,
      role: req.user.role,
    });

    if (!notification) {
      const error = new Error('Notification not found or unauthorized.');
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    return next(error);
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const result = await markAllNotificationsAsReadForUser({
      userId: req.user.userId,
      role: req.user.role,
    });

    return res.status(200).json({
      success: true,
      count: result.modifiedCount,
    });
  } catch (error) {
    return next(error);
  }
};
