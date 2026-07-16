import { api } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { User } from '../types/user.types';
import { ApiResponse } from '../types/api.types';

export const getProfile = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>(API_ENDPOINTS.users.profile);
  return response.data;
};

export const updateProfile = async (data: Record<string, any>): Promise<ApiResponse<User>> => {
  const response = await api.put<ApiResponse<User>>(API_ENDPOINTS.users.updateProfile, data);
  return response.data;
};
