import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class AlertRepository extends BaseRepository<any, any> {
  protected delegate = prisma.alert as any;
  protected modelName = 'Alert';

  async findActiveByRobotId(robotId: string) {
    return prisma.alert.findMany({
      where: { robotId, status: 'ACTIVE', deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acknowledge(id: string) {
    return prisma.alert.update({ where: { id }, data: { status: 'ACKNOWLEDGED' } });
  }

  async resolve(id: string) {
    return prisma.alert.update({ where: { id }, data: { status: 'RESOLVED', resolvedAt: new Date() } });
  }
}

export const alertRepository = new AlertRepository();
