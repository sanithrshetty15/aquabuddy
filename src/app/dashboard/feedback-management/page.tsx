"use client";
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/services/api.service';
import { MessageCircle, Loader2, Send, Star, Filter, Search, RefreshCw } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { CardSkeleton } from '@/components/Skeleton';

interface FeedbackItem {
  id: string;
  subject: string;
  message: string;
  category?: string;
  rating?: number;
  status: string;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
}

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search, Status, Pagination States
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationData, setPaginationData] = useState<any>(null);

  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await axiosInstance.get('/feedback', { params });
      if (res.data.success) {
        setFeedbacks(res.data.data);
        setPaginationData(res.data.pagination);
      }
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  }, [page, limit, statusFilter, search]);

  useEffect(() => {
    void fetchFeedback();
  }, [fetchFeedback]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchFeedback();
  };

  const handleRespond = async (id: string) => {
    if (!responseText.trim()) return;
    setIsSending(true);
    try {
      const res = await axiosInstance.patch(`/feedback/${id}/respond`, { response: responseText });
      if (res.data.success) {
        setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, ...res.data.data } : f));
        setRespondingId(null);
        setResponseText('');
      }
    } catch { /* silent */ }
    finally { setIsSending(false); }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Feedback Management</h2>
          <p className="text-gray-500 font-light text-sm">Review and respond to user feedback submissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void fetchFeedback()}
            disabled={isLoading}
            className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white rounded-xl text-gray-400 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-xs text-gray-500">
            {paginationData?.total || feedbacks.length} items total
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#0A0A0C] border border-white/5 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search feedback text, email... (Press Enter)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00D6FF] transition-all"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-[#050505] border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#00D6FF] cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="RESPONDED">Responded</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <CardSkeleton count={limit} gridColsClass="grid-cols-1" />
      ) : feedbacks.length === 0 ? (
        <div className="bg-[#0A0A0C] border border-white/5 rounded-3xl p-12 text-center shadow-2xl">
          <MessageCircle className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-light">No feedback matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map(fb => (
            <div key={fb.id} className="bg-[#0A0A0C] border border-white/5 rounded-2xl p-6 shadow-lg hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">{fb.subject}</h4>
                  <p className="text-[10px] text-gray-500">
                    {fb.user.firstName} {fb.user.lastName} ({fb.user.email}) · {fb.category || 'General'} · {new Date(fb.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border flex-shrink-0 ${
                  fb.status === 'RESPONDED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : fb.status === 'REVIEWED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-white/5 text-gray-400 border-white/10'
                }`}>{fb.status}</span>
              </div>

              <p className="text-xs text-gray-400 font-light leading-relaxed mb-3">{fb.message}</p>

              {fb.rating && fb.rating > 0 && (
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= fb.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-700'}`} />)}
                </div>
              )}

              {fb.response && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Your Response</p>
                  <p className="text-xs text-[#00D6FF] font-light leading-relaxed">{fb.response}</p>
                </div>
              )}

              {fb.status !== 'RESPONDED' && (
                <div className="mt-4">
                  {respondingId === fb.id ? (
                    <div className="flex gap-2">
                      <input type="text" value={responseText} onChange={(e) => setResponseText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRespond(fb.id)}
                        placeholder="Type your response..."
                        className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00D6FF]" />
                      <button onClick={() => handleRespond(fb.id)} disabled={isSending || !responseText.trim()}
                        className="px-4 py-2.5 bg-[#00D6FF]/10 border border-[#00D6FF]/20 rounded-xl text-[#00D6FF] text-xs font-semibold hover:bg-[#00D6FF]/20 transition-colors disabled:opacity-50 cursor-pointer">
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                      <button onClick={() => { setRespondingId(null); setResponseText(''); }}
                        className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-xs hover:bg-white/10 transition-colors cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setRespondingId(fb.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                      <Send className="w-3.5 h-3.5" /> Respond
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

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
