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

export interface FirmwareResponseDto {
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

export interface FirmwareDeploymentResponseDto {
  id: string;
  robotId: string;
  firmwareId: string;
  firmware?: FirmwareResponseDto;
  status: string;
  errorMessage?: string | null;
  deployedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export function toFirmwareResponse(fw: any): FirmwareResponseDto {
  return {
    id: fw.id,
    version: fw.version,
    robotModel: fw.robotModel,
    fileUrl: fw.fileUrl,
    fileSize: fw.fileSize,
    checksum: fw.checksum,
    changelog: fw.changelog,
    status: fw.status,
    minHardwareVersion: fw.minHardwareVersion,
    uploadedBy: fw.uploadedBy,
    createdAt: fw.createdAt instanceof Date ? fw.createdAt.toISOString() : fw.createdAt,
    updatedAt: fw.updatedAt instanceof Date ? fw.updatedAt.toISOString() : fw.updatedAt,
  };
}

export function toDeploymentResponse(d: any): FirmwareDeploymentResponseDto {
  return {
    id: d.id,
    robotId: d.robotId,
    firmwareId: d.firmwareId,
    firmware: d.firmware ? toFirmwareResponse(d.firmware) : undefined,
    status: d.status,
    errorMessage: d.errorMessage,
    deployedAt: d.deployedAt?.toISOString?.() || null,
    completedAt: d.completedAt?.toISOString?.() || null,
    createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
  };
}
