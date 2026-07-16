import { Server } from 'socket.io';

/**
 * Broadcast newly generated sensor alerts to relevant clients and admins
 */
export const emitNewAlert = (io: Server, robotId: string, alerts: any[]): void => {
  io.to(`robot:${robotId}`).emit('alert:new', alerts);
  io.to('dashboard:user').emit('alert:new', alerts);
  io.to('dashboard:admin').emit('alert:new', alerts);
  io.emit('alerts:new', alerts); // Global broadcast
};
