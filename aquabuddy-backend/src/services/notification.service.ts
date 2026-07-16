import { notificationRepository } from '../repositories';
import { NotFoundError } from '../utils/error.utils';

export const getUserNotifications = async (userId: string, limit: number = 20) => {
  return notificationRepository.findByUserId(userId, limit);
};

export const getUnreadNotifications = async (userId: string) => {
  return notificationRepository.findUnreadByUserId(userId);
};

export const createNotification = async (data: { userId: string; type: string; title: string; message: string; priority?: string }) => {
  return notificationRepository.create(data);
};

export const markAsRead = async (id: string) => {
  const notification = await notificationRepository.findById(id);
  if (!notification) throw new NotFoundError('Notification not found');
  return notificationRepository.markAsRead(id);
};

export const markAllAsRead = async (userId: string) => {
  return notificationRepository.markAllAsRead(userId);
};

export const countUnread = async (userId: string) => {
  return notificationRepository.countUnread(userId);
};
