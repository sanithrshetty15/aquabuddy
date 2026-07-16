import prisma from '../config/database';
import { NotFoundError } from '../utils/error.utils';

/**
 * Fetch predictions for a robot
 */
export const getPredictions = async (robotId: string) => {
  const robot = await prisma.robot.findUnique({ where: { id: robotId } });
  if (!robot) {
    throw new NotFoundError(`Robot not found: ${robotId}`);
  }

  return prisma.prediction.findMany({
    where: { robotId },
    orderBy: { targetDate: 'asc' },
  });
};

/**
 * Generates/updates forecast predictions using a simple trend-projection heuristic
 */
export const generateRobotPredictions = async (robotId: string) => {
  const robot = await prisma.robot.findUnique({ where: { id: robotId } });
  if (!robot) {
    throw new NotFoundError(`Robot not found: ${robotId}`);
  }

  // Fetch recent readings to calibrate forecast
  const readings = await prisma.sensorReading.findMany({
    where: { robotId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const now = new Date();
  const predictionsData = [];

  if (readings.length < 5) {
    // Default fallback mock values if there is insufficient data
    for (let i = 1; i <= 3; i++) {
      const targetDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      predictionsData.push({
        robotId,
        type: 'WATER_YIELD',
        targetDate,
        value: +(15 + Math.random() * 5).toFixed(2),
        confidence: +(0.85 - i * 0.1).toFixed(2),
      });
    }
  } else {
    // Simple heuristic prediction
    const avgWaterFlow = readings.reduce((sum, r) => sum + r.waterFlow, 0) / readings.length;
    const avgHumidity = readings.reduce((sum, r) => sum + r.humidity, 0) / readings.length;

    for (let i = 1; i <= 3; i++) {
      const targetDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      // Simulate minor weather/humidity variations (+/- 10%)
      const predictedHumidity = avgHumidity * (1 + (Math.random() * 0.2 - 0.1));
      const humidityFactor = predictedHumidity / 50; // reference point 50%
      const predictedDailyYield = avgWaterFlow * 24 * 60 * humidityFactor;

      predictionsData.push({
        robotId,
        type: 'WATER_YIELD',
        targetDate,
        value: +Math.max(2.0, predictedDailyYield).toFixed(2),
        confidence: +Math.max(0.4, 0.9 - i * 0.15).toFixed(2),
      });
    }
  }

  // Replace existing predictions
  await prisma.prediction.deleteMany({ where: { robotId } });
  await prisma.prediction.createMany({ data: predictionsData });

  return prisma.prediction.findMany({ where: { robotId } });
};
