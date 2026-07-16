import { revenueRepository } from '../repositories';
import { PaginationParams, buildPaginatedResponse } from '../utils/pagination.utils';

export const getRevenueList = async (pagination: PaginationParams, dateFrom?: string, dateTo?: string) => {
  const where: any = {};
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  const [items, total] = await Promise.all([
    revenueRepository.findMany(where, {
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    revenueRepository.count(where),
  ]);

  return buildPaginatedResponse(items, total, pagination);
};

export const getRevenueSummary = async () => {
  return revenueRepository.getSummary();
};

export const createRevenueRecord = async (data: any) => {
  return revenueRepository.create(data);
};
