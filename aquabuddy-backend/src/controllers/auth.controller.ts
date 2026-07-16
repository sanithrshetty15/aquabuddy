import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, refreshUserToken, logoutUser } from '../services/auth.service';
import { createAuditLog } from '../services/audit.service';
import { loginAttemptTracker } from '../services/loginAttempt.service';
import { generateCsrfToken } from '../middleware/csrf';
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
  clearRefreshCookieOptions,
  COOKIE_NAMES,
} from '../config/cookie';
import { HTTP_STATUS } from '../constants/httpStatus';
import { MESSAGES } from '../constants/messages';
import { ValidationError, UnauthorizedError } from '../utils/error.utils';

/**
 * Helper to set auth cookies on the response.
 * Both access and refresh tokens are httpOnly — never exposed to JS.
 */
const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, accessTokenCookieOptions);
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, refreshTokenCookieOptions);
};

/**
 * Helper to clear auth cookies on the response.
 */
const clearAuthCookies = (res: Response): void => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, clearCookieOptions);
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, clearRefreshCookieOptions);
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registerUser(req.body);
    await createAuditLog(result.user.id, 'USER_REGISTER', req.ip, req.headers['user-agent'] as string, 'User registered successfully');

    // Set httpOnly auth cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MESSAGES.AUTH.REGISTER_SUCCESS,
      data: {
        user: result.user,
        // Tokens are in httpOnly cookies — not exposed in response body
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check if account is locked out due to too many failed attempts
    // Never reveal lock status — always return generic error
    const lockoutStatus = loginAttemptTracker.isLockedOut(email);
    if (lockoutStatus.locked) {
      await createAuditLog(null, 'LOGIN_BLOCKED', req.ip, req.headers['user-agent'] as string, `Login blocked — account locked for ${email}`);
      throw new UnauthorizedError('Incorrect email or password.');
    }

    // Apply progressive delay before authenticating
    const delayMs = loginAttemptTracker.getProgressiveDelay(email);
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    let result;
    try {
      result = await loginUser({ email, password });
    } catch (error) {
      // Record failed attempt on authentication failure
      const isLocked = loginAttemptTracker.recordFailedAttempt(email);
      const remaining = loginAttemptTracker.getRemainingAttempts(email);

      await createAuditLog(null, 'LOGIN_FAILED', req.ip, req.headers['user-agent'] as string, `Failed login attempt for ${email}. ${remaining} attempts remaining.`);

      // Never reveal lock status — always return generic error
      if (isLocked) {
        throw new UnauthorizedError('Incorrect email or password.');
      }

      throw error;
    }

    // Clear failed attempts on successful login
    loginAttemptTracker.clearAttempts(email);

    await createAuditLog(result.user.id, 'USER_LOGIN', req.ip, req.headers['user-agent'] as string, 'User logged in successfully');

    // Set httpOnly auth cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      data: {
        user: result.user,
        // Tokens are in httpOnly cookies — not exposed in response body
      },
    });
  } catch (error) {
    next(error);
  }
};


export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Read refresh token from httpOnly cookie first, then fall back to body
    const refreshToken = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] || req.body?.refreshToken;
    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    const result = await refreshUserToken(refreshToken);

    // Set new httpOnly cookies with rotated tokens
    setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.AUTH.TOKEN_REFRESHED,
      data: {
        // Tokens are in httpOnly cookies — not exposed in response body
      },
    });
  } catch (error) {
    // Clear cookies on refresh failure — force re-login
    clearAuthCookies(res);
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Read refresh token from httpOnly cookie first, then fall back to body
    const refreshToken = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] || req.body?.refreshToken;
    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    const userId = req.user?.userId || null;
    await createAuditLog(userId, 'USER_LOGOUT', req.ip, req.headers['user-agent'] as string, 'User logged out');

    // Clear all auth cookies
    clearAuthCookies(res);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.AUTH.LOGOUT_SUCCESS,
    });
  } catch (error) {
    // Always clear cookies even if logout processing fails
    clearAuthCookies(res);
    next(error);
  }
};

/**
 * GET /auth/csrf-token
 * Returns a CSRF token for the current session.
 * The client must include this token in X-CSRF-Token header for state-changing requests.
 */
export const getCsrfToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.user?.userId || req.ip || 'anonymous';
    const token = generateCsrfToken(sessionId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { csrfToken: token },
    });
  } catch (error) {
    next(error);
  }
};
