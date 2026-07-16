import { Request, Response, NextFunction } from 'express';
import * as robotLogService from '../services/robotLog.service';
import { extractPagination } from '../utils/pagination.utils';
import { StandardApiResponseDto } from '../dtos/common/api-response.dto';

export const getLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination = extractPagination(req);
    const { level } = req.query;
    const result = await robotLogService.getRobotLogs(req.params.robotId as string, pagination, level as string | undefined);
    res.json(StandardApiResponseDto.paginated(result.items, result.pagination));
  } catch (error) {
    next(error);
  }
};

export const createLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const log = await robotLogService.createRobotLog(req.body);
    res.status(201).json(StandardApiResponseDto.created(log));
  } catch (error) {
    next(error);
  }
};
