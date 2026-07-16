import { ESP32RawData } from './dataParser';

/**
 * Validates parsed data from ESP32 device
 */
export const validateESP32Data = (data: ESP32RawData): void => {
  if (!data.robotId || typeof data.robotId !== 'string') {
    throw new Error('Invalid or missing robotId');
  }
  if (isNaN(data.humidity) || data.humidity < 0 || data.humidity > 100) {
    throw new Error('Humidity must be a number between 0 and 100');
  }
  if (isNaN(data.temperature) || data.temperature < -50 || data.temperature > 100) {
    throw new Error('Temperature must be a number between -50 and 100');
  }
  if (isNaN(data.waterFlow) || data.waterFlow < 0) {
    throw new Error('Water flow must be a non-negative number');
  }
  if (isNaN(data.waterLevel) || data.waterLevel < 0) {
    throw new Error('Water level must be a non-negative number');
  }
  if (isNaN(data.powerConsumption) || data.powerConsumption < 0) {
    throw new Error('Power consumption must be a non-negative number');
  }
};
