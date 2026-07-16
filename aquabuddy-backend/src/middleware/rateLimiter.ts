import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Rate limiter factory with consistent response format.
 * In production, swap `store` with a Redis-backed store (e.g. rate-limit-redis)
 * to support distributed deployments. The current in-memory default is safe
 * for single-instance development but MUST be replaced before production.
 */
const createLimiter = (windowMs: number, max: number, code: string, message: string) =>
  rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use X-Forwarded-For in production behind a reverse proxy
      return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
    },
  });

// ─── Global ──────────────────────────────────────────────────
export const globalRateLimiter = createLimiter(
  env.RATE_LIMIT_WINDOW_MS,
  env.RATE_LIMIT_MAX_REQUESTS,
  'RATE_LIMIT_EXCEEDED',
  'Too many requests, please try again later'
);

// ─── Auth: Login ─────────────────────────────────────────────
// 10 requests per IP per minute
export const loginRateLimiter = createLimiter(
  60 * 1000,        // 1 minute window
  10,               // 10 attempts
  'LOGIN_RATE_LIMIT',
  'Too many login attempts, please try again later'
);

// ─── Auth: Registration ──────────────────────────────────────
// 5 requests per IP per hour
export const registrationRateLimiter = createLimiter(
  60 * 60 * 1000,   // 1 hour window
  5,                // 5 attempts
  'REGISTRATION_RATE_LIMIT',
  'Too many registration attempts, please try again later'
);

// ─── Auth: Password Reset ────────────────────────────────────
// 5 requests per IP per hour
export const passwordResetRateLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  'PASSWORD_RESET_RATE_LIMIT',
  'Too many password reset requests, please try again later'
);

// ─── Auth: Email Verification ────────────────────────────────
// 5 requests per IP per hour
export const emailVerificationRateLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  'EMAIL_VERIFICATION_RATE_LIMIT',
  'Too many verification requests, please try again later'
);

// ─── Robot: Activation Code Validation ───────────────────────
// 10 requests per IP per hour
export const activationRateLimiter = createLimiter(
  60 * 60 * 1000,
  10,
  'ACTIVATION_RATE_LIMIT',
  'Too many activation attempts, please try again later'
);

// ─── Feedback ────────────────────────────────────────────────
// 20 requests per IP per hour
export const feedbackRateLimiter = createLimiter(
  60 * 60 * 1000,
  20,
  'FEEDBACK_RATE_LIMIT',
  'Too many feedback submissions, please try again later'
);

// ─── Robot Commands ──────────────────────────────────────────
// 100 requests per IP per minute
export const commandRateLimiter = createLimiter(
  60 * 1000,
  100,
  'COMMAND_RATE_LIMIT',
  'Too many robot commands, please slow down'
);

// ─── Sensor Data Ingestion ───────────────────────────────────
// 120 readings per device per minute
export const sensorRateLimiter = createLimiter(
  60 * 1000,
  120,
  'SENSOR_RATE_LIMIT',
  'Too many sensor readings, please reduce frequency'
);

/** @deprecated Use specific limiters instead. Kept for backward compatibility. */
export const authRateLimiter = loginRateLimiter;
