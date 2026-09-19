import dotenv from 'dotenv';

// Load environment variables from a .env file if it exists.
dotenv.config();

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

export const config = {
  port: Number(process.env.PORT) || 5000,
  frontendUrl: process.env.FRONTEND_URL || defaultAllowedOrigins,
  allowedOrigins: (process.env.ALLOWED_ORIGINS || defaultAllowedOrigins.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
