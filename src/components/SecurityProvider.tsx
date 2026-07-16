"use client";
import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { fetchCsrfToken } from '@/services/auth.service';

interface SecurityProviderProps {
  children: React.ReactNode;
}

/**
 * SecurityProvider initializes the session-specific CSRF token on mount
 * if the user has an active session.
 */
export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { isAuthenticated, setCsrfToken } = useAuthStore();

  useEffect(() => {
    const initSecurity = async () => {
      if (isAuthenticated) {
        const token = await fetchCsrfToken();
        setCsrfToken(token);
      }
    };
    void initSecurity();
  }, [isAuthenticated, setCsrfToken]);

  return <>{children}</>;
};
