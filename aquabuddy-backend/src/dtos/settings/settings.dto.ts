export interface UpdateUserSettingsDto {
  preferences?: Record<string, any>;
  notifications?: Record<string, any>;
  privacy?: Record<string, any>;
}

export interface UserSettingsResponseDto {
  userId: string;
  preferences: Record<string, any>;
  notifications: Record<string, any>;
  privacy: Record<string, any>;
  updatedAt: string;
}

export interface UpdatePlatformSettingDto {
  value: any;
  type?: string;
  description?: string;
  isPublic?: boolean;
}

export interface PlatformSettingResponseDto {
  key: string;
  value: any;
  type: string;
  description?: string | null;
  isPublic: boolean;
  updatedAt: string;
}

export function toUserSettingsResponse(s: any): UserSettingsResponseDto {
  return {
    userId: s.userId,
    preferences: s.preferences || {},
    notifications: s.notifications || {},
    privacy: s.privacy || {},
    updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
  };
}

export function toPlatformSettingResponse(s: any): PlatformSettingResponseDto {
  return {
    key: s.key,
    value: s.value,
    type: s.type,
    description: s.description,
    isPublic: s.isPublic,
    updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
  };
}
