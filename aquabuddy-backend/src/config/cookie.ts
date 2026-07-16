import { CookieOptions } from 'express';
import { env } from './env';
import { parseExpiryToMs } from '../utils/jwt.utils';

/**
 * Centralized cookie configuration for authentication tokens.
 * Uses httpOnly cookies to prevent XSS token theft.
 */

const isProduction = env.NODE_ENV === 'production';

/** Shared base options for all auth cookies */
const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction || env.COOKIE_SECURE,
  sameSite: isProduction ? 'strict' : 'lax',
  domain: isProduction ? env.COOKIE_DOMAIN : undefined,
  path: '/',
};

/** Cookie config for access token */
export const accessTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: parseExpiryToMs(env.JWT_EXPIRES_IN),
};

/** Cookie config for refresh token — restricted to auth endpoints only */
export const refreshTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: parseExpiryToMs(env.JWT_REFRESH_EXPIRES_IN),
  path: '/api/v1/auth',  // Restrict refresh cookie to auth routes only
};

/** Cookie names — centralized to prevent typos */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'aqb_access_token',
  REFRESH_TOKEN: 'aqb_refresh_token',
} as const;

/** Options for clearing cookies (on logout) */
export const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction || env.COOKIE_SECURE,
  sameSite: isProduction ? 'strict' : 'lax',
  domain: isProduction ? env.COOKIE_DOMAIN : undefined,
  path: '/',
};

export const clearRefreshCookieOptions: CookieOptions = {
  ...clearCookieOptions,
  path: '/api/v1/auth',
};
