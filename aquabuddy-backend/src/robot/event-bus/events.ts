export enum RobotEvent {
  ROBOT_CONNECTED = 'robot:connected',
  ROBOT_DISCONNECTED = 'robot:disconnected',
  ROBOT_RECONNECTING = 'robot:reconnecting',
  ROBOT_STATUS_CHANGE = 'robot:status_change',
  ROBOT_HEARTBEAT = 'robot:heartbeat',
  ROBOT_ERROR = 'robot:error',

  TELEMETRY_RECEIVED = 'telemetry:received',
  TELEMETRY_STORED = 'telemetry:stored',
  TELEMETRY_INVALID = 'telemetry:invalid',

  ALERT_GENERATED = 'alert:generated',
  ALERT_ACKNOWLEDGED = 'alert:acknowledged',
  ALERT_RESOLVED = 'alert:resolved',

  COMMAND_SENT = 'command:sent',
  COMMAND_ACKNOWLEDGED = 'command:acknowledged',
  COMMAND_FAILED = 'command:failed',
  COMMAND_TIMEOUT = 'command:timeout',

  FIRMWARE_DEPLOYED = 'firmware:deployed',
  FIRMWARE_DEPLOYMENT_COMPLETED = 'firmware:deployment_completed',
  FIRMWARE_DEPLOYMENT_FAILED = 'firmware:deployment_failed',

  MAINTENANCE_SCHEDULED = 'maintenance:scheduled',
  MAINTENANCE_COMPLETED = 'maintenance:completed',

  BATTERY_LOW = 'battery:low',
  SENSOR_FAILED = 'sensor:failed',
}

export interface RobotEventPayloads {
  [RobotEvent.ROBOT_CONNECTED]: { robotId: string; adapter: string };
  [RobotEvent.ROBOT_DISCONNECTED]: { robotId: string; reason: string };
  [RobotEvent.ROBOT_RECONNECTING]: { robotId: string; attempt: number; maxAttempts: number };
  [RobotEvent.ROBOT_STATUS_CHANGE]: { robotId: string; status: string; previousStatus: string };
  [RobotEvent.ROBOT_HEARTBEAT]: { robotId: string; timestamp: Date; battery?: number; signalStrength?: number; firmwareVersion?: string; healthStatus?: string };
  [RobotEvent.ROBOT_ERROR]: { robotId: string; error: string; code?: string };

  [RobotEvent.TELEMETRY_RECEIVED]: { robotId: string; data: any };
  [RobotEvent.TELEMETRY_STORED]: { robotId: string; reading: any; alerts: any[] };
  [RobotEvent.TELEMETRY_INVALID]: { robotId: string; data: any; errors: string[] };

  [RobotEvent.ALERT_GENERATED]: { robotId: string; alert: any };
  [RobotEvent.ALERT_ACKNOWLEDGED]: { alertId: string; robotId: string };
  [RobotEvent.ALERT_RESOLVED]: { alertId: string; robotId: string };

  [RobotEvent.COMMAND_SENT]: { commandId: string; robotId: string; command: string };
  [RobotEvent.COMMAND_ACKNOWLEDGED]: { commandId: string; robotId: string; status?: string };
  [RobotEvent.COMMAND_FAILED]: { commandId: string; robotId: string; error: string };
  [RobotEvent.COMMAND_TIMEOUT]: { commandId: string; robotId: string; command: string };

  [RobotEvent.FIRMWARE_DEPLOYED]: { robotId: string; firmwareId: string; version: string };
  [RobotEvent.FIRMWARE_DEPLOYMENT_COMPLETED]: { robotId: string; firmwareId: string; version: string };
  [RobotEvent.FIRMWARE_DEPLOYMENT_FAILED]: { robotId: string; firmwareId: string; error: string };

  [RobotEvent.MAINTENANCE_SCHEDULED]: { robotId: string; maintenanceId: string; scheduledAt: Date };
  [RobotEvent.MAINTENANCE_COMPLETED]: { robotId: string; maintenanceId: string };

  [RobotEvent.BATTERY_LOW]: { robotId: string; battery: number };
  [RobotEvent.SENSOR_FAILED]: { robotId: string; sensor: string; error: string };
}
