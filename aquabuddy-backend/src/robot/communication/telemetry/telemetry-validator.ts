export interface ValidatedTelemetry {
  robotId: string;
  humidity: number;
  temperature: number;
  waterFlow: number;
  waterLevel: number;
  powerConsumption: number;
  battery: number;
  voltage: number;
  current: number;
  motorStatus: string;
  pumpStatus: string;
  relayStatus: string;
  fanStatus: string;
  movementState: string;
  currentMode: string;
  obstacle: boolean;
  irDetection: boolean;
  signalStrength: number;
  runtime: number;
  firmwareVersion?: string;
  hardwareRevision?: string;
  errors: string[];
}

const BATTERY_MIN = 0;
const BATTERY_MAX = 100;
const HUMIDITY_MIN = 0;
const HUMIDITY_MAX = 100;
const TEMP_MIN = -50;
const TEMP_MAX = 100;
const SIGNAL_MIN = -120;
const SIGNAL_MAX = 0;
const VOLTAGE_MIN = 0;
const VOLTAGE_MAX = 500;
const CURRENT_MIN = 0;
const CURRENT_MAX = 50;
const RUNTIME_MIN = 0;

const VALID_MOTOR_STATUSES = ['ON', 'OFF', 'ERROR', 'UNKNOWN'];
const VALID_PUMP_STATUSES = ['ON', 'OFF', 'ERROR', 'UNKNOWN'];
const VALID_RELAY_STATUSES = ['ON', 'OFF', 'ERROR', 'UNKNOWN'];
const VALID_FAN_STATUSES = ['ON', 'OFF', 'ERROR', 'UNKNOWN'];
const VALID_MOVEMENT_STATES = ['FORWARD', 'BACKWARD', 'LEFT', 'RIGHT', 'STATIONARY', 'UNKNOWN'];
const VALID_CURRENT_MODES = ['AUTOMATIC', 'MANUAL', 'MAINTENANCE', 'EMERGENCY', 'UNKNOWN'];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toEnum(value: string | undefined, validValues: string[], defaultValue: string): string {
  if (!value) return defaultValue;
  const upper = value.toUpperCase();
  return validValues.includes(upper) ? upper : defaultValue;
}

export function validateTelemetry(data: any): ValidatedTelemetry {
  const errors: string[] = [];

  if (!data.robotId || typeof data.robotId !== 'string') {
    errors.push('Invalid or missing robotId');
  }

  if (typeof data.humidity !== 'number' || data.humidity < HUMIDITY_MIN || data.humidity > HUMIDITY_MAX) {
    errors.push(`Humidity must be between ${HUMIDITY_MIN} and ${HUMIDITY_MAX}`);
  }

  if (typeof data.temperature !== 'number' || data.temperature < TEMP_MIN || data.temperature > TEMP_MAX) {
    errors.push(`Temperature must be between ${TEMP_MIN} and ${TEMP_MAX}`);
  }

  if (typeof data.waterFlow !== 'number' || data.waterFlow < 0) {
    errors.push('Water flow must be a non-negative number');
  }

  if (typeof data.waterLevel !== 'number' || data.waterLevel < 0) {
    errors.push('Water level must be a non-negative number');
  }

  if (typeof data.powerConsumption !== 'number' || data.powerConsumption < 0) {
    errors.push('Power consumption must be a non-negative number');
  }

  if (typeof data.voltage !== 'number' || data.voltage < VOLTAGE_MIN || data.voltage > VOLTAGE_MAX) {
    errors.push(`Voltage must be between ${VOLTAGE_MIN} and ${VOLTAGE_MAX}`);
  }

  if (typeof data.current !== 'number' || data.current < CURRENT_MIN || data.current > CURRENT_MAX) {
    errors.push(`Current must be between ${CURRENT_MIN} and ${CURRENT_MAX}`);
  }

  if (typeof data.runtime !== 'number' || data.runtime < RUNTIME_MIN) {
    errors.push('Runtime must be a non-negative number');
  }

  const battery = clamp(data.battery ?? 100, BATTERY_MIN, BATTERY_MAX);
  if (typeof data.battery === 'number' && (data.battery < BATTERY_MIN || data.battery > BATTERY_MAX)) {
    errors.push(`Battery must be between ${BATTERY_MIN} and ${BATTERY_MAX}`);
  }

  const signalStrength = clamp(data.signalStrength ?? -50, SIGNAL_MIN, SIGNAL_MAX);

  return {
    robotId: data.robotId || '',
    humidity: data.humidity || 0,
    temperature: data.temperature || 0,
    waterFlow: data.waterFlow || 0,
    waterLevel: data.waterLevel || 0,
    powerConsumption: data.powerConsumption || 0,
    battery: Math.round(battery),
    voltage: data.voltage || 220,
    current: data.current || 0,
    motorStatus: toEnum(data.motorStatus, VALID_MOTOR_STATUSES, 'UNKNOWN'),
    pumpStatus: toEnum(data.pumpStatus, VALID_PUMP_STATUSES, 'OFF'),
    relayStatus: toEnum(data.relayStatus, VALID_RELAY_STATUSES, 'OFF'),
    fanStatus: toEnum(data.fanStatus, VALID_FAN_STATUSES, 'OFF'),
    movementState: toEnum(data.movementState, VALID_MOVEMENT_STATES, 'STATIONARY'),
    currentMode: toEnum(data.currentMode, VALID_CURRENT_MODES, 'AUTOMATIC'),
    obstacle: !!data.obstacle,
    irDetection: !!data.irDetection,
    signalStrength,
    runtime: data.runtime || 0,
    firmwareVersion: data.firmwareVersion || undefined,
    hardwareRevision: data.hardwareRevision || undefined,
    errors,
  };
}

export function isValidTelemetry(validated: ValidatedTelemetry): boolean {
  return validated.errors.length === 0;
}
