import prisma from '../config/database';

/**
 * Get high-level KPI metrics for the current dashboard user
 */
export const getOverviewKPIs = async (userId?: string, role?: string) => {
  const robotFilter: any = {};
  if (role !== 'ADMIN' && userId) {
    robotFilter.ownerId = userId;
  }

  const activeRobotsCount = await prisma.robot.count({
    where: {
      ...robotFilter,
      status: 'ONLINE',
    },
  });

  const totalRobotsCount = await prisma.robot.count({
    where: robotFilter,
  });

  // Calculate total water produced
  const robots = await prisma.robot.findMany({
    where: robotFilter,
    select: {
      id: true,
      waterGenerated: true,
    },
  });
  const totalWaterGenerated = robots.reduce((sum, r) => sum + r.waterGenerated, 0);

  // Sum of power consumption across all readings for these robots
  const robotIds = robots.map((r) => r.id);
  const powerAggregation = await prisma.sensorReading.aggregate({
    where: {
      robotId: { in: robotIds },
    },
    _sum: {
      powerConsumption: true,
    },
  });
  const totalPowerConsumed = powerAggregation._sum.powerConsumption || 0;

  // Active alerts
  const activeAlertsCount = await prisma.alert.count({
    where: {
      robotId: { in: robotIds },
      status: { in: ['ACTIVE', 'ACKNOWLEDGED'] },
    },
  });

  return {
    activeRobotsCount,
    totalRobotsCount,
    totalWaterGenerated: +totalWaterGenerated.toFixed(2),
    totalPowerConsumed: +totalPowerConsumed.toFixed(2),
    activeAlertsCount,
  };
};

/**
 * Get dashboard charts analytics data
 */
export const getDashboardAnalytics = async (robotId: string, days: number = 7) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const readings = await prisma.sensorReading.findMany({
    where: {
      robotId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'asc' },
  });

  const predictions = await prisma.prediction.findMany({
    where: {
      robotId,
      targetDate: { gte: new Date() },
    },
    orderBy: { targetDate: 'asc' },
    take: 10,
  });

  return {
    readings,
    predictions,
  };
};

/**
 * Create a daily snapshot record of analytics metrics (typically run by cron)
 */
export const createAnalyticsSnapshot = async () => {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const robots = await prisma.robot.findMany({
    select: { id: true, waterGenerated: true, status: true },
  });
  const totalWaterGenerated = robots.reduce((sum, r) => sum + r.waterGenerated, 0);
  const totalActiveRobots = robots.filter((r) => r.status === 'ONLINE').length;

  const readingsAgg = await prisma.sensorReading.aggregate({
    where: { createdAt: { gte: since24h } },
    _avg: {
      humidity: true,
      temperature: true,
    },
    _sum: {
      powerConsumption: true,
    },
  });

  return prisma.analyticsSnapshot.create({
    data: {
      date: new Date(),
      totalWaterGenerated: +totalWaterGenerated.toFixed(2),
      averageHumidity: readingsAgg._avg.humidity ? +readingsAgg._avg.humidity.toFixed(1) : 0,
      averageTemperature: readingsAgg._avg.temperature ? +readingsAgg._avg.temperature.toFixed(1) : 0,
      totalActiveRobots,
      totalPowerConsumed: readingsAgg._sum.powerConsumption ? +readingsAgg._sum.powerConsumption.toFixed(2) : 0,
    },
  });
};
