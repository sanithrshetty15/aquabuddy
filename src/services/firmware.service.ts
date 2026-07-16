import { api } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import {
  CreateFirmwareDto,
  DeployFirmwareDto,
  UpdateDeploymentDto,
  FirmwareRecord,
  FirmwareDeployment,
  FirmwareHistoryItem,
  PaginatedResponse,
  ApiResponse,
} from '../types/firmware.types';

export const getFirmwareList = async (params?: {
  page?: number;
  limit?: number;
  robotModel?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResponse<FirmwareRecord>> => {
  const response = await api.get<ApiResponse<PaginatedResponse<FirmwareRecord>>>(API_ENDPOINTS.firmware.list, { params });
  return response.data.data!;
};

export const getFirmwareById = async (id: string): Promise<FirmwareRecord> => {
  const response = await api.get<ApiResponse<FirmwareRecord>>(API_ENDPOINTS.firmware.get(id));
  return response.data.data!;
};

export const createFirmware = async (data: CreateFirmwareDto): Promise<FirmwareRecord> => {
  const response = await api.post<ApiResponse<FirmwareRecord>>(API_ENDPOINTS.firmware.create, data);
  return response.data.data!;
};

export const getLatestFirmwareForModel = async (model: string): Promise<FirmwareRecord> => {
  const response = await api.get<ApiResponse<FirmwareRecord>>(API_ENDPOINTS.firmware.latestForModel(model));
  return response.data.data!;
};

export const deployFirmware = async (data: DeployFirmwareDto): Promise<FirmwareDeployment> => {
  const response = await api.post<ApiResponse<FirmwareDeployment>>(API_ENDPOINTS.firmware.deploy, data);
  return response.data.data!;
};

export const getRobotDeployments = async (robotId: string): Promise<FirmwareDeployment[]> => {
  const response = await api.get<ApiResponse<FirmwareDeployment[]>>(API_ENDPOINTS.firmware.deployments(robotId));
  return response.data.data!;
};

export const updateDeploymentStatus = async (id: string, data: UpdateDeploymentDto): Promise<FirmwareDeployment> => {
  const response = await api.patch<ApiResponse<FirmwareDeployment>>(API_ENDPOINTS.firmware.updateDeployment(id), data);
  return response.data.data!;
};

export const uploadFirmwareFile = async (file: File, metadata: CreateFirmwareDto): Promise<FirmwareRecord> => {
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined) formData.append(key, String(value));
  });

  const response = await api.post<ApiResponse<FirmwareRecord>>(API_ENDPOINTS.firmware.upload, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data!;
};

export const transformToHistory = (deployments: FirmwareDeployment[]): FirmwareHistoryItem[] => {
  return deployments
    .filter(d => d.firmware)
    .map(d => ({
      version: d.firmware!.version,
      date: d.deployedAt || d.createdAt,
      notes: d.firmware!.changelog || 'No changelog available',
      status: d.status,
      devices: 1,
    }));
};