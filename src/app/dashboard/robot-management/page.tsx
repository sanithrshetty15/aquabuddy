"use client";
import { useEffect, useState, useCallback } from 'react';
import { useRobot } from '@/hooks/useRobot';
import { useAuthStore } from '@/store/auth.store';
import { Robot, RobotStatus } from '@/types/robot.types';
import RobotCard from '@/components/cards/RobotCard';
import Pagination from '@/components/Pagination';
import { CardSkeleton } from '@/components/Skeleton';
import {
  Loader2, Bot, Search, Plus, X
} from 'lucide-react';

export default function RobotManagementPage() {
  const user = useAuthStore((s) => s.user);
  const {
    robots, fetchRobots, updateRobotStatus, createRobot,
    fetchRobotsLoading, isLoading, error, robotsPagination
  } = useRobot();

  // Server-side search & filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RobotStatus>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRobot, setNewRobot] = useState({ code: '', name: '', model: 'AQB-CLASSIC', lat: 0, lng: 0 });
  const [createSuccess, setCreateSuccess] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const doFetch = useCallback(() => {
    const params: any = { page, limit };
    if (search.trim()) params.search = search.trim();
    if (statusFilter !== 'ALL') params.status = statusFilter;
    void fetchRobots(params);
  }, [page, limit, statusFilter, fetchRobots, search]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    doFetch();
  };

  const handleStatusChange = async (id: string, status: RobotStatus) => {
    await updateRobotStatus(id, status);
    doFetch();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await createRobot(newRobot);
    if (ok) {
      setCreateSuccess(true);
      setNewRobot({ code: '', name: '', model: 'AQB-CLASSIC', lat: 0, lng: 0 });
      setTimeout(() => {
        setCreateSuccess(false);
        setShowCreateForm(false);
      }, 1500);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
            {isAdmin ? 'Robot Management' : 'My Robots'}
          </h2>
          <p className="text-gray-500 font-light text-sm">
            {isAdmin ? 'Manage all robots in the fleet.' : 'View and monitor your linked robots.'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm cursor-pointer"
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateForm ? 'Cancel' : 'Add Robot'}
          </button>
        )}
      </div>

      {/* Create Robot Form (Admin) */}
      {showCreateForm && isAdmin && (
        <div className="mb-8 bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 shadow-lg">
          <h3 className="text-white font-semibold text-sm mb-4">Register New Robot</h3>
          {createSuccess ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm text-center">
              Robot registered successfully!
            </div>
          ) : (
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Code *</label>
                <input
                  type="text"
                  placeholder="AQB-XXXXX"
                  value={newRobot.code}
                  onChange={(e) => setNewRobot({ ...newRobot, code: e.target.value.toUpperCase() })}
                  required
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00D6FF]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Name *</label>
                <input
                  type="text"
                  placeholder="Robot name"
                  value={newRobot.name}
                  onChange={(e) => setNewRobot({ ...newRobot, name: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00D6FF]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Model</label>
                <select
                  value={newRobot.model}
                  onChange={(e) => setNewRobot({ ...newRobot, model: e.target.value })}
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00D6FF]"
                >
                  <option value="AQB-CLASSIC">Classic</option>
                  <option value="AQB-PRO">Pro</option>
                  <option value="AQB-MAX">Max</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Lat / Lng</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Lat"
                    value={newRobot.lat || ''}
                    onChange={(e) => setNewRobot({ ...newRobot, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00D6FF]"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Lng"
                    value={newRobot.lng || ''}
                    onChange={(e) => setNewRobot({ ...newRobot, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00D6FF]"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#0066CC] text-white font-semibold rounded-xl hover:bg-[#0077DD] disabled:opacity-60 text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Status summary chips */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => { setStatusFilter('ALL'); setPage(1); }}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-white text-black border-white'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          All {robotsPagination ? `(${robotsPagination.total})` : `(${robots.length})`}
        </button>
        {(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ERROR'] as RobotStatus[]).map((status) => {
          const colorMap: Record<string, string> = {
            ACTIVE: statusFilter === status ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
            INACTIVE: statusFilter === status ? 'bg-gray-500 text-white border-gray-500' : 'bg-white/5 border-white/10 text-gray-400',
            MAINTENANCE: statusFilter === status ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-400',
            ERROR: statusFilter === status ? 'bg-red-500 text-white border-red-500' : 'bg-red-500/10 border-red-500/20 text-red-400',
          };
          return (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${colorMap[status]}`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, code, or model... (Press Enter)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#0A0A0C] border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00D6FF] focus:border-[#00D6FF] transition-all"
        />
      </form>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Loading */}
      {fetchRobotsLoading && robots.length === 0 && (
        <CardSkeleton count={limit} />
      )}

      {/* Empty */}
      {!fetchRobotsLoading && robots.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Bot className="w-7 h-7 text-gray-600" />
          </div>
          <p className="text-gray-400 font-medium mb-1">No robots found</p>
          <p className="text-gray-600 text-sm">
            {search ? 'Try adjusting your search query.' : 'Robots will appear here once linked or registered.'}
          </p>
        </div>
      )}

      {/* Robot Grid */}
      {robots.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {robots.map((robot: Robot) => (
              <RobotCard
                key={robot.id}
                robot={robot}
                isAdmin={isAdmin}
                onStatusChange={isAdmin ? handleStatusChange : undefined}
              />
            ))}
          </div>

          {robotsPagination && (
            <div className="mt-6">
              <Pagination
                page={page}
                totalPages={robotsPagination.totalPages}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={(l) => { setLimit(l); setPage(1); }}
                hasNext={robotsPagination.hasNext}
                hasPrev={robotsPagination.hasPrev}
                total={robotsPagination.total}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
