import { Request, Response, NextFunction } from 'express';

/**
 * Input sanitization middleware to prevent XSS attacks.
 * Strips dangerous HTML entities from all string values in request body,
 * query parameters, and URL params.
 *
 * This is a defense-in-depth layer — Zod validation should also reject
 * invalid inputs, but this catches anything that slips through.
 */

const DANGEROUS_PATTERNS: [RegExp, string][] = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&#x27;'],
  [/\//g, '&#x2F;'],
];

/**
 * Recursively sanitize all string values in an object.
 * Preserves object structure, arrays, numbers, booleans, and nulls.
 */
const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    let sanitized = value;
    for (const [pattern, replacement] of DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, replacement);
    }
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }

  return value;
};

/**
 * Middleware that sanitizes request body, query, and params.
 * Should be applied AFTER body parsing but BEFORE route handlers.
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  // Don't sanitize passwords — they can contain any characters
  const passwordFields = ['password', 'newPassword', 'currentPassword', 'confirmPassword'];

  if (req.body && typeof req.body === 'object') {
    const body = { ...req.body };
    for (const key of Object.keys(body)) {
      if (!passwordFields.includes(key)) {
        body[key] = sanitizeValue(body[key]);
      }
    }
    req.body = body;
  }

  if (req.query && typeof req.query === 'object') {
    const query: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(req.query)) {
      query[key] = sanitizeValue(value);
    }
    req.query = query as any;
  }

  if (req.params && typeof req.params === 'object') {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.params)) {
      params[key] = sanitizeValue(value) as string;
    }
    req.params = params;
  }

  next();
};
