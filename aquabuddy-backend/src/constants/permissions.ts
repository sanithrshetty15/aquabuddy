import { UserRole } from './roles';

export type Permission =
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'robots:read'
  | 'robots:write'
  | 'robots:delete'
  | 'robots:command'
  | 'sensors:read'
  | 'sensors:write'
  | 'analytics:read'
  | 'analytics:export'
  | 'alerts:read'
  | 'alerts:write'
  | 'admin:access'
  | 'admin:user-management'
  | 'admin:live-operations'
  | 'feedback:read'
  | 'feedback:write'
  | 'feedback:manage'
  | 'notifications:read'
  | 'notifications:write'
  | 'owner:access'
  | 'platform:config';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [
    'robots:read',
    'robots:write',
    'robots:command',
    'sensors:read',
    'analytics:read',
    'analytics:export',
    'alerts:read',
    'alerts:write',
    'feedback:read',
    'feedback:write',
    'notifications:read',
  ],
  [UserRole.ADMIN]: [
    'users:read',
    'users:write',
    'users:delete',
    'robots:read',
    'robots:write',
    'robots:delete',
    'robots:command',
    'sensors:read',
    'sensors:write',
    'analytics:read',
    'analytics:export',
    'alerts:read',
    'alerts:write',
    'admin:access',
    'admin:user-management',
    'admin:live-operations',
    'feedback:read',
    'feedback:write',
    'feedback:manage',
    'notifications:read',
    'notifications:write',
  ],
  [UserRole.OWNER]: [
    'users:read',
    'users:write',
    'users:delete',
    'robots:read',
    'robots:write',
    'robots:delete',
    'robots:command',
    'sensors:read',
    'sensors:write',
    'analytics:read',
    'analytics:export',
    'alerts:read',
    'alerts:write',
    'admin:access',
    'admin:user-management',
    'admin:live-operations',
    'feedback:read',
    'feedback:write',
    'feedback:manage',
    'notifications:read',
    'notifications:write',
    'owner:access',
    'platform:config',
  ],
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};
