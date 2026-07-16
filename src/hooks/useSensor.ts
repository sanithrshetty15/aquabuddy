import { useEffect } from 'react';
import { useSensorStore } from '../store/sensor.store';
import { useWebSocket } from './useWebSocket';
import { SensorReading } from '../types/sensor.types';

/**
 * Hook to manage subscriptions and data fetching for a specific robot's sensor data
 */
export const useSensor = (robotId?: string) => {
  const {
    latestReadings,
    history,
    stats,
    isLoading,
    error,
    fetchHistory,
    fetchLatest,
    fetchStats,
    setLatestReading,
    addHistoryReading,
  } = useSensorStore();

  const { addEventListener, subscribeToRobot, unsubscribeFromRobot } = useWebSocket();

  useEffect(() => {
    if (!robotId) {
      return;
    }

    // Fetch initial data from HTTP endpoints
    void fetchLatest(robotId);
    void fetchHistory(robotId);
    void fetchStats(robotId);

    // Subscribe to the robot room over WebSocket
    subscribeToRobot(robotId);

    // Listen to real-time socket events for this robot
    const removeListener = addEventListener((event, data) => {
      if (event === 'sensor:update' && data.robotId === robotId) {
        const reading = data as SensorReading;
        setLatestReading(robotId, reading);
        addHistoryReading(robotId, reading);
      }
    });

    return () => {
      unsubscribeFromRobot(robotId);
      removeListener();
    };
  }, [
    robotId,
    fetchLatest,
    fetchHistory,
    fetchStats,
    subscribeToRobot,
    unsubscribeFromRobot,
    addEventListener,
    setLatestReading,
    addHistoryReading,
  ]);

  return {
    latestReading: robotId ? latestReadings[robotId] || null : null,
    historyData: robotId ? history[robotId] || [] : [],
    sensorStats: robotId ? stats[robotId] || null : null,
    isLoading,
    error,
    fetchHistory,
    fetchLatest,
    fetchStats,
  };
};
