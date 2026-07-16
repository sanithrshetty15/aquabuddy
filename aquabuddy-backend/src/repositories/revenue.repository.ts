import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class RevenueRepository extends BaseRepository<any, any> {
  protected delegate = prisma.revenue as any;
  protected modelName = 'Revenue';

  async getSummary() {
    const all = await prisma.revenue.findMany({ where: { deletedAt: null } });
    const total = all.reduce((s: number, r: any) => s + r.amount, 0);

    const byType: Record<string, number> = {};
    for (const r of all) {
      byType[r.type] = (byType[r.type] || 0) + r.amount;
    }

    return { total, count: all.length, byType };
  }

  async getByDateRange(start: Date, end: Date) {
    return prisma.revenue.findMany({
      where: { date: { gte: start, lte: end }, deletedAt: null },
      orderBy: { date: 'asc' },
    });
  }
}

export const revenueRepository = new RevenueRepository();
