import { Request, Response, NextFunction } from 'express';
import * as serviceHistoryService from '../services/serviceHistory.service';
import { extractPagination } from '../utils/pagination.utils';
import { StandardApiResponseDto } from '../dtos/common/api-response.dto';

export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination = extractPagination(req);
    const result = await serviceHistoryService.getServiceHistory(req.params.robotId as string, pagination);
    res.json(StandardApiResponseDto.paginated(result.items, result.pagination));
  } catch (error) {
    next(error);
  }
};

export const createRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await serviceHistoryService.createServiceRecord(req.body);
    res.status(201).json(StandardApiResponseDto.created(record));
  } catch (error) {
    next(error);
  }
};

export const updateRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await serviceHistoryService.updateServiceRecord(req.params.id as string, req.body);
    res.json(StandardApiResponseDto.ok(record));
  } catch (error) {
    next(error);
  }
};

export const deleteRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await serviceHistoryService.deleteServiceRecord(req.params.id as string);
    res.json(StandardApiResponseDto.ok(null, 'Service record deleted'));
  } catch (error) {
    next(error);
  }
};

export const getUpcoming = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await serviceHistoryService.getUpcomingServices();
    res.json(StandardApiResponseDto.ok(services));
  } catch (error) {
    next(error);
  }
};
