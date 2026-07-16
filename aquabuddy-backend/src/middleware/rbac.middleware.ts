import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/error.utils';
import { UserRole } from '../constants/roles';
import { Permission, hasPermission } from '../constants/permissions';

/**
 * Role-based access control middleware.
 * Checks if the authenticated user has the required role(s).
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(new ForbiddenError('Insufficient role permissions'));
    }

    next();
  };
};

/**
 * Permission-based access control middleware.
 * Checks if the authenticated user's role has the required permission(s).
 */
export const requirePermission = (...permissions: Permission[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRole = req.user.role as UserRole;
    const hasAllPermissions = permissions.every((perm) => hasPermission(userRole, perm));

    if (!hasAllPermissions) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

/** Convenience: Admin-only middleware */
export const adminOnly = requireRole(UserRole.ADMIN, UserRole.OWNER);

/** Convenience: Owner-only middleware */
export const ownerOnly = requireRole(UserRole.OWNER);
