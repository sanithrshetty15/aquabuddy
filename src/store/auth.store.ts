import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  csrfToken: string | null;
  setAuth: (user: User) => void;
  setCsrfToken: (token: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      csrfToken: null,

      setAuth: (user) => {
        set({ user, isAuthenticated: true });
      },

      setCsrfToken: (csrfToken) => {
        set({ csrfToken });
      },

      clearAuth: () => {
        set({ user: null, isAuthenticated: false, csrfToken: null });
      },
    }),
    {
      name: 'aquabuddy_auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
