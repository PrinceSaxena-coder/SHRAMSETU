import express from 'express';

import {
  createPaymentOrder,
  getPaymentById,
  handleWebhook,
  verifyPayment,
} from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/webhook', handleWebhook);
router.post('/create-order', authMiddleware, createPaymentOrder);
router.post('/verify', authMiddleware, verifyPayment);
router.get('/:id', authMiddleware, getPaymentById);

export default router;
