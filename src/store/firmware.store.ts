import { create } from 'zustand';
import * as firmwareService from '../services/firmware.service';
import { FirmwareRecord, FirmwareDeployment, FirmwareHistoryItem, CreateFirmwareDto, DeployFirmwareDto, UpdateDeploymentDto } from '../services/firmware.service';
import { PaginationParams, PaginatedResponse } from '../types/api.types';

interface FirmwareState {
  firmwareList: FirmwareRecord[];
  firmwareListPagination: PaginatedResponse<FirmwareRecord>['pagination'] | null;
  deployments: FirmwareDeployment[];
  history: FirmwareHistoryItem[];
  selectedFirmware: FirmwareRecord | null;
  latestFirmware: Record<string, FirmwareRecord>;

  // Loading states
  fetchFirmwareLoading: boolean;
  fetchDeploymentsLoading: boolean;
  createFirmwareLoading: boolean;
  deployFirmwareLoading: boolean;
  updateDeploymentLoading: boolean;
  uploadFirmwareLoading: boolean;

  // Error states
  fetchFirmwareError: string | null;
  fetchDeploymentsError: string | null;
  createFirmwareError: string | null;
  deployFirmwareError: string | null;
  updateDeploymentError: string | null;
  uploadFirmwareError: string | null;

  // Actions
  fetchFirmwareList: (params?: PaginationParams & { robotModel?: string }) => Promise<void>;
  fetchFirmwareById: (id: string) => Promise<FirmwareRecord | null>;
  createFirmware: (data: CreateFirmwareDto) => Promise<FirmwareRecord | null>;
  fetchLatestForModel: (model: string) => Promise<FirmwareRecord | null>;
  deployFirmware: (data: DeployFirmwareDto) => Promise<FirmwareDeployment | null>;
  fetchRobotDeployments: (robotId: string) => Promise<void>;
  updateDeploymentStatus: (id: string, data: UpdateDeploymentDto) => Promise<FirmwareDeployment | null>;
  uploadFirmware: (file: File, metadata: CreateFirmwareDto) => Promise<FirmwareRecord | null>;
  clearErrors: () => void;
  clearFirmwareList: () => void;
}

