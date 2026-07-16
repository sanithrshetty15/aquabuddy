export interface SensorReading {
  id: string;
  robotId: string;
  humidity: number;
  temperature: number;
  waterFlow: number;
  waterLevel: number;
  powerConsumption: number;
  createdAt: string;
}

export interface SensorStats {
  avgHumidity: number;
  avgTemperature: number;
  totalWaterFlow: number;
  maxWaterLevel: number;
  totalPower: number;
  readingCount: number;
  timeRange: {
    start: string;
    end: string;
  };
}
