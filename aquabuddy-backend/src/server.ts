import http from 'http';
import app from './app';
import { env } from './config/env';
import { createSocketServer } from './config/socket';
import { logger } from './utils/logger.utils';
import prisma from './config/database';
import { setupConnectionHandler } from './websocket/handlers/connectionHandler';

// IoT Module
import { arduinoAdapter } from './robot/communication/adapters/arduino.adapter';
import { esp32Adapter } from './robot/communication/adapters/esp32.adapter';
import { heartbeatService } from './robot/communication/health/heartbeat.service';
import { connectionRecovery } from './robot/communication/health/connection-recovery';
import { eventBus, RobotEvent, RobotEventPayloads } from './robot/event-bus/index';
import * as notificationService from './services/notification.service';
import * as auditService from './services/audit.service';

const server = http.createServer(app);

// Initialize Socket.IO
const io = createSocketServer(server);

// Make io accessible to route handlers
app.set('io', io);

// Setup Socket.IO Event Handlers
setupConnectionHandler(io);

// Wire IoT Adapters to Socket.IO
arduinoAdapter.setIO(io);
esp32Adapter.setIO(io);

// ─── Event Bus → Service Wiring ──────────────────────────────

// Alert → Notification
eventBus.onAsync(RobotEvent.ALERT_GENERATED, async (payload: RobotEventPayloads[typeof RobotEvent.ALERT_GENERATED]) => {
  try {
    const robot = await prisma.robot.findUnique({
      where: { id: payload.robotId },
      select: { ownerId: true, name: true },
    });
    if (robot?.ownerId) {
      await notificationService.createNotification({
        userId: robot.ownerId,
        type: 'ALERT',
        title: `Alert: ${payload.alert.type}`,
        message: payload.alert.message,
        priority: payload.alert.severity === 'CRITICAL' ? 'URGENT' : 'HIGH',
      });
    }
  } catch (err: any) {
    logger.error('Failed to create notification from alert:', { error: err.message });
  }
});

// Alert → Heartbeat registration (when we receive telemetry, robot is active)
eventBus.on(RobotEvent.TELEMETRY_STORED, (payload: RobotEventPayloads[typeof RobotEvent.TELEMETRY_STORED]) => {
  heartbeatService.registerHeartbeat(payload.robotId);
});

// Robot disconnect → Connection recovery
eventBus.on(RobotEvent.ROBOT_DISCONNECTED, (payload: RobotEventPayloads[typeof RobotEvent.ROBOT_DISCONNECTED]) => {
  connectionRecovery.startRecovery(payload.robotId, payload.reason);
});

// Robot connect → Cancel recovery
eventBus.on(RobotEvent.ROBOT_CONNECTED, (payload: RobotEventPayloads[typeof RobotEvent.ROBOT_CONNECTED]) => {
  connectionRecovery.cancelRecovery(payload.robotId);
});

// Robot status change → Audit log
eventBus.onAsync(RobotEvent.ROBOT_STATUS_CHANGE, async (payload: RobotEventPayloads[typeof RobotEvent.ROBOT_STATUS_CHANGE]) => {
  try {
    await auditService.createAuditLog(
      null,
      `ROBOT_${payload.status}`,
      undefined,
      undefined,
      `Robot ${payload.robotId} changed status from ${payload.previousStatus} to ${payload.status}`
    );
  } catch (err: any) {
    logger.error('Failed to audit robot status change:', { error: err.message });
  }
});

// ─── Start Services ──────────────────────────────────────────

// Start Arduino IoT Simulator
arduinoAdapter.startSimulator();

// Start Heartbeat Service
heartbeatService.start();

// ─── Graceful Shutdown ───────────────────────────────────────

const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Stop IoT services
  await arduinoAdapter.dispose();
  heartbeatService.stop();
  connectionRecovery.dispose();

  // Close Socket.IO
  io.close(() => {
    logger.info('Socket.IO server closed');
  });

  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed');
  });

  // Disconnect Prisma
  await prisma.$disconnect();
  logger.info('Database connection closed');

  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', { reason });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

// ─── Start Server ────────────────────────────────────────────

server.listen(env.PORT, () => {
  logger.info(`🚀 AquaBuddy Backend running on port ${env.PORT}`);
  logger.info(`📡 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 API: http://localhost:${env.PORT}/api/v1`);
  logger.info(`❤️  Health: http://localhost:${env.PORT}/api/v1/health`);
  logger.info(`📋 Docs: http://localhost:${env.PORT}/api/v1/docs`);
});

export { io };
