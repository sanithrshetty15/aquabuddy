import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class FeedbackRepository extends BaseRepository<any, any> {
  protected delegate = prisma.feedback as any;
  protected modelName = 'Feedback';

  async findByUserId(userId: string) {
    return prisma.feedback.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: string) {
    return prisma.feedback.findMany({
      where: { status: status as any, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respond(id: string, response: string) {
    return prisma.feedback.update({
      where: { id },
      data: { response, status: 'RESPONDED', respondedAt: new Date() },
    });
  }
}

export const feedbackRepository = new FeedbackRepository();
