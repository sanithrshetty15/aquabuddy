export interface CreateFirmwareDto {
  version: string;
  robotModel: string;
  fileUrl: string;
  fileSize: number;
  checksum: string;
  changelog?: string;
  minHardwareVersion?: string;
}

export interface DeployFirmwareDto {
  robotId: string;
  firmwareId: string;
}

export interface UpdateDeploymentDto {
  status: DeploymentStatus;
  errorMessage?: string;
}

export type DeploymentStatus = 'PENDING' | 'DOWNLOADING' | 'INSTALLING' | 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';

export interface FirmwareRecord {
  id: string;
  version: string;
  robotModel: string;
  fileUrl: string;
  fileSize: number;
  checksum: string;
  changelog?: string | null;
  status: string;
  minHardwareVersion?: string | null;
  uploadedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FirmwareDeployment {
  id: string;
  robotId: string;
  firmwareId: string;
  firmware?: FirmwareRecord;
  status: DeploymentStatus;
  errorMessage?: string | null;
  deployedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface FirmwareHistoryItem {
  version: string;
  date: string;
  notes: string;
  status: string;
  devices: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: PaginatedResponse<any>['pagination'];
}