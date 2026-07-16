export interface ArduinoRawData {
  robotId: string;
  humidity: number;
  temperature: number;
  waterFlow: number;
  waterLevel: number;
  powerConsumption: number;
}

/**
 * Parse comma-separated value line from Arduino
 * Expected format: robotId,humidity,temperature,waterFlow,waterLevel,powerConsumption
 */
export const parseArduinoCSV = (csvLine: string): ArduinoRawData => {
  const parts = csvLine.trim().split(',');
  if (parts.length < 6) {
    throw new Error('Invalid CSV line format: must contain 6 parts');
  }

  return {
    robotId: parts[0],
    humidity: parseFloat(parts[1]),
    temperature: parseFloat(parts[2]),
    waterFlow: parseFloat(parts[3]),
    waterLevel: parseFloat(parts[4]),
    powerConsumption: parseFloat(parts[5]),
  };
};
