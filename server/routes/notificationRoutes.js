import express from 'express';

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.get('/unread-count', authMiddleware, getUnreadNotificationCount);
router.patch('/:id/read', authMiddleware, markNotificationAsRead);
router.patch('/read-all', authMiddleware, markAllNotificationsAsRead);

export default router;
