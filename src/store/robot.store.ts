import { create } from 'zustand';
import * as robotService from '../services/robot.service';
import { Robot, PurchaseRequest, RobotStatus } from '../types/robot.types';

interface RobotState {
  robots: Robot[];
  purchases: PurchaseRequest[];
  
  // Backwards compatibility
  isLoading: boolean;
  error: string | null;

  // Loading States
  fetchRobotsLoading: boolean;
  fetchPurchasesLoading: boolean;
  linkRobotLoading: boolean;
  submitPurchaseLoading: boolean;
  approvePurchaseLoading: boolean;
  rejectPurchaseLoading: boolean;
  updateRobotStatusLoading: boolean;
  createRobotLoading: boolean;

  // Error States
  fetchRobotsError: string | null;
  fetchPurchasesError: string | null;
  linkRobotError: string | null;
  submitPurchaseError: string | null;
  approvePurchaseError: string | null;
  rejectPurchaseError: string | null;
  updateRobotStatusError: string | null;
  createRobotError: string | null;

  // Pagination metadata
  robotsPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  purchasesPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  fetchRobots: (params?: { page?: number; limit?: number; search?: string; status?: string }) => Promise<void>;
  fetchPurchases: (params?: { page?: number; limit?: number; status?: string }) => Promise<void>;
  linkRobot: (code: string, name?: string) => Promise<boolean>;
  submitPurchase: (model: string, quantity: number) => Promise<boolean>;
  approvePurchase: (id: string) => Promise<boolean>;
  rejectPurchase: (id: string, reason: string) => Promise<boolean>;
  updateRobotStatus: (id: string, status: RobotStatus) => Promise<boolean>;
  createRobot: (data: { code: string; name: string; model: string; lat: number; lng: number }) => Promise<boolean>;
}

export const useRobotStore = create<RobotState>((set, get) => ({
  robots: [],
  purchases: [],
  isLoading: false,
  error: null,

  fetchRobotsLoading: false,
  fetchPurchasesLoading: false,
  linkRobotLoading: false,
  submitPurchaseLoading: false,
  approvePurchaseLoading: false,
  rejectPurchaseLoading: false,
  updateRobotStatusLoading: false,
  createRobotLoading: false,

  fetchRobotsError: null,
  fetchPurchasesError: null,
  linkRobotError: null,
  submitPurchaseError: null,
  approvePurchaseError: null,
  rejectPurchaseError: null,
  updateRobotStatusError: null,
  createRobotError: null,

  fetchRobots: async (params) => {
    set({ fetchRobotsLoading: true, fetchRobotsError: null, isLoading: true, error: null });
    try {
      const response = await robotService.getRobots(params);
      // Backend returns either direct array (legacy) or { success, data, pagination }
      if (response.pagination) {
        set({ 
          robots: response.data, 
          robotsPagination: response.pagination,
          fetchRobotsLoading: false,
          isLoading: false
        });
      } else {
        set({ 
          robots: response.data || response, 
          robotsPagination: undefined,
          fetchRobotsLoading: false,
          isLoading: false 
        });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to fetch robots';
      set({ 
        fetchRobotsError: errMsg, 
        error: errMsg,
        fetchRobotsLoading: false, 
        isLoading: false 
      });
    }
  },

  fetchPurchases: async () => {
    set({ purchases: [], purchasesPagination: undefined, fetchPurchasesLoading: false, isLoading: false });
  },

  linkRobot: async (code, name) => {
    set({ linkRobotLoading: true, linkRobotError: null, isLoading: true, error: null });
    try {
      await robotService.linkRobot(code, name);
      await get().fetchRobots();
      set({ linkRobotLoading: false, isLoading: false });
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to link robot';
      set({ 
        linkRobotError: errMsg, 
        error: errMsg,
        linkRobotLoading: false, 
        isLoading: false 
      });
      return false;
    }
  },

  submitPurchase: async () => {
    return true;
  },

  approvePurchase: async () => {
    return true;
  },

  rejectPurchase: async () => {
    return true;
  },

  updateRobotStatus: async (id, status) => {
    set({ updateRobotStatusLoading: true, updateRobotStatusError: null, isLoading: true, error: null });
    try {
      await robotService.updateRobotStatus(id, status);
      await get().fetchRobots();
      set({ updateRobotStatusLoading: false, isLoading: false });
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update robot status';
      set({ 
        updateRobotStatusError: errMsg, 
        error: errMsg,
        updateRobotStatusLoading: false, 
        isLoading: false 
      });
      return false;
    }
  },

  createRobot: async (data) => {
    set({ createRobotLoading: true, createRobotError: null, isLoading: true, error: null });
    try {
      await robotService.createRobot(data);
      await get().fetchRobots();
      set({ createRobotLoading: false, isLoading: false });
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to create robot';
      set({ 
        createRobotError: errMsg, 
        error: errMsg,
        createRobotLoading: false, 
        isLoading: false 
      });
      return false;
    }
  },
}));
