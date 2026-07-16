import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 5, cols = 5 }: TableSkeletonProps) {
  return (
    <div className="bg-[#0A0A0C] border border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-pulse">
      <div className="border-b border-white/5 bg-white/[0.01] px-6 py-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-white/10 rounded-full flex-1" />
        ))}
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-6 py-5 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-white/5 rounded-lg flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface CardSkeletonProps {
  count?: number;
  gridColsClass?: string;
}

export function CardSkeleton({ count = 3, gridColsClass = 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' }: CardSkeletonProps) {
  return (
    <div className={`grid ${gridColsClass} gap-4 animate-pulse`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#0A0A0C] border border-white/5 rounded-3xl p-6 min-h-[160px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10" />
              <div className="w-20 h-4 bg-white/10 rounded-full" />
            </div>
            <div className="h-5 bg-white/10 rounded-lg w-2/3 mb-2" />
            <div className="h-3 bg-white/5 rounded-lg w-1/2" />
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
            <div className="h-8 bg-white/5 rounded-xl flex-1" />
            <div className="h-8 bg-white/5 rounded-xl flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface TextSkeletonProps {
  lines?: number;
}

export function TextSkeleton({ lines = 3 }: TextSkeletonProps) {
  return (
    <div className="space-y-3 w-full animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 bg-white/5 rounded-full ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}
