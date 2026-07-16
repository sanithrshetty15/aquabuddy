import { Server } from 'socket.io';

/**
 * Send real-time notifications to a specific user's connected socket room
 */
export const emitNewNotification = (io: Server, userId: string, notification: any): void => {
  io.to(`user:${userId}`).emit('notification:new', notification);
};
