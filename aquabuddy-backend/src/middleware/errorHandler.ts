import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/error.utils';
import { logger } from '../utils/logger.utils';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = (req as any).requestId || uuidv4();

  // Log the error
  if (err instanceof AppError && err.isOperational) {
    logger.warn(`Operational error: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
      requestId,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error(`Unexpected error: ${err.message}`, {
      stack: err.stack,
      requestId,
      path: req.path,
      method: req.method,
    });
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    const response: any = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    if (err instanceof ValidationError && err.details.length > 0) {
      response.error.details = err.details;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production'
        ? 'An internal server error occurred'
        : err.message,
      timestamp: new Date().toISOString(),
      requestId,
    },
  });
};
