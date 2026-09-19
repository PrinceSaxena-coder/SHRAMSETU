import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import healthRoutes from './routes/healthRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Create the Express app.
const app = express();

app.disable('x-powered-by');

// Basic security headers for the API.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = config.allowedOrigins || config.frontendUrl;

// Allow the frontend running on Vite to call this backend.
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Parse incoming JSON request bodies.
app.use(express.json());

// Add a simple rate limiter so the API is not abused.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Register API routes.
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/notifications', notificationRoutes);

// Handle unknown API routes.
app.use(notFoundHandler);

// Centralized error handling.
app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(config.port, () => {
      console.log(`ShramSetu backend running on http://localhost:${config.port}`);
    });

    const shutdown = (signal) => {
      console.log(`Received ${signal}, shutting down gracefully.`);
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server because MongoDB connection failed.');
    process.exit(1);
  }
}

startServer();
