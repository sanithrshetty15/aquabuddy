import { featureFlagRepository } from '../repositories';
import { NotFoundError, ConflictError } from '../utils/error.utils';
import { PaginationParams, buildPaginatedResponse } from '../utils/pagination.utils';

export const getAllFlags = async (pagination: PaginationParams) => {
  const where = {};
  const [items, total] = await Promise.all([
    featureFlagRepository.findMany(where, {
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    featureFlagRepository.count(where),
  ]);
  return buildPaginatedResponse(items, total, pagination);
};

export const getEnabledFlags = async () => {
  return featureFlagRepository.getEnabled();
};

export const getFlagByKey = async (key: string) => {
  const flag = await featureFlagRepository.findByKey(key);
  if (!flag) throw new NotFoundError(`Feature flag '${key}' not found`);
  return flag;
};

export const createFlag = async (data: { key: string; name: string; description?: string; enabled?: boolean; conditions?: any }) => {
  const existing = await featureFlagRepository.findByKey(data.key);
  if (existing) throw new ConflictError(`Feature flag '${data.key}' already exists`);
  return featureFlagRepository.create(data);
};

export const updateFlag = async (key: string, data: any) => {
  await getFlagByKey(key);
  return featureFlagRepository.updateByKey(key, data);
};

export const toggleFlag = async (key: string, enabled: boolean) => {
  await getFlagByKey(key);
  return featureFlagRepository.toggle(key, enabled);
};

export const deleteFlag = async (key: string) => {
  const flag = await getFlagByKey(key);
  return featureFlagRepository.softDelete(flag.id);
};
