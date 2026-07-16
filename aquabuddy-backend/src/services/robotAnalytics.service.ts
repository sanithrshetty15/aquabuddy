import { robotAnalyticsRepository } from '../repositories';
import { NotFoundError } from '../utils/error.utils';

export const getRobotAnalytics = async (robotId: string, days: number = 7) => {
  const analytics = await robotAnalyticsRepository.findByRobotId(robotId, days);
  return analytics;
};

export const getLatestRobotAnalytics = async (robotId: string) => {
  const latest = await robotAnalyticsRepository.getLatestByRobotId(robotId);
  if (!latest) throw new NotFoundError('No analytics data for this robot');
  return latest;
};
