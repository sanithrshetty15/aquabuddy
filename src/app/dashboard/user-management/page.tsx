"use client";
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/services/api.service';
import { Loader2, Trash2, Shield, User, Search, RefreshCw } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { TableSkeleton } from '@/components/Skeleton';

interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  _count: { robots: number; feedbacks: number };
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search, Filtering, and Pagination state
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationData, setPaginationData] = useState<any>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (role !== 'ALL') params.role = role;

      const res = await axiosInstance.get('/admin/users', { params });
      if (res.data.success) {
        setUsers(res.data.data);
        setPaginationData(res.data.pagination);
      }
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  }, [page, limit, role, search]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      void fetchUsers();
    } catch { /* silent */ }
    finally { setDeletingId(null); }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">User Management</h2>
          <p className="text-foreground/60 font-light text-sm">View and manage platform users.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void fetchUsers()}
            disabled={isLoading}
            className="p-2.5 bg-secondaryBg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground text-foreground/75 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-black/10 dark:border-white/10 text-foreground rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-accent"
          />
          <Search className="w-4 h-4 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Role:</span>
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="bg-background border border-black/10 dark:border-white/10 text-foreground rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={limit} cols={5} />
      ) : users.length === 0 ? (
        <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-12 text-center shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
          <User className="w-8 h-8 opacity-40 text-foreground/50 mb-3" />
          <h3 className="text-foreground font-semibold text-sm mb-1">No users found</h3>
          <p className="text-foreground/50 text-xs font-light">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 bg-background/20">
                  <th className="text-left px-6 py-4 text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">Role</th>
                  <th className="text-center px-6 py-4 text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">Robots</th>
                  <th className="text-left px-6 py-4 text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">Joined</th>
                  <th className="text-right px-6 py-4 text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-background/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0066CC] to-[#00D6FF] flex items-center justify-center text-[10px] font-bold text-white">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{u.firstName} {u.lastName}</p>
                          <p className="text-[10px] text-foreground/50">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-background/20 text-foreground/50 border-black/10 dark:border-white/10'
                      }`}>
                        {u.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-foreground/80">{u._count.robots}</td>
                    <td className="px-6 py-4 text-xs text-foreground/50">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button onClick={() => handleDelete(u.id)} disabled={deletingId === u.id}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-foreground/50 hover:text-red-400 transition-colors disabled:opacity-50 cursor-pointer">
                          {deletingId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginationData && (
            <Pagination
              page={page}
              totalPages={paginationData.totalPages}
              onPageChange={setPage}
              limit={limit}
              onLimitChange={(l) => { setLimit(l); setPage(1); }}
              hasNext={paginationData.hasNext}
              hasPrev={paginationData.hasPrev}
              total={paginationData.total}
            />
          )}
        </div>
      )}
    </div>
  );
}
