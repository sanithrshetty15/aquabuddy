"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useRobotStore } from '@/store/robot.store';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

// Pages restricted FROM Registered Users (no robots linked)
const ACTIVATED_ONLY_PAGES = [
  '/dashboard/analytics',
  '/dashboard/alerts',
  '/dashboard/chat',
  '/dashboard/booking',
  '/dashboard/robot-management',
];

// Pages restricted to Administrator only
const ADMIN_ONLY_PAGES = [
  '/dashboard/live-operations',
  '/dashboard/user-management',
  '/dashboard/feedback-management',
  '/dashboard/remote-control',
  '/dashboard/firmware-management',
  '/dashboard/robot-logs',
  '/dashboard/revenue',
];

// Pages restricted to Platform Owner only
const OWNER_ONLY_PAGES = [
  '/dashboard/platform-settings',
  '/dashboard/database-health',
  '/dashboard/cloud-status',
  '/dashboard/feature-flags',
  '/dashboard/admin-management',
  '/dashboard/audit-logs',
];

/**
 * Client-side auth guard that handles SSR hydration properly.
 * Enforces role-based access: Guest → Registered User → Activated User → Admin
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const robots = useRobotStore((s) => s.robots);
  const fetchRobots = useRobotStore((s) => s.fetchRobots);
  const [isHydrated, setIsHydrated] = useState(false);
  const [robotsFetched, setRobotsFetched] = useState(false);

  useEffect(() => {
    // Wait one tick for zustand to hydrate from localStorage
    setIsHydrated(true);
  }, []);

  // Fetch robots once authenticated to determine Registered vs Activated
  useEffect(() => {
    if (isHydrated && isAuthenticated && !robotsFetched) {
      void fetchRobots().then(() => setRobotsFetched(true));
    }
  }, [isHydrated, isAuthenticated, robotsFetched, fetchRobots]);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.replace('/dashboard');
      return;
    }

    // Wait until robots are fetched before enforcing page restrictions
    if (!robotsFetched && user?.role !== 'ADMIN' && user?.role !== 'OWNER') return;

    const isOwner = user?.role === 'OWNER';
    const isAdmin = user?.role === 'ADMIN';
    const isRegisteredUser = user?.role === 'USER' && robots.length === 0;

    // Block non-owners from owner-only pages
    if (!isOwner && OWNER_ONLY_PAGES.some((p) => pathname.startsWith(p))) {
      router.replace('/dashboard');
      return;
    }

    // Block non-admins and non-owners from admin-only pages
    if (!isAdmin && !isOwner && ADMIN_ONLY_PAGES.some((p) => pathname.startsWith(p))) {
      router.replace('/dashboard');
      return;
    }

    // Block registered users (no robots) from activated-user pages
    if (isRegisteredUser && ACTIVATED_ONLY_PAGES.some((p) => pathname.startsWith(p))) {
      router.replace('/dashboard');
      return;
    }
  }, [isHydrated, isAuthenticated, user?.role, requiredRole, router, pathname, robots.length, robotsFetched]);

  if (!isHydrated || (!robotsFetched && isAuthenticated && user?.role !== 'ADMIN' && user?.role !== 'OWNER')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
          <p className="text-sm text-foreground/50 font-light tracking-wide">Initializing session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
          <p className="text-sm text-foreground/50 font-light tracking-wide">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
          <p className="text-sm text-foreground/50 font-light tracking-wide">Insufficient permissions. Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
