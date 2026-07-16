export const APP_NAME = 'AquaBuddy E-Tech';
export const API_PREFIX = '/api/v1';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const ROBOT_CODE_PREFIX = 'AQB';
export const ROBOT_CODE_LENGTH = 5;

export const SENSOR_THRESHOLDS = {
  HUMIDITY_HIGH: 95,
  HUMIDITY_LOW: 20,
  TEMPERATURE_HIGH: 45,
  TEMPERATURE_LOW: -5,
  WATER_TANK_CAPACITY: 50, // liters
  EFFICIENCY_LOW: 30,
} as const;

export const ALERT_CHECK_INTERVAL_MS = 60000; // 1 minute
export const ANALYTICS_SNAPSHOT_INTERVAL_MS = 3600000; // 1 hour

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
