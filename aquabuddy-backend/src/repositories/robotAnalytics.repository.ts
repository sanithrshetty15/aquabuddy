import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class RobotAnalyticsRepository extends BaseRepository<any, any> {
  protected delegate = prisma.robotAnalytics as any;
  protected modelName = 'RobotAnalytics';

  async findByRobotId(robotId: string, days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return prisma.robotAnalytics.findMany({
      where: { robotId, date: { gte: since }, deletedAt: null },
      orderBy: { date: 'asc' },
    });
  }

  async getLatestByRobotId(robotId: string) {
    return prisma.robotAnalytics.findFirst({
      where: { robotId, deletedAt: null },
      orderBy: { date: 'desc' },
    });
  }
}

export const robotAnalyticsRepository = new RobotAnalyticsRepository();
