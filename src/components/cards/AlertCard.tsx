import React from 'react';
import { AlertCircle, CheckCircle, Eye, Loader2 } from 'lucide-react';

export interface Alert {
  id: string;
  robotId: string;
  robot: {
    name: string;
    serialNumber?: string;
    code?: string;
  };
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
}

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (id: string) => Promise<void>;
  onResolve?: (id: string) => Promise<void>;
  isProcessing?: boolean;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onAcknowledge,
  onResolve,
  isProcessing,
}) => {
  const severityColors = {
    INFO: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
    WARNING: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
    CRITICAL: 'border-red-500/20 bg-red-500/5 text-red-400',
  };

  const statusLabels = {
    ACTIVE: { label: 'Active', style: 'bg-red-500/10 text-red-400 border border-red-500/20' },
    ACKNOWLEDGED: { label: 'Acknowledged', style: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
    RESOLVED: { label: 'Resolved', style: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  };

  return (
    <div className={`border rounded-2xl p-5 bg-black/40 backdrop-blur-md transition-all duration-300 ${severityColors[alert.severity] || 'border-white/5 bg-[#0A0A0C]'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs uppercase tracking-wider font-semibold text-gray-300">
                {alert.robot?.name || 'Robot System'}
              </span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${statusLabels[alert.status].style}`}>
                {statusLabels[alert.status].label}
              </span>
            </div>
            <p className="text-sm font-medium text-white mt-1.5 leading-relaxed">{alert.message}</p>
            <p className="text-xs text-gray-500 mt-2">
              Triggered: {new Date(alert.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {alert.status !== 'RESOLVED' && (
          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
            {alert.status === 'ACTIVE' && onAcknowledge && (
              <button
                onClick={() => onAcknowledge(alert.id)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                Ack
              </button>
            )}
            {onResolve && (
              <button
                onClick={() => onResolve(alert.id)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Resolve
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
