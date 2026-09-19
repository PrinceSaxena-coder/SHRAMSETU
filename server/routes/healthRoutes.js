import express from 'express';

const router = express.Router();

// Basic health-check endpoint for verifying the backend is running.
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShramSetu API is running',
  });
});

export default router;
