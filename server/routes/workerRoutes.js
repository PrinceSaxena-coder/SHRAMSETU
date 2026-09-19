import express from 'express';

import {
  getAllWorkers,
  getNearbyWorkers,
  getWorkerById,
} from '../controllers/workerController.js';

const router = express.Router();

// GET /api/workers
router.get('/', getAllWorkers);

// GET /api/workers/nearby
router.get('/nearby', getNearbyWorkers);

// GET /api/workers/:workerId
router.get('/:workerId', getWorkerById);

export default router;
