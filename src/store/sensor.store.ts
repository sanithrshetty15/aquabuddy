import { create } from 'zustand';
import { SensorReading, SensorStats } from '../types/sensor.types';
import axiosInstance from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';

interface SensorState {
  latestReadings: Record<string, SensorReading>; // robotId -> reading
  history: Record<string, SensorReading[]>;      // robotId -> readings
  stats: Record<string, SensorStats>;            // robotId -> stats
  
  // Backwards compatibility
  isLoading: boolean;
  error: string | null;

  // Loading States
  fetchHistoryLoading: boolean;
  fetchLatestLoading: boolean;
  fetchStatsLoading: boolean;

  // Error States
  fetchHistoryError: string | null;
  fetchLatestError: string | null;
  fetchStatsError: string | null;

  // Pagination metadata (robotId -> pagination details)
  historyPagination: Record<string, {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }>;

  setLatestReading: (robotId: string, reading: SensorReading) => void;
  addHistoryReading: (robotId: string, reading: SensorReading) => void;
  fetchHistory: (robotId: string, params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) => Promise<void>;
  fetchLatest: (robotId: string) => Promise<void>;
  fetchStats: (robotId: string) => Promise<void>;
}

export const useSensorStore = create<SensorState>((set, get) => ({
  latestReadings: {},
  history: {},
  stats: {},
  isLoading: false,
  error: null,

  fetchHistoryLoading: false,
  fetchLatestLoading: false,
  fetchStatsLoading: false,

  fetchHistoryError: null,
  fetchLatestError: null,
  fetchStatsError: null,

  historyPagination: {},

  setLatestReading: (robotId, reading) => set((state) => ({
    latestReadings: {
      ...state.latestReadings,
      [robotId]: reading
    }
  })),

  addHistoryReading: (robotId, reading) => set((state) => {
    const robotHistory = state.history[robotId] || [];
    // Prepend and limit size to last 100 entries
    const newHistory = [reading, ...robotHistory].slice(0, 100);
    return {
      history: {
        ...state.history,
        [robotId]: newHistory
      }
    };
  }),

  fetchHistory: async (robotId, params) => {
    set({ fetchHistoryLoading: true, fetchHistoryError: null, isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.sensors.history(robotId), { params });
      if (response.data.success) {
        set((state) => ({
          history: {
            ...state.history,
            [robotId]: response.data.data
          },
          historyPagination: {
            ...state.historyPagination,
            [robotId]: response.data.pagination
          },
          fetchHistoryLoading: false,
          isLoading: false
        }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to fetch sensor history';
      set({ 
        fetchHistoryError: errMsg, 
        error: errMsg,
        fetchHistoryLoading: false, 
        isLoading: false 
      });
    }
  },

  fetchLatest: async (robotId) => {
    set({ fetchLatestLoading: true, fetchLatestError: null, isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.sensors.latest(robotId));
      if (response.data.success) {
        set((state) => ({
          latestReadings: {
            ...state.latestReadings,
            [robotId]: response.data.data
          },
          fetchLatestLoading: false,
          isLoading: false
        }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to fetch latest sensor reading';
      set({ 
        fetchLatestError: errMsg, 
        error: errMsg,
        fetchLatestLoading: false, 
        isLoading: false 
      });
    }
  },

  fetchStats: async (robotId) => {
    set({ fetchStatsLoading: true, fetchStatsError: null, isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/sensors/${robotId}/stats`);
      if (response.data.success) {
        set((state) => ({
          stats: {
            ...state.stats,
            [robotId]: response.data.data
          },
          fetchStatsLoading: false,
          isLoading: false
        }));
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to fetch sensor statistics';
      set({ 
        fetchStatsError: errMsg, 
        error: errMsg,
        fetchStatsLoading: false, 
        isLoading: false 
      });
    }
  }
}));