export const useFirmwareStore = create<FirmwareState>((set, get) => ({
  firmwareList: [],
  firmwareListPagination: null,
  deployments: [],
  history: [],
  selectedFirmware: null,
  latestFirmware: {},

  fetchFirmwareLoading: false,
  fetchDeploymentsLoading: false,
  createFirmwareLoading: false,
  deployFirmwareLoading: false,
  updateDeploymentLoading: false,
  uploadFirmwareLoading: false,

  fetchFirmwareError: null,
  fetchDeploymentsError: null,
  createFirmwareError: null,
  deployFirmwareError: null,
  updateDeploymentError: null,
  uploadFirmwareError: null,

  fetchFirmwareList: async (params) => {
    set({ fetchFirmwareLoading: true, fetchFirmwareError: null });
    try {
      const result = await firmwareService.getFirmwareList(params);
      set({
        firmwareList: result.items,
        firmwareListPagination: result.pagination,
        fetchFirmwareLoading: false,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to fetch firmware list';
      set({ fetchFirmwareError: msg, fetchFirmwareLoading: false });
    }
  },

  fetchFirmwareById: async (id) => {
    try {
      const firmware = await firmwareService.getFirmwareById(id);
      set({ selectedFirmware: firmware });
      return firmware;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to fetch firmware';
      set({ fetchFirmwareError: msg });
      return null;
    }
  },

  createFirmware: async (data) => {
    set({ createFirmwareLoading: true, createFirmwareError: null });
    try {
      const firmware = await firmwareService.createFirmware(data);
      set({ createFirmwareLoading: false });
      return firmware;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to create firmware';
      set({ createFirmwareError: msg, createFirmwareLoading: false });
      return null;
    }
  },

  fetchLatestForModel: async (model) => {
    try {
      const firmware = await firmwareService.getLatestFirmwareForModel(model);
      set(state => ({ latestFirmware: { ...state.latestFirmware, [model]: firmware } }));
      return firmware;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to fetch latest firmware';
      set({ fetchFirmwareError: msg });
      return null;
    }
  },

  deployFirmware: async (data) => {
    set({ deployFirmwareLoading: true, deployFirmwareError: null });
    try {
      const deployment = await firmwareService.deployFirmware(data);
      set(state => ({ deployments: [deployment, ...state.deployments], deployFirmwareLoading: false }));
      return deployment;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to deploy firmware';
      set({ deployFirmwareError: msg, deployFirmwareLoading: false });
      return null;
    }
  },

  fetchRobotDeployments: async (robotId) => {
    set({ fetchDeploymentsLoading: true, fetchDeploymentsError: null });
    try {
      const deployments = await firmwareService.getRobotDeployments(robotId);
      const history = firmwareService.transformToHistory(deployments);
      set({ deployments, history, fetchDeploymentsLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to fetch deployments';
      set({ fetchDeploymentsError: msg, fetchDeploymentsLoading: false });
    }
  },

  updateDeploymentStatus: async (id, data) => {
    set({ updateDeploymentLoading: true, updateDeploymentError: null });
    try {
      const deployment = await firmwareService.updateDeploymentStatus(id, data);
      set(state => ({
        deployments: state.deployments.map(d => d.id === id ? deployment : d),
        updateDeploymentLoading: false,
      }));
      return deployment;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update deployment';
      set({ updateDeploymentError: msg, updateDeploymentLoading: false });
      return null;
    }
  },

  uploadFirmware: async (file, metadata) => {
    set({ uploadFirmwareLoading: true, uploadFirmwareError: null });
    try {
      const firmware = await firmwareService.uploadFirmwareFile(file, metadata);
      set(state => ({
        firmwareList: [firmware, ...state.firmwareList],
        uploadFirmwareLoading: false,
      }));
      return firmware;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to upload firmware';
      set({ uploadFirmwareError: msg, uploadFirmwareLoading: false });
      return null;
    }
  },

  clearErrors: () => set({
    fetchFirmwareError: null,
    fetchDeploymentsError: null,
    createFirmwareError: null,
    deployFirmwareError: null,
    updateDeploymentError: null,
    uploadFirmwareError: null,
  }),

  clearFirmwareList: () => set({ firmwareList: [], firmwareListPagination: null }),
}));

export const useFirmware = () => {
  const store = useFirmwareStore();
  return {
    firmwareList: store.firmwareList,
    firmwareListPagination: store.firmwareListPagination,
    deployments: store.deployments,
    history: store.history,
    selectedFirmware: store.selectedFirmware,
    latestFirmware: store.latestFirmware,

    fetchFirmwareLoading: store.fetchFirmwareLoading,
    fetchDeploymentsLoading: store.fetchDeploymentsLoading,
    createFirmwareLoading: store.createFirmwareLoading,
    deployFirmwareLoading: store.deployFirmwareLoading,
    updateDeploymentLoading: store.updateDeploymentLoading,
    uploadFirmwareLoading: store.uploadFirmwareLoading,

    fetchFirmwareError: store.fetchFirmwareError,
    fetchDeploymentsError: store.fetchDeploymentsError,
    createFirmwareError: store.createFirmwareError,
    deployFirmwareError: store.deployFirmwareError,
    updateDeploymentError: store.updateDeploymentError,
    uploadFirmwareError: store.uploadFirmwareError,

    fetchFirmwareList: store.fetchFirmwareList,
    fetchFirmwareById: store.fetchFirmwareById,
    createFirmware: store.createFirmware,
    fetchLatestForModel: store.fetchLatestForModel,
    deployFirmware: store.deployFirmware,
    fetchRobotDeployments: store.fetchRobotDeployments,
    updateDeploymentStatus: store.updateDeploymentStatus,
    uploadFirmware: store.uploadFirmware,
    clearErrors: store.clearErrors,
    clearFirmwareList: store.clearFirmwareList,
  };
};