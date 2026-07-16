import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { UnauthorizedError } from '../utils/error.utils';
import { JwtPayload } from '../types/auth.types';
import { COOKIE_NAMES } from '../config/cookie';
import { logger } from '../utils/logger.utils';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Extract the access token from the request.
 * Priority: httpOnly cookie > Authorization Bearer header
 *
 * Cookies are the primary mechanism (XSS-safe).
 * Bearer header is kept as fallback for API clients and IoT integrations.
 */
const extractToken = (req: Request): string | null => {
  // 1. Check httpOnly cookie first (browser clients)
  const cookieToken = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
  if (cookieToken) return cookieToken;

  // 2. Check Clerk session cookie if available
  const clerkCookie = req.cookies?.['__session'];
  if (clerkCookie) return clerkCookie;

  // 3. Fall back to Authorization header (API clients, mobile apps)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) return token;
  }

  return null;
};

/**
 * Conditional validation checking Clerk session or falling back to local JWT.
 */
const verifySessionToken = async (token: string): Promise<JwtPayload> => {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  
  if (clerkSecretKey) {
    try {
      const { createClerkClient } = require('@clerk/clerk-sdk-node');
      const clerk = createClerkClient({ secretKey: clerkSecretKey });
      const sessionClaims = await clerk.verifyToken(token);
      
      // Fetch metadata roles if set on Clerk user profile
      const role = (sessionClaims.metadata as any)?.role || 'USER';
      
      return {
        userId: sessionClaims.sub,
        email: (sessionClaims.email as string) || '',
        role,
      };
    } catch (clerkError: any) {
      logger.warn('Clerk session token verification failed. Trying local fallback...', { error: clerkError.message });
    }
  }

  // Fallback to local JWT verification
  return verifyAccessToken(token);
};

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const payload = await verifySessionToken(token);
    req.user = payload;
    next();
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};

/** Optional auth - attaches user if token present, continues either way */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    if (token) {
      req.user = await verifySessionToken(token);
    }
  } catch {
    // Token invalid but that's ok for optional auth
  }
  next();
};
