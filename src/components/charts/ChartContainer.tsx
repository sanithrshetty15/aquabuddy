import React from 'react';
import { Loader2 } from 'lucide-react';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  isLoading,
  children,
}) => {
  return (
    <div className="relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:border-[#00D6FF]/20 hover:shadow-[0_0_30px_rgba(0,214,255,0.02)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-200 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 font-light mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="relative min-h-[220px] w-full flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#00D6FF]" />
            <span className="text-xs text-gray-500 font-medium tracking-wide">Retrieving telemetry streams...</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
