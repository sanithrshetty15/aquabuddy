import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';
import * as authService from '../services/auth.service';

export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, setCsrfToken, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: Record<string, string>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      const { user: loggedUser } = response.data;
      
      // Update local state user
      setAuth(loggedUser);

      // Immediately fetch CSRF token for subsequent requests
      const csrfToken = await authService.fetchCsrfToken();
      setCsrfToken(csrfToken);

      router.push('/dashboard');
      return { success: true };
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      const { user: registeredUser } = response.data;
      
      // Update local state user
      setAuth(registeredUser);

      // Immediately fetch CSRF token for subsequent requests
      const csrfToken = await authService.fetchCsrfToken();
      setCsrfToken(csrfToken);

      router.push('/dashboard');
      return { success: true };
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Registration failed. Please try again.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
      setIsLoading(false);
      router.push('/login');
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
  };
};
