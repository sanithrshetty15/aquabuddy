import { Socket } from 'socket.io';
import { RoomManager } from '../rooms/room-manager';
import { logger } from '../../utils/logger.utils';

export const handleDataStreamSubscriptions = (socket: Socket, rooms: RoomManager): void => {
  const user = (socket as any).user;

  socket.on('robot:subscribe', (robotId: string) => {
    if (typeof robotId !== 'string') return;
    rooms.joinRobotRoom(socket, robotId);
    socket.emit('robot:subscribed', { robotId });
    logger.info(`Socket ${socket.id} subscribed to robot:${robotId}`);
  });

  socket.on('robot:unsubscribe', (robotId: string) => {
    if (typeof robotId !== 'string') return;
    rooms.leaveRobotRoom(socket, robotId);
    socket.emit('robot:unsubscribed', { robotId });
    logger.info(`Socket ${socket.id} unsubscribed from robot:${robotId}`);
  });

  socket.on('dashboard:subscribe', () => {
    rooms.joinDashboardRoom(socket, user?.role || 'USER');
    socket.emit('dashboard:subscribed');
    logger.info(`Socket ${socket.id} subscribed to dashboard`);
  });

  socket.on('alerts:subscribe', () => {
    rooms.joinAlertsRoom(socket);
    socket.emit('alerts:subscribed');
    logger.info(`Socket ${socket.id} subscribed to alerts`);
  });
};
