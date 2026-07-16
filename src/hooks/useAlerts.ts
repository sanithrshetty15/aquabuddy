import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { Alert } from '../components/cards/AlertCard';

/**
 * Hook to list alerts, acknowledge alerts, and resolve alerts via API calls
 */
export const useAlerts = (robotId?: string) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = robotId
        ? `${API_ENDPOINTS.alerts.list}?robotId=${robotId}`
        : API_ENDPOINTS.alerts.list;
      const res = await axiosInstance.get(url);
      if (res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch alerts');
    } finally {
      setIsLoading(false);
    }
  }, [robotId]);

  const acknowledgeAlert = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await axiosInstance.patch(API_ENDPOINTS.alerts.acknowledge(id));
      if (res.data.success) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === id ? { ...alert, status: 'ACKNOWLEDGED' } : alert
          )
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to acknowledge alert');
    } finally {
      setIsProcessing(false);
    }
  };

  const resolveAlert = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await axiosInstance.patch(API_ENDPOINTS.alerts.resolve(id));
      if (res.data.success) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === id
              ? { ...alert, status: 'RESOLVED', resolvedAt: new Date().toISOString() }
              : alert
          )
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resolve alert');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    void fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    isLoading,
    isProcessing,
    error,
    fetchAlerts,
    acknowledgeAlert,
    resolveAlert,
  };
};
