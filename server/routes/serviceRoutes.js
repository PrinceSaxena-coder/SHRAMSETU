import express from 'express';

import {
  getAllServices,
  getServiceById,
} from '../controllers/serviceController.js';

const router = express.Router();

// GET /api/services
router.get('/', getAllServices);

// GET /api/services/:serviceId
router.get('/:serviceId', getServiceById);

export default router;
