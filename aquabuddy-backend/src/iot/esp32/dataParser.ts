export interface ESP32RawData {
  robotId: string;
  humidity: number;
  temperature: number;
  waterFlow: number;
  waterLevel: number;
  powerConsumption: number;
}

/**
 * Parse JSON body payload from ESP32 device
 */
export const parseESP32JSON = (body: any): ESP32RawData => {
  if (!body) {
    throw new Error('Missing ESP32 data payload');
  }

  return {
    robotId: body.robotId || body.robot_id,
    humidity: parseFloat(body.humidity),
    temperature: parseFloat(body.temperature),
    waterFlow: parseFloat(body.waterFlow || body.water_flow),
    waterLevel: parseFloat(body.waterLevel || body.water_level),
    powerConsumption: parseFloat(body.powerConsumption || body.power_consumption),
  };
};
