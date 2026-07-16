import { systemHealthRepository } from '../repositories';

export const getHealthStatus = async () => {
  const latest = await systemHealthRepository.getLatest();
  const allHealthy = latest.every((h: any) => h.status === 'healthy' || h.status === 'ok');
  return {
    status: allHealthy ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    components: latest,
  };
};

export const getComponentHealth = async (component: string) => {
  return systemHealthRepository.getByComponent(component);
};

export const getRecentComponentHealth = async () => {
  return systemHealthRepository.getRecentByComponent();
};

export const recordHealthCheck = async (data: { component: string; status: string; message?: string; latencyMs?: number }) => {
  return systemHealthRepository.create(data);
};
