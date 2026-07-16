import { Socket } from 'socket.io';
import { verifyAccessToken } from '../../utils/jwt.utils';
import { logger } from '../../utils/logger.utils';
import { COOKIE_NAMES } from '../../config/cookie';

/**
 * Helper to parse cookie string from Socket.IO handshake headers.
 */
const parseCookies = (cookieString: string): Record<string, string> => {
  const cookies: Record<string, string> = {};
  if (!cookieString) return cookies;

  cookieString.split(';').forEach((item) => {
    const parts = item.split('=');
    const name = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    if (name) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
};

/**
 * Socket.IO middleware to verify JWT access tokens.
 * Supports httpOnly cookies (browser) as well as query/auth params (API clients).
 */
export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void): void => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    let token = socket.handshake.auth?.token || socket.handshake.query?.token;

    // Fall back to cookie token if no direct token parameter provided
    if (!token && cookieHeader) {
      const cookies = parseCookies(cookieHeader);
      token = cookies[COOKIE_NAMES.ACCESS_TOKEN];
    }

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const payload = verifyAccessToken(token as string);
    (socket as any).user = payload;
    next();
  } catch (err: any) {
    logger.warn('Socket authentication failed:', { error: err.message });
    next(new Error('Invalid or expired token'));
  }
};
