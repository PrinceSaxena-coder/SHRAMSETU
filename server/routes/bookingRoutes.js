import express from 'express';

import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createBooking);
router.get('/', authMiddleware, getAllBookings);
router.get('/:id', authMiddleware, getBookingById);
router.patch('/:id/status', authMiddleware, updateBookingStatus);

export default router;
