import { Server } from 'socket.io';

/**
 * Broadcast new sensor readings to subscribers
 */
export const emitSensorUpdate = (io: Server, robotId: string, reading: any): void => {
  io.to(`robot:${robotId}`).emit('sensor:update', reading);
  io.to('dashboard:user').emit('sensor:update', reading);
};
