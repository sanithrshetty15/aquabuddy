import { Request, Response, NextFunction } from 'express';
import * as revenueService from '../services/revenue.service';
import { extractPagination } from '../utils/pagination.utils';
import { toRevenueResponse } from '../dtos';
import { StandardApiResponseDto } from '../dtos/common/api-response.dto';

export const listRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination = extractPagination(req);
    const { dateFrom, dateTo } = req.query;
    const result = await revenueService.getRevenueList(pagination, dateFrom as string, dateTo as string);
    res.json(StandardApiResponseDto.paginated(result.items.map(toRevenueResponse), result.pagination));
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await revenueService.getRevenueSummary();
    res.json(StandardApiResponseDto.ok(summary));
  } catch (error) {
    next(error);
  }
};

export const createRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await revenueService.createRevenueRecord(req.body);
    res.status(201).json(StandardApiResponseDto.created(toRevenueResponse(record)));
  } catch (error) {
    next(error);
  }
};
