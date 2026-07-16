import { Server, Socket } from 'socket.io';
import { logger } from '../../utils/logger.utils';

/**
 * Socket.IO Room Manager
 *
 * Room naming convention:
 *   user:{userId}       - User-specific notifications
 *   robot:{robotId}     - Robot-specific telemetry/status
 *   dashboard:admin     - Admin dashboard broadcast
 *   dashboard:owner     - Owner dashboard broadcast
 *   alerts:global       - Global alert broadcast
 */

export class RoomManager {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  joinUserRoom(socket: Socket, userId: string): void {
    socket.join(`user:${userId}`);
    logger.debug(`Socket ${socket.id} joined room user:${userId}`);
  }

  leaveUserRoom(socket: Socket, userId: string): void {
    socket.leave(`user:${userId}`);
  }

  joinRobotRoom(socket: Socket, robotId: string): void {
    socket.join(`robot:${robotId}`);
    logger.debug(`Socket ${socket.id} joined room robot:${robotId}`);
  }

  leaveRobotRoom(socket: Socket, robotId: string): void {
    socket.leave(`robot:${robotId}`);
  }

  joinDashboardRoom(socket: Socket, role: string): void {
    socket.join('dashboard:user');
    if (role === 'ADMIN' || role === 'OWNER') {
      socket.join('dashboard:admin');
    }
    if (role === 'OWNER') {
      socket.join('dashboard:owner');
    }
    logger.debug(`Socket ${socket.id} joined dashboard rooms (role: ${role})`);
  }

  joinAlertsRoom(socket: Socket): void {
    socket.join('alerts:global');
    logger.debug(`Socket ${socket.id} joined alerts:global`);
  }

  // ─── Emit helpers ──────────────────────────────────────────

  emitToRobot<T>(robotId: string, event: string, data: T): void {
    this.io.to(`robot:${robotId}`).emit(event, data);
  }

  emitToUser<T>(userId: string, event: string, data: T): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  emitToAdmins<T>(event: string, data: T): void {
    this.io.to('dashboard:admin').emit(event, data);
  }

  emitToOwner<T>(event: string, data: T): void {
    this.io.to('dashboard:owner').emit(event, data);
  }

  emitToDashboard<T>(event: string, data: T): void {
    this.io.to('dashboard:user').emit(event, data);
  }

  emitGlobal<T>(event: string, data: T): void {
    this.io.emit(event, data);
  }

  getRobotRoomSize(robotId: string): number {
    const room = this.io.sockets.adapter.rooms.get(`robot:${robotId}`);
    return room ? room.size : 0;
  }

  isRobotConnected(robotId: string): boolean {
    return this.getRobotRoomSize(robotId) > 0;
  }

  getConnectedRobots(): string[] {
    const robots: string[] = [];
    for (const [room] of this.io.sockets.adapter.rooms) {
      if (room.startsWith('robot:')) {
        robots.push(room.replace('robot:', ''));
      }
    }
    return robots;
  }
}

export function createRoomManager(io: Server): RoomManager {
  return new RoomManager(io);
}
