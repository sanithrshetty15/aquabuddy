"use client";
import { DashboardShell } from "@/components/DashboardShell";
import { AuthGuard } from "@/components/guards/AuthGuard";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ErrorBoundary>
        <DashboardShell>{children}</DashboardShell>
      </ErrorBoundary>
    </AuthGuard>
  );
}
