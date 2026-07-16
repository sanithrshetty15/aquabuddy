import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class UserSettingRepository extends BaseRepository<any, any> {
  protected delegate = prisma.userSetting as any;
  protected modelName = 'UserSetting';

  async findByUserId(userId: string) {
    return prisma.userSetting.findFirst({ where: { userId, deletedAt: null } });
  }

  async upsert(userId: string, data: any) {
    const existing = await this.findByUserId(userId);
    if (existing) {
      return prisma.userSetting.update({ where: { userId }, data });
    }
    return prisma.userSetting.create({ data: { userId, ...data } });
  }
}

export class PlatformSettingRepository extends BaseRepository<any, any> {
  protected delegate = prisma.platformSetting as any;
  protected modelName = 'PlatformSetting';

  async findByKey(key: string) {
    return prisma.platformSetting.findFirst({ where: { key, deletedAt: null } });
  }

  async upsertByKey(key: string, data: any) {
    const existing = await this.findByKey(key);
    if (existing) {
      return prisma.platformSetting.update({ where: { key }, data });
    }
    return prisma.platformSetting.create({ data: { key, ...data } });
  }

  async getPublic() {
    return prisma.platformSetting.findMany({ where: { isPublic: true, deletedAt: null } });
  }
}

export const userSettingRepository = new UserSettingRepository();
export const platformSettingRepository = new PlatformSettingRepository();
