/**
 * Socket.IO Event Catalog
 *
 * All events used for robot communication and real-time updates.
 * Every event is documented with direction, payload, and description.
 */

export const SOCKET_EVENTS = {
  // ─── Robot Status ─────────────────────────────────────────
  ROBOT_CONNECTED: 'robot:connected',
  /** Payload: { robotId: string, adapter: string }
   *  Direction: Backend -> Frontend
   *  Description: Robot has established connection */

  ROBOT_DISCONNECTED: 'robot:disconnected',
  /** Payload: { robotId: string, reason: string }
   *  Direction: Backend -> Frontend
   *  Description: Robot connection lost */

  ROBOT_STATUS_CHANGE: 'robot:status_change',
  /** Payload: { robotId: string, status: string, previousStatus: string }
   *  Direction: Backend -> Frontend
   *  Description: Robot state changed (ONLINE/OFFLINE/RECONNECTING/UNKNOWN) */

  ROBOT_HEARTBEAT: 'robot:heartbeat',
  /** Payload: { robotId: string, timestamp: number }
   *  Direction: Robot -> Backend -> (internal)
   *  Description: Periodic health ping from robot */

  ROBOT_ERROR: 'robot:error',
  /** Payload: { robotId: string, error: string, code?: string }
   *  Direction: Robot -> Frontend
   *  Description: Robot encountered an error */

  // ─── Telemetry ─────────────────────────────────────────────
  SENSOR_UPDATE: 'sensor:update',
  /** Payload: { id, robotId, humidity, temperature, waterFlow, waterLevel, powerConsumption, battery, createdAt }
   *  Direction: Backend -> Frontend
   *  Description: New sensor reading available */

  // ─── Alerts ────────────────────────────────────────────────
  ALERT_NEW: 'alert:new',
  /** Payload: Alert[]
   *  Direction: Backend -> Frontend
   *  Description: New alerts generated */

  ALERTS_GLOBAL: 'alerts:new',
  /** Payload: Alert[]
   *  Direction: Backend -> Frontend (global broadcast)
   *  Description: New alerts for admin dashboards */

  // ─── Commands ──────────────────────────────────────────────
  COMMAND_SEND: 'command:send',
  /** Payload: { commandId, command, robotId, timestamp }
   *  Direction: Backend -> Robot
   *  Description: Command instruction for robot */

  COMMAND_STATUS: 'command:status',
  /** Payload: { commandId, command, robotId, status, timestamp }
   *  Direction: Backend -> Frontend
   *  Description: Command execution status update */

  COMMAND_ACK: 'command:ack',
  /** Payload: { commandId, robotId }
   *  Direction: Robot -> Backend
   *  Description: Robot acknowledges command execution */

  // ─── Subscriptions ─────────────────────────────────────────
  ROBOT_SUBSCRIBE: 'robot:subscribe',
  /** Payload: robotId (string)
   *  Direction: Frontend -> Backend
   *  Description: Subscribe to a robot's real-time stream */

  ROBOT_UNSUBSCRIBE: 'robot:unsubscribe',
  /** Payload: robotId (string)
   *  Direction: Frontend -> Backend
   *  Description: Unsubscribe from a robot's real-time stream */

  ROBOT_SUBSCRIBED: 'robot:subscribed',
  /** Payload: { robotId }
   *  Direction: Backend -> Frontend
   *  Description: Confirmation of subscription */

  DASHBOARD_SUBSCRIBE: 'dashboard:subscribe',
  /** Payload: none
   *  Direction: Frontend -> Backend
   *  Description: Subscribe to dashboard updates */

  DASHBOARD_SUBSCRIBED: 'dashboard:subscribed',
  /** Payload: none
   *  Direction: Backend -> Frontend
   *  Description: Confirmation of dashboard subscription */

  ALERTS_SUBSCRIBE: 'alerts:subscribe',
  /** Payload: none
   *  Direction: Frontend -> Backend
   *  Description: Subscribe to global alerts */

  // ─── Notifications ─────────────────────────────────────────
  NOTIFICATION_NEW: 'notification:new',
  /** Payload: Notification
   *  Direction: Backend -> Frontend (user-specific)
   *  Description: New notification for user */

  // ─── Firmware ──────────────────────────────────────────────
  FIRMWARE_UPDATE_AVAILABLE: 'firmware:update_available',
  /** Payload: { robotId, version, firmwareId }
   *  Direction: Backend -> Frontend
   *  Description: New firmware version available */

  FIRMWARE_DEPLOYMENT_STATUS: 'firmware:deployment_status',
  /** Payload: { robotId, firmwareId, status, progress? }
   *  Direction: Backend -> Frontend
   *  Description: Firmware deployment progress */

  // ─── Connection ────────────────────────────────────────────
  PING: 'ping',
  /** Payload: none
   *  Direction: Frontend -> Backend
   *  Description: Keepalive ping */

  PONG: 'pong',
  /** Payload: { timestamp }
   *  Direction: Backend -> Frontend
   *  Description: Keepalive pong */

  // ─── Analytics ─────────────────────────────────────────────
  ANALYTICS_UPDATE: 'analytics:update',
  /** Payload: { robotId, analytics }
   *  Direction: Backend -> Frontend
   *  Description: Analytics data refresh */
} as const;
