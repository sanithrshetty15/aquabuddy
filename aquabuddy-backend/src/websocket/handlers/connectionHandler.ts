import { Server, Socket } from 'socket.io';
import { socketAuthMiddleware } from './authHandler';
import { handleDataStreamSubscriptions } from './dataStreamHandler';
import { createRoomManager } from '../rooms/room-manager';
import { robotCommandService } from '../../robot/communication/commands/command.service';
import { eventBus, RobotEvent, RobotEventPayloads } from '../../robot/event-bus/index';
import { heartbeatService } from '../../robot/communication/health/heartbeat.service';
import { RoomManager } from '../rooms/room-manager';
import { logger } from '../../utils/logger.utils';
import { emitNewNotification } from '../events/notification.events';
import { emitRobotStatusChange } from '../events/robot.events';
import { emitSensorUpdate } from '../events/sensor.events';
import { emitNewAlert } from '../events/alert.events';

export const setupConnectionHandler = (io: Server): void => {
  io.use(socketAuthMiddleware);

  const rooms = createRoomManager(io);

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    logger.info(`Socket connected: ${socket.id} | User: ${user?.email} | Role: ${user?.role}`);

    // Join user-specific notification room
    if (user?.id) {
      rooms.joinUserRoom(socket, user.id);
    }

    // Join dashboard rooms based on role
    if (user?.role) {
      rooms.joinDashboardRoom(socket, user.role);
    }

    // Register subscription event handlers
    handleDataStreamSubscriptions(socket, rooms);

    // Register command acknowledgment handler
    socket.on('command:ack', (data: { commandId: string; robotId: string }) => {
      if (data?.commandId && data?.robotId) {
        robotCommandService.handleAck(data.commandId, data.robotId);
      }
    });

    // Register heartbeat from robot
    socket.on('robot:heartbeat', (data: { robotId: string }) => {
      if (data?.robotId) {
        heartbeatService.registerHeartbeat(data.robotId);
      }
    });

    // Keepalive
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id}, user: ${user?.email}, reason: ${reason}`);
    });

    // Error
    socket.on('error', (error) => {
      logger.error(`Socket error: ${socket.id}`, { error: error.message });
    });
  });

  // ─── Wire Event Bus to Socket.IO ───────────────────────────

  eventBus.on(RobotEvent.TELEMETRY_STORED, (payload: RobotEventPayloads[typeof RobotEvent.TELEMETRY_STORED]) => {
    rooms.emitToRobot(payload.robotId, 'sensor:update', payload.reading);
    rooms.emitToDashboard('sensor:update', payload.reading);
    emitSensorUpdate(io, payload.robotId, payload.reading);
  });

  eventBus.on(RobotEvent.ROBOT_STATUS_CHANGE, (payload: RobotEventPayloads[typeof RobotEvent.ROBOT_STATUS_CHANGE]) => {
    rooms.emitToRobot(payload.robotId, 'robot:status_change', payload);
    rooms.emitToDashboard('robot:status_change', payload);
    rooms.emitToAdmins('robot:status_change', payload);
    emitRobotStatusChange(io, payload.robotId, payload.status);
  });

  eventBus.on(RobotEvent.ALERT_GENERATED, (payload: RobotEventPayloads[typeof RobotEvent.ALERT_GENERATED]) => {
    rooms.emitToRobot(payload.robotId, 'alert:new', [payload.alert]);
    rooms.emitToDashboard('alert:new', [payload.alert]);
    emitNewAlert(io, payload.robotId, [payload.alert]);
  });

  eventBus.on(RobotEvent.ROBOT_CONNECTED, (payload: RobotEventPayloads[typeof RobotEvent.ROBOT_CONNECTED]) => {
    logger.info(`Robot ${payload.robotId} connected via ${payload.adapter}`);
  });

  eventBus.on(RobotEvent.ROBOT_DISCONNECTED, (payload: RobotEventPayloads[typeof RobotEvent.ROBOT_DISCONNECTED]) => {
    logger.warn(`Robot ${payload.robotId} disconnected: ${payload.reason}`);
  });

  eventBus.on(RobotEvent.COMMAND_ACKNOWLEDGED, (payload: RobotEventPayloads[typeof RobotEvent.COMMAND_ACKNOWLEDGED]) => {
    rooms.emitToRobot(payload.robotId, 'command:status', {
      commandId: payload.commandId,
      robotId: payload.robotId,
      status: 'acknowledged',
      timestamp: Date.now(),
    });
  });
};
