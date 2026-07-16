"use client";
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/services/api.service';
import { API_ENDPOINTS } from '@/config/api.config';
import { AlertCard } from '@/components/cards/AlertCard';
import { Alert } from '@/components/cards/AlertCard';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { CardSkeleton } from '@/components/Skeleton';

export default function SystemAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Server-side filter & pagination state
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationData, setPaginationData] = useState<any>(null);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = { page, limit };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (severityFilter !== 'ALL') params.severity = severityFilter;

      const res = await axiosInstance.get(API_ENDPOINTS.alerts.list, { params });
      if (res.data.success) {
        setAlerts(res.data.data);
        setPaginationData(res.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch alerts');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, statusFilter, severityFilter]);

  useEffect(() => {
    void fetchAlerts();
  }, [fetchAlerts]);

  const acknowledgeAlert = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await axiosInstance.patch(API_ENDPOINTS.alerts.acknowledge(id));
      if (res.data.success) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === id ? { ...alert, status: 'ACKNOWLEDGED' } : alert
          )
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to acknowledge alert');
    } finally {
      setIsProcessing(false);
    }
  };

  const resolveAlert = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await axiosInstance.patch(API_ENDPOINTS.alerts.resolve(id));
      if (res.data.success) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === id
              ? { ...alert, status: 'RESOLVED', resolvedAt: new Date().toISOString() }
              : alert
          )
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resolve alert');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeAlertsCount = paginationData?.total || alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED').length;

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">System Alerts & Warnings</h2>
          <p className="text-foreground/60 font-light text-sm">
            Review live system warnings, device safety triggers, and milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => void fetchAlerts()}
            disabled={isLoading}
            className="p-2.5 bg-secondaryBg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground rounded-xl text-foreground/60 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {statusFilter === 'ACTIVE' && activeAlertsCount > 0 ? (
            <span className="bg-red-500/10 text-red-400 px-4 py-1.5 rounded-full text-xs font-semibold border border-red-500/20 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              {activeAlertsCount} Active Warning{activeAlertsCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold border border-emerald-500/20">
              System Healthy
            </span>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-background border border-black/10 dark:border-white/10 text-foreground rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="ACTIVE">Active</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
              <option value="ALL">All Alerts</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
              className="bg-background border border-black/10 dark:border-white/10 text-foreground rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-3xl text-sm mb-8">
          {error}
        </div>
      )}

      {/* Main Alerts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-16 text-center shadow-2xl flex flex-col items-center justify-center">
          <p className="text-foreground/50 text-sm font-light">No warnings found matching the filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={acknowledgeAlert}
                onResolve={resolveAlert}
                isProcessing={isProcessing}
              />
            ))}
          </div>

          {/* Pagination Section */}
          {paginationData && paginationData.totalPages > 1 && (
            <div className="mt-8 flex justify-center w-full">
              <Pagination
                page={page}
                totalPages={paginationData.totalPages}
                onPageChange={(newPage) => setPage(newPage)}
                limit={limit}
                hasNext={paginationData.hasNext}
                hasPrev={paginationData.hasPrev}
                total={paginationData.total}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
