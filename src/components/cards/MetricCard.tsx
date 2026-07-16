import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: 'cyan' | 'blue' | 'amber' | 'emerald' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  color = 'cyan',
}) => {
  const colorMap = {
    cyan: {
      bg: 'bg-[#00D6FF]/10',
      text: 'text-[#00D6FF]',
      border: 'hover:border-[#00D6FF]/30',
      glow: 'hover:shadow-[0_0_30px_rgba(0,214,255,0.05)]',
    },
    blue: {
      bg: 'bg-[#0066CC]/10',
      text: 'text-[#00D6FF]',
      border: 'hover:border-[#0066CC]/30',
      glow: 'hover:shadow-[0_0_30px_rgba(0,102,204,0.05)]',
    },
    amber: {
      bg: 'bg-[#F59E0B]/10',
      text: 'text-[#F59E0B]',
      border: 'hover:border-[#F59E0B]/30',
      glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.05)]',
    },
    emerald: {
      bg: 'bg-[#10B981]/10',
      text: 'text-[#10B981]',
      border: 'hover:border-[#10B981]/30',
      glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.05)]',
    },
    rose: {
      bg: 'bg-[#EF4444]/10',
      text: 'text-[#EF4444]',
      border: 'hover:border-[#EF4444]/30',
      glow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.05)]',
    },
  };

  const style = colorMap[color];

  return (
    <div className={`relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 transition-all duration-300 ${style.border} ${style.glow}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{title}</span>
        <div className={`p-2.5 rounded-2xl ${style.bg} ${style.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-3xl font-bold tracking-tight text-white">{value}</h4>
        {description && <p className="text-xs text-gray-400 mt-1 font-light">{description}</p>}
      </div>
    </div>
  );
};
