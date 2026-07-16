import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class SystemHealthRepository extends BaseRepository<any, any> {
  protected delegate = prisma.systemHealth as any;
  protected modelName = 'SystemHealth';

  async getLatest() {
    return prisma.systemHealth.findMany({
      where: { deletedAt: null },
      orderBy: { checkedAt: 'desc' },
      take: 10,
    });
  }

  async getByComponent(component: string) {
    return prisma.systemHealth.findMany({
      where: { component, deletedAt: null },
      orderBy: { checkedAt: 'desc' },
      take: 20,
    });
  }

  async getRecentByComponent() {
    const components = await prisma.systemHealth.groupBy({
      by: ['component'],
      where: { deletedAt: null },
      _max: { checkedAt: true },
    });

    const result: any[] = [];
    for (const comp of components) {
      const latest = await prisma.systemHealth.findFirst({
        where: { component: comp.component, checkedAt: comp._max.checkedAt!, deletedAt: null },
      });
      if (latest) result.push(latest);
    }
    return result;
  }
}

export const systemHealthRepository = new SystemHealthRepository();
