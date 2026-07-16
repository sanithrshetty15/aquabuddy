export interface SensorIngestDto {
  robotId: string;
  humidity: number;
  temperature: number;
  waterFlow: number;
  waterLevel: number;
  powerConsumption: number;
  battery?: number;
  current?: number;
  voltage?: number;
  motorStatus?: string;
  obstacle?: boolean;
  irDetection?: boolean;
  signalStrength?: number;
  runtime?: number;
}

export interface SensorReadingResponseDto {
  id: string;
  robotId: string;
  humidity: number;
  temperature: number;
  waterFlow: number;
  waterLevel: number;
  powerConsumption: number;
  battery: number;
  motorStatus: string;
  signalStrength: number;
  createdAt: string;
}

export interface SensorStatsDto {
  avgHumidity: number;
  avgTemperature: number;
  avgWaterFlow: number;
  avgPower: number;
  minBattery: number;
  maxBattery: number;
  currentBattery: number;
}

export function toSensorReadingResponse(reading: any): SensorReadingResponseDto {
  return {
    id: reading.id,
    robotId: reading.robotId,
    humidity: reading.humidity,
    temperature: reading.temperature,
    waterFlow: reading.waterFlow,
    waterLevel: reading.waterLevel,
    powerConsumption: reading.powerConsumption,
    battery: reading.battery,
    motorStatus: reading.motorStatus,
    signalStrength: reading.signalStrength,
    createdAt: reading.createdAt instanceof Date ? reading.createdAt.toISOString() : reading.createdAt,
  };
}
