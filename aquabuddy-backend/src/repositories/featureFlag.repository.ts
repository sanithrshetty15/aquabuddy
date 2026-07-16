import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class FeatureFlagRepository extends BaseRepository<any, any> {
  protected delegate = prisma.featureFlag as any;
  protected modelName = 'FeatureFlag';

  async findByKey(key: string) {
    return prisma.featureFlag.findFirst({ where: { key, deletedAt: null } });
  }

  async getEnabled() {
    return prisma.featureFlag.findMany({ where: { enabled: true, deletedAt: null } });
  }

  async toggle(key: string, enabled: boolean) {
    return prisma.featureFlag.update({ where: { key }, data: { enabled } });
  }

  async updateByKey(key: string, data: any) {
    return prisma.featureFlag.update({ where: { key }, data });
  }
}

export const featureFlagRepository = new FeatureFlagRepository();
