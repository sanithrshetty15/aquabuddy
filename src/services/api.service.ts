import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api.config';
import { useAuthStore } from '../store/auth.store';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending and receiving httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach CSRF Token for state-changing requests
api.interceptors.request.use(
  (config) => {
    // Only send CSRF token on mutating requests
    const mutatingMethods = ['post', 'put', 'delete', 'patch'];
    if (config.method && mutatingMethods.includes(config.method.toLowerCase())) {
      const csrfToken = useAuthStore.getState().csrfToken;
      if (csrfToken && config.headers) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 token refresh automatically
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop on auth endpoints or already retried requests
    if (!error.response || originalRequest.url?.includes('/auth/') || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Post request to refresh endpoint. Server reads refresh token from cookie
        // and sets new access + refresh token cookies automatically.
        await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`,
          {},
          { withCredentials: true }
        );

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
