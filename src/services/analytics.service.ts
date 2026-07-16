import axiosInstance from './api.service';

/**
 * Fetch dashboard overview KPI data
 */
export const getOverviewKPIs = async () => {
  const response = await axiosInstance.get('/analytics/overview');
  return response.data;
};

/**
 * Fetch charts historical data and predictions for a robot
 */
export const getDashboardCharts = async (robotId: string, days: number = 7) => {
  const response = await axiosInstance.get(`/analytics/${robotId}/dashboard?days=${days}`);
  return response.data;
};
