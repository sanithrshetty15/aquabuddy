export interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  message: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface NotificationResponseDto {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export function toNotificationResponse(n: any): NotificationResponseDto {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    priority: n.priority,
    isRead: n.isRead,
    readAt: n.readAt?.toISOString?.() || null,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
  };
}
