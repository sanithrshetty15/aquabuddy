import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class ServiceHistoryRepository extends BaseRepository<any, any> {
  protected delegate = prisma.serviceHistory as any;
  protected modelName = 'ServiceHistory';

  async findByRobotId(robotId: string) {
    return prisma.serviceHistory.findMany({
      where: { robotId, deletedAt: null },
      orderBy: { performedAt: 'desc' },
    });
  }

  async getUpcomingServices(limit: number = 10) {
    return prisma.serviceHistory.findMany({
      where: { nextServiceDue: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, deletedAt: null },
      orderBy: { nextServiceDue: 'asc' },
      take: limit,
      include: { robot: { select: { name: true, code: true, model: true } } },
    });
  }
}

export const serviceHistoryRepository = new ServiceHistoryRepository();
