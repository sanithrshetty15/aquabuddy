export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    list: '/users',
    delete: (id: string) => `/users/${id}`,
  },
  robots: {
    list: '/robots',
    create: '/robots',
    link: '/robots/link',
    details: (id: string) => `/robots/${id}`,
    command: (id: string) => `/robots/${id}/command`,
    updateStatus: (id: string) => `/robots/${id}/status`,
  },
  sensors: {
    history: (robotId: string) => `/sensors/${robotId}/history`,
    latest: (robotId: string) => `/sensors/${robotId}/latest`,
  },
  analytics: {
    overview: '/analytics/overview',
    dashboard: '/analytics/dashboard',
  },
  predictions: {
    get: (robotId: string) => `/predictions/${robotId}`,
  },
  alerts: {
    list: '/alerts',
    acknowledge: (id: string) => `/alerts/${id}/acknowledge`,
    resolve: (id: string) => `/alerts/${id}/resolve`,
  },
  feedback: {
    submit: '/feedback',
    list: '/feedback',
    respond: (id: string) => `/feedback/${id}/respond`,
  },
  map: {
    robots: '/map/robots',
    history: (id: string) => `/map/robot/${id}/history`,
  },
  admin: {
    stats: '/admin/stats',
    users: '/admin/users',
    deleteUser: (id: string) => `/admin/users/${id}`,
  },
  firmware: {
    list: '/firmware',
    get: (id: string) => `/firmware/${id}`,
    create: '/firmware',
    latestForModel: (model: string) => `/firmware/model/${model}/latest`,
    deploy: '/firmware/deploy',
    deployments: (robotId: string) => `/firmware/deployments/robot/${robotId}`,
    updateDeployment: (id: string) => `/firmware/deployments/${id}`,
    upload: '/firmware/upload',
  },
};
