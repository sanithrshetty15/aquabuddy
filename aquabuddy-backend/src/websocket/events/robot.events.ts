import { Server } from 'socket.io';

/**
 * Broadcast robot status changes (e.g. online/offline status or errors)
 */
export const emitRobotStatusChange = (io: Server, robotId: string, status: string): void => {
  io.to(`robot:${robotId}`).emit('robot:status_change', { robotId, status });
  io.to('dashboard:user').emit('robot:status_change', { robotId, status });
  io.to('dashboard:admin').emit('robot:status_change', { robotId, status });
};
