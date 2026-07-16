import { useState, useEffect, useCallback } from 'react';
import * as analyticsService from '../services/analytics.service';

/**
 * Hook to retrieve and refresh dashboard overview KPIs and detailed graph data
 */
export const useAnalytics = (robotId?: string, days: number = 7) => {
  const [kpis, setKpis] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getOverviewKPIs();
      if (res.success) {
        setKpis(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch KPIs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchChartData = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getDashboardCharts(id, days);
      if (res.success) {
        setChartData(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch chart datasets');
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void fetchKPIs();
  }, [fetchKPIs]);

  useEffect(() => {
    if (robotId) {
      void fetchChartData(robotId);
    }
  }, [robotId, fetchChartData]);

  return {
    kpis,
    chartData,
    isLoading,
    error,
    refreshKPIs: fetchKPIs,
    refreshCharts: () => robotId && fetchChartData(robotId),
  };
};
