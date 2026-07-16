import cors from 'cors';
import { env } from '../config/env';

/**
 * Build CORS origins from environment configuration.
 * Falls back to FRONTEND_URL + localhost variants in development.
 */
const buildOrigins = (): string[] => {
  const origins: Set<string> = new Set();

  // Always include the primary frontend URL
  origins.add(env.FRONTEND_URL);

  // Parse comma-separated ALLOWED_ORIGINS
  if (env.ALLOWED_ORIGINS) {
    env.ALLOWED_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean)
      .forEach((o) => origins.add(o));
  }

  // In development, add common localhost variants
  if (env.NODE_ENV === 'development') {
    origins.add('http://localhost:3000');
    origins.add('http://localhost:3001');
    origins.add('http://localhost:3002');
  }

  return Array.from(origins);
};

export const getAllowedOrigins = buildOrigins();

export const corsMiddleware = cors({
  origin: getAllowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-CSRF-Token'],
  credentials: true,
  maxAge: 86400, // 24 hours
});
