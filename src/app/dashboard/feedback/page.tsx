"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/services/api.service';
import { MessageCircle, Send, Star, Loader2, CheckCircle } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { CardSkeleton } from '@/components/Skeleton';

export default function FeedbackTracker() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // My Feedback State & Pagination
  const [myFeedback, setMyFeedback] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [paginationData, setPaginationData] = useState<any>(null);

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get('/feedback/me', {
        params: { page, limit }
      });
      if (res.data.success) {
        setMyFeedback(res.data.data);
        setPaginationData(res.data.pagination);
      }
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  }, [page, limit]);

  useEffect(() => {
    void fetchFeedback();
  }, [fetchFeedback, submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setIsSubmitting(true);
    try {
      await axiosInstance.post('/feedback', { subject, message, category, rating: rating || undefined });
      setSubmitted(true);
      setSubject('');
      setMessage('');
      setRating(0);
      setPage(1); // Go back to first page to see the new submission
      setTimeout(() => setSubmitted(false), 3000);
    } catch { /* silent */ }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-1">User Feedback</h2>
        <p className="text-gray-500 font-light text-sm">Voice your thoughts directly to the product engineering team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Submit Form */}
        <div className="lg:col-span-5">
          <form onSubmit={handleSubmit} className="bg-[#0A0A0C] border border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#00D6FF]/10 flex items-center justify-center border border-[#00D6FF]/20">
                <MessageCircle className="w-5 h-5 text-[#00D6FF]" />
              </div>
              <h3 className="font-semibold text-white text-sm">Submit Feedback</h3>
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00D6FF] cursor-pointer">
                <option value="general">General</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="performance">Performance</option>
                <option value="ui">UI/UX</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary..."
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00D6FF] placeholder:text-gray-600" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your feedback in detail..."
                rows={5} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00D6FF] placeholder:text-gray-600 resize-none" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Rating (Optional)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer">
                    <Star className={`w-6 h-6 transition-colors ${(hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting || !subject.trim() || !message.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : submitted ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Send className="w-4 h-4" />}
              {isSubmitting ? 'Submitting...' : submitted ? 'Submitted!' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        {/* Previous Feedback */}
        <div className="lg:col-span-7 space-y-4 flex flex-col h-full">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Your Submissions</h3>

          {isLoading ? (
            <CardSkeleton count={limit} gridColsClass="grid-cols-1" />
          ) : myFeedback.length === 0 ? (
            <div className="bg-[#0A0A0C] border border-white/5 rounded-3xl p-12 text-center shadow-2xl">
              <p className="text-gray-500 text-sm font-light">No feedback submitted yet. Share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myFeedback.map((fb) => (
                <div key={fb.id} className="bg-[#0A0A0C] border border-white/5 rounded-2xl p-6 shadow-lg hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{fb.subject}</h4>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{fb.category || 'General'} · {new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                      fb.status === 'RESPONDED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : fb.status === 'REVIEWED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-white/5 text-gray-400 border-white/10'
                    }`}>{fb.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-light leading-relaxed mb-3">{fb.message}</p>
                  {fb.rating > 0 && (
                    <div className="flex gap-0.5 mb-3">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-700'}`} />)}
                    </div>
                  )}
                  {fb.response && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Admin Response</p>
                      <p className="text-xs text-[#00D6FF] font-light leading-relaxed">{fb.response}</p>
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
      </div>
    </div>
  );
}
