import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/error.utils';
import { logger } from '../utils/logger.utils';

/**
 * API Key authentication middleware for IoT device endpoints.
 * Validates the X-API-Key header against the configured IOT_API_KEY.
 *
 * For production with multiple devices, this should be extended to
 * validate per-device keys from the database. The current implementation
 * uses a single shared key suitable for initial deployment.
 */
export const iotApiKeyAuth = (req: Request, _res: Response, next: NextFunction): void => {
  // Skip in development if no API key is configured
  if (env.NODE_ENV === 'development' && !env.IOT_API_KEY) {
    logger.debug('IoT API key auth skipped (development mode, no key configured)');
    return next();
  }

  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return next(new UnauthorizedError('API key required for IoT endpoints'));
  }

  if (!env.IOT_API_KEY) {
    logger.error('IOT_API_KEY not configured but IoT endpoint was accessed');
    return next(new UnauthorizedError('IoT authentication not configured'));
  }

  // Constant-time comparison to prevent timing attacks
  const keyBuffer = Buffer.from(apiKey);
  const expectedBuffer = Buffer.from(env.IOT_API_KEY);

  if (keyBuffer.length !== expectedBuffer.length) {
    logger.warn('IoT API key authentication failed: invalid key length', { ip: req.ip });
    return next(new UnauthorizedError('Invalid API key'));
  }

  const isValid = require('crypto').timingSafeEqual(keyBuffer, expectedBuffer);

  if (!isValid) {
    logger.warn('IoT API key authentication failed: invalid key', { ip: req.ip });
    return next(new UnauthorizedError('Invalid API key'));
  }

  next();
};
