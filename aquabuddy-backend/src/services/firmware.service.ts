import { firmwareRepository } from '../repositories';
import { NotFoundError, ValidationError, ConflictError } from '../utils/error.utils';
import { PaginationParams, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.utils';

export const getFirmwareList = async (pagination: PaginationParams, robotModel?: string) => {
  const where: any = {};
  if (robotModel) where.robotModel = robotModel;

  const [items, total] = await Promise.all([
    firmwareRepository.findMany(where, {
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    firmwareRepository.count(where),
  ]);

  return buildPaginatedResponse(items, total, pagination);
};

export const getFirmwareById = async (id: string) => {
  const firmware = await firmwareRepository.findById(id);
  if (!firmware) throw new NotFoundError('Firmware not found');
  return firmware;
};

export const createFirmware = async (data: any) => {
  const existing = await firmwareRepository.findFirst({ version: data.version, robotModel: data.robotModel });
  if (existing) throw new ConflictError('Firmware version already exists for this model');
  return firmwareRepository.create(data);
};

export const getDeploymentsByRobot = async (robotId: string) => {
  return firmwareRepository.findDeploymentsByRobot(robotId);
};

export const deployFirmware = async (robotId: string, firmwareId: string) => {
  const firmware = await firmwareRepository.findById(firmwareId);
  if (!firmware) throw new NotFoundError('Firmware not found');

  const existingDeployment = await firmwareRepository.findFirst({
    robotId, firmwareId, deletedAt: null
  });
  if (existingDeployment) throw new ConflictError('Firmware already deployed to this robot');

  return firmwareRepository.createDeployment({ robotId, firmwareId });
};

export const updateDeploymentStatus = async (id: string, status: string, errorMessage?: string) => {
  const deployment = await firmwareRepository.findById(id);
  if (!deployment) throw new NotFoundError('Deployment not found');
  return firmwareRepository.updateDeploymentStatus(id, status, errorMessage);
};

export const getFirmwareByModel = async (robotModel: string) => {
  return firmwareRepository.findByModel(robotModel);
};

export const getLatestFirmware = async (robotModel: string) => {
  const fw = await firmwareRepository.getLatestByModel(robotModel);
  if (!fw) throw new NotFoundError('No firmware found for this model');
  return fw;
};
