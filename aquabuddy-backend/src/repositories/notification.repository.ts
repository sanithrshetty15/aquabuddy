import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class NotificationRepository extends BaseRepository<any, any> {
  protected delegate = prisma.notification as any;
  protected modelName = 'Notification';

  async findByUserId(userId: string, limit: number = 20) {
    return prisma.notification.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findUnreadByUserId(userId: string) {
    return prisma.notification.findMany({
      where: { userId, isRead: false, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { isRead: true, readAt: new Date() } });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false, deletedAt: null },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false, deletedAt: null } });
  }
}

export const notificationRepository = new NotificationRepository();
