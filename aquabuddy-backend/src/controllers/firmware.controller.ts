import { Request, Response, NextFunction } from 'express';
import * as firmwareService from '../services/firmware.service';
import { extractPagination } from '../utils/pagination.utils';
import { toFirmwareResponse, toDeploymentResponse } from '../dtos';
import { StandardApiResponseDto } from '../dtos/common/api-response.dto';

export const listFirmware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination = extractPagination(req);
    const robotModel = req.query.robotModel as string | undefined;
    const result = await firmwareService.getFirmwareList(pagination, robotModel);
    res.json(StandardApiResponseDto.paginated(result.items, result.pagination));
  } catch (error) {
    next(error);
  }
};

export const getFirmware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firmware = await firmwareService.getFirmwareById(req.params.id as string);
    res.json(StandardApiResponseDto.ok(toFirmwareResponse(firmware)));
  } catch (error) {
    next(error);
  }
};

export const createFirmware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firmware = await firmwareService.createFirmware(req.body);
    res.status(201).json(StandardApiResponseDto.created(toFirmwareResponse(firmware)));
  } catch (error) {
    next(error);
  }
};

export const getRobotDeployments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deployments = await firmwareService.getDeploymentsByRobot(req.params.robotId as string);
    res.json(StandardApiResponseDto.ok(deployments.map(toDeploymentResponse)));
  } catch (error) {
    next(error);
  }
};

export const deployFirmware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { robotId, firmwareId } = req.body as { robotId: string; firmwareId: string };
    const deployment = await firmwareService.deployFirmware(robotId, firmwareId);
    res.status(201).json(StandardApiResponseDto.created(toDeploymentResponse(deployment)));
  } catch (error) {
    next(error);
  }
};

export const updateDeployment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, errorMessage } = req.body as { status: string; errorMessage?: string };
    const deployment = await firmwareService.updateDeploymentStatus(req.params.id as string, status, errorMessage);
    res.json(StandardApiResponseDto.ok(toDeploymentResponse(deployment)));
  } catch (error) {
    next(error);
  }
};

export const getLatestForModel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firmware = await firmwareService.getLatestFirmware(req.params.robotModel as string);
    res.json(StandardApiResponseDto.ok(toFirmwareResponse(firmware)));
  } catch (error) {
    next(error);
  }
};
