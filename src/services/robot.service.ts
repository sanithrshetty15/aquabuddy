import { api } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { Robot, PurchaseRequest, RobotStatus } from '../types/robot.types';
import { ApiResponse } from '../types/api.types';

// User & Admin Robot Calls
export const getRobots = async (params?: any): Promise<ApiResponse<any>> => {
  const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.robots.list, { params });
  return response.data;
};

export const getRobotDetails = async (id: string): Promise<ApiResponse<Robot>> => {
  const response = await api.get<ApiResponse<Robot>>(API_ENDPOINTS.robots.details(id));
  return response.data;
};

export const linkRobot = async (code: string, name?: string): Promise<ApiResponse<Robot>> => {
  const response = await api.post<ApiResponse<Robot>>(API_ENDPOINTS.robots.link, { code, name });
  return response.data;
};

// Admin-only Robot Calls
export const createRobot = async (data: {
  code: string;
  name: string;
  model: string;
  lat: number;
  lng: number;
}): Promise<ApiResponse<Robot>> => {
  const response = await api.post<ApiResponse<Robot>>(API_ENDPOINTS.robots.create, data);
  return response.data;
};

export const updateRobotStatus = async (id: string, status: RobotStatus): Promise<ApiResponse<Robot>> => {
  const response = await api.patch<ApiResponse<Robot>>(API_ENDPOINTS.robots.updateStatus(id), { status });
  return response.data;
};

export const sendRobotCommand = async (id: string, command: string): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.robots.command(id), { command });
  return response.data;
};



