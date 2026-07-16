import { Request, Response, NextFunction } from 'express';
import * as systemHealthService from '../services/systemHealth.service';
import { StandardApiResponseDto } from '../dtos/common/api-response.dto';

export const getHealth = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const health = await systemHealthService.getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(StandardApiResponseDto.ok(health));
  } catch (error) {
    next(error);
  }
};

export const getComponentHealth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const health = await systemHealthService.getComponentHealth(req.params.component as string);
    res.json(StandardApiResponseDto.ok(health));
  } catch (error) {
    next(error);
  }
};

export const getAllComponents = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const health = await systemHealthService.getRecentComponentHealth();
    res.json(StandardApiResponseDto.ok(health));
  } catch (error) {
    next(error);
  }
};
