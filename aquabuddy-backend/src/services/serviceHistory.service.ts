import { serviceHistoryRepository } from '../repositories';
import { NotFoundError } from '../utils/error.utils';
import { PaginationParams, buildPaginatedResponse } from '../utils/pagination.utils';

export const getServiceHistory = async (robotId: string, pagination: PaginationParams) => {
  const where = { robotId };
  const [items, total] = await Promise.all([
    serviceHistoryRepository.findMany(where, {
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      skip: pagination.skip,
      take: pagination.limit,
      include: { technician: { select: { id: true, firstName: true, lastName: true } } },
    }),
    serviceHistoryRepository.count(where),
  ]);

  return buildPaginatedResponse(items, total, pagination);
};

export const createServiceRecord = async (data: any) => {
  return serviceHistoryRepository.create(data);
};

export const updateServiceRecord = async (id: string, data: any) => {
  const existing = await serviceHistoryRepository.findById(id);
  if (!existing) throw new NotFoundError('Service record not found');
  return serviceHistoryRepository.update(id, data);
};

export const getUpcomingServices = async (limit: number = 10) => {
  return serviceHistoryRepository.getUpcomingServices(limit);
};

export const deleteServiceRecord = async (id: string) => {
  const existing = await serviceHistoryRepository.findById(id);
  if (!existing) throw new NotFoundError('Service record not found');
  return serviceHistoryRepository.softDelete(id);
};
