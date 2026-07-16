import { api } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { User } from '../types/user.types';
import { ApiResponse } from '../types/api.types';

export interface LoginResponseData {
  user: User;
}

export const login = async (credentials: Record<string, string>): Promise<ApiResponse<LoginResponseData>> => {
  const response = await api.post<ApiResponse<LoginResponseData>>(API_ENDPOINTS.auth.login, credentials);
  return response.data;
};

export const register = async (data: Record<string, any>): Promise<ApiResponse<LoginResponseData>> => {
  const response = await api.post<ApiResponse<LoginResponseData>>(API_ENDPOINTS.auth.register, data);
  return response.data;
};

export const logout = async (): Promise<ApiResponse<void>> => {
  const response = await api.post<ApiResponse<void>>(API_ENDPOINTS.auth.logout, {});
  return response.data;
};

/**
 * Fetch a CSRF token from the server and store it.
 */
export const fetchCsrfToken = async (): Promise<string | null> => {
  try {
    const response = await api.get<ApiResponse<{ csrfToken: string }>>('/auth/csrf-token');
    return response.data.data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};
