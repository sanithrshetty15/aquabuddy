import { robotLogRepository } from '../repositories';
import { NotFoundError } from '../utils/error.utils';
import { PaginationParams, buildPaginatedResponse } from '../utils/pagination.utils';

export const getRobotLogs = async (robotId: string, pagination: PaginationParams, level?: string) => {
  const where: any = { robotId };
  if (level) where.level = level;

  const [items, total] = await Promise.all([
    robotLogRepository.findMany(where, {
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    robotLogRepository.count(where),
  ]);

  return buildPaginatedResponse(items, total, pagination);
};

export const createRobotLog = async (data: { robotId: string; level: string; message: string; source?: string; meta?: string }) => {
  return robotLogRepository.createLog(data);
};

export const getLogsByLevel = async (level: string, limit: number = 50) => {
  return robotLogRepository.findByLevel(level, limit);
};
