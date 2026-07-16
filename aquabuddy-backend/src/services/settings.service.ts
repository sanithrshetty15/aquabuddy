import { userSettingRepository, platformSettingRepository } from '../repositories';
import { NotFoundError } from '../utils/error.utils';

export const getUserSettings = async (userId: string) => {
  const settings = await userSettingRepository.findByUserId(userId);
  if (!settings) {
    return userSettingRepository.create({ userId, preferences: {}, notifications: {}, privacy: {} });
  }
  return settings;
};

export const updateUserSettings = async (userId: string, data: any) => {
  return userSettingRepository.upsert(userId, data);
};

export const getPlatformSetting = async (key: string) => {
  const setting = await platformSettingRepository.findByKey(key);
  if (!setting) throw new NotFoundError(`Platform setting '${key}' not found`);
  return setting;
};

export const getAllPlatformSettings = async (includePrivate: boolean = false) => {
  if (includePrivate) {
    return platformSettingRepository.findMany({});
  }
  return platformSettingRepository.getPublic();
};

export const updatePlatformSetting = async (key: string, data: any) => {
  return platformSettingRepository.upsertByKey(key, data);
};

export const createPlatformSetting = async (data: { key: string; value: any; type?: string; description?: string; isPublic?: boolean }) => {
  return platformSettingRepository.create(data);
};

export const deletePlatformSetting = async (key: string) => {
  const setting = await platformSettingRepository.findByKey(key);
  if (!setting) throw new NotFoundError(`Platform setting '${key}' not found`);
  return platformSettingRepository.softDelete(setting.id);
};
