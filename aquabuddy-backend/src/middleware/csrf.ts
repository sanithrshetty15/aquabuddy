import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';
import { ForbiddenError } from '../utils/error.utils';

/**
 * CSRF protection middleware using the Synchronizer Token Pattern.
 *
 * How it works:
 * 1. Client calls GET /api/v1/auth/csrf-token to get a CSRF token
 * 2. Server generates token = HMAC(sessionIdentifier + timestamp, CSRF_SECRET)
 * 3. Client includes token in X-CSRF-Token header on state-changing requests
 * 4. Server validates the token on POST/PUT/DELETE/PATCH requests
 *
 * Safe methods (GET, HEAD, OPTIONS) are exempt.
 */

const CSRF_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate a CSRF token tied to a session identifier.
 */
export const generateCsrfToken = (sessionId: string): string => {
  const timestamp = Date.now().toString(36);
  const payload = `${sessionId}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', env.CSRF_SECRET)
    .update(payload)
    .digest('hex');
  return `${payload}:${signature}`;
};

/**
 * Validate a CSRF token.
 */
const validateCsrfToken = (token: string, sessionId: string): boolean => {
  const parts = token.split(':');
  if (parts.length !== 3) return false;

  const [tokenSessionId, timestamp, signature] = parts;

  // Verify the session ID matches
  if (tokenSessionId !== sessionId) return false;

  // Verify the token hasn't expired
  const tokenTime = parseInt(timestamp, 36);
  if (isNaN(tokenTime) || Date.now() - tokenTime > CSRF_TOKEN_EXPIRY_MS) {
    return false;
  }

  // Verify the signature
  const expectedPayload = `${tokenSessionId}:${timestamp}`;
  const expectedSignature = crypto
    .createHmac('sha256', env.CSRF_SECRET)
    .update(expectedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

/**
 * CSRF validation middleware.
 * Only validates on state-changing HTTP methods.
 * Skips validation for IoT endpoints (device-to-server, no browser).
 */
export const csrfProtection = (req: Request, _res: Response, next: NextFunction): void => {
  // Safe methods don't need CSRF protection
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Skip CSRF for IoT endpoints (authenticated via API key, not cookies)
  if (req.path.includes('/iot/')) {
    return next();
  }

  // Skip CSRF for auth endpoints that don't use cookies yet (login, register)
  // These endpoints establish the session, so CSRF isn't applicable
  if (req.path.includes('/auth/login') || req.path.includes('/auth/register')) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  if (!csrfToken) {
    return next(new ForbiddenError('CSRF token missing'));
  }

  // Use userId from JWT as session identifier, or IP as fallback
  const sessionId = req.user?.userId || req.ip || 'anonymous';

  if (!validateCsrfToken(csrfToken, sessionId)) {
    return next(new ForbiddenError('Invalid or expired CSRF token'));
  }

  next();
};
