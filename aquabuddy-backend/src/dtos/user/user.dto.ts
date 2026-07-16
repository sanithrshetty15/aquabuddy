export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  city?: string;
  timezone?: string;
  theme?: string;
  language?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  timezone: string;
  theme: string;
  language: string;
  role: string;
  status: string;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}
