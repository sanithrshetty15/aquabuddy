import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  limit: number;
  onLimitChange?: (newLimit: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
  total?: number;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  limit,
  onLimitChange,
  hasNext,
  hasPrev,
  total,
}: PaginationProps) {
  if (totalPages <= 1 && total === 0) return null;

  // Generate range of page numbers to display
  const getPageNumbers = () => {
    const range: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl w-full backdrop-blur-md">
      <div className="text-xs text-foreground/50 font-light">
        {total !== undefined ? (
          <span>
            Showing <span className="text-foreground font-medium">{Math.min(total, (page - 1) * limit + 1)}</span> to{' '}
            <span className="text-foreground font-medium">{Math.min(total, page * limit)}</span> of{' '}
            <span className="text-foreground font-medium">{total}</span> records
          </span>
        ) : (
          <span>
            Page <span className="text-foreground font-medium">{page}</span> of{' '}
            <span className="text-foreground font-medium">{totalPages || 1}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-foreground/50 font-semibold">Rows:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value))}
              className="bg-background border border-black/10 dark:border-white/10 text-foreground rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-accent transition-all cursor-pointer"
            >
              {[10, 20, 50, 100].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrev}
            className="p-1.5 rounded-lg border border-black/5 dark:border-white/5 bg-background hover:bg-black/5 dark:hover:bg-white/10 text-foreground/70 hover:text-foreground transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                page === p
                  ? 'bg-gradient-to-r from-accent to-accentGlow text-white border border-accent/30 shadow-md scale-105'
                  : 'border border-black/5 dark:border-white/5 bg-background hover:bg-black/5 dark:hover:bg-white/10 text-foreground/75 hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext}
            className="p-1.5 rounded-lg border border-black/5 dark:border-white/5 bg-background hover:bg-black/5 dark:hover:bg-white/10 text-foreground/70 hover:text-foreground transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
