import prisma from '../config/database';
import { NotFoundError } from '../utils/error.utils';
import { AlertStatus, AlertSeverity } from '@prisma/client';
import { PaginationParams, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.utils';

export interface AlertListQuery {
  robotId?: string;
  status?: string;
  severity?: string;
  search?: string;
  pagination: PaginationParams;
}

/**
 * Fetch alerts based on filters with pagination
 */
export const getAlerts = async (query: AlertListQuery): Promise<PaginatedResponse<any>> => {
  const { robotId, status, severity, search, pagination } = query;
  const where: any = {};

  if (robotId) where.robotId = robotId;
  if (status) where.status = status as AlertStatus;
  if (severity) where.severity = severity as AlertSeverity;

  if (search) {
    where.OR = [
      { message: { contains: search, mode: 'insensitive' } },
      { robot: { name: { contains: search, mode: 'insensitive' } } },
      { robot: { code: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.alert.findMany({
      where,
      include: {
        robot: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.alert.count({ where }),
  ]);

  return buildPaginatedResponse(items, total, pagination);
};

/**
 * Acknowledge an alert (changing status to ACKNOWLEDGED)
 */
export const acknowledgeAlert = async (id: string) => {
  const alert = await prisma.alert.findUnique({ where: { id } });
  if (!alert) {
    throw new NotFoundError(`Alert with ID ${id} not found`);
  }

  return prisma.alert.update({
    where: { id },
    data: { status: 'ACKNOWLEDGED' },
  });
};

/**
 * Resolve an alert (changing status to RESOLVED)
 */
export const resolveAlert = async (id: string) => {
  const alert = await prisma.alert.findUnique({ where: { id } });
  if (!alert) {
    throw new NotFoundError(`Alert with ID ${id} not found`);
  }

  return prisma.alert.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      resolvedAt: new Date(),
    },
  });
};
