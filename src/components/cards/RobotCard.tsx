"use client";
import { Bot, Wifi, WifiOff, Wrench, AlertTriangle, Droplets } from 'lucide-react';
import { Robot, RobotStatus } from '@/types/robot.types';

interface RobotCardProps {
  robot: Robot;
  onStatusChange?: (id: string, status: RobotStatus) => void;
  isAdmin?: boolean;
}

const statusConfig: Record<RobotStatus, { label: string; color: string; icon: React.ElementType; glow: string }> = {
  ACTIVE: { label: 'Online', color: 'text-emerald-400', icon: Wifi, glow: 'shadow-[0_0_12px_rgba(52,211,153,0.3)]' },
  INACTIVE: { label: 'Offline', color: 'text-gray-500', icon: WifiOff, glow: '' },
  MAINTENANCE: { label: 'Maintenance', color: 'text-amber-400', icon: Wrench, glow: 'shadow-[0_0_12px_rgba(251,191,36,0.2)]' },
  ERROR: { label: 'Error', color: 'text-red-400', icon: AlertTriangle, glow: 'shadow-[0_0_12px_rgba(248,113,113,0.3)]' },
};

export default function RobotCard({ robot, onStatusChange, isAdmin }: RobotCardProps) {
  const config = statusConfig[robot.status];
  const StatusIcon = config.icon;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`bg-[#0A0A0C] border border-white/5 rounded-2xl p-6 shadow-lg shadow-black/50 hover:border-white/10 transition-all duration-300 group relative overflow-hidden ${config.glow}`}>
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#0066CC]/5 blur-[60px] group-hover:bg-[#0066CC]/10 transition-colors pointer-events-none" />

      {/* Header row */}
      <div className="flex items-start justify-between mb-4 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
            <Bot className="w-5 h-5 text-[#00D6FF]" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">{robot.name || robot.code}</h4>
            <p className="text-[11px] text-gray-500 font-mono">{robot.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Model</p>
          <p className="text-sm font-medium text-white">{robot.model}</p>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Water Generated</p>
          <div className="flex items-baseline gap-1">
            <Droplets className="w-3.5 h-3.5 text-[#00D6FF]" />
            <span className="text-sm font-medium text-white">{robot.waterGenerated}L</span>
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-3 border-t border-white/5">
        <span>Registered {formatDate(robot.createdAt)}</span>
        {robot.owner && (
          <span className="text-gray-400">{robot.owner.firstName} {robot.owner.lastName}</span>
        )}
      </div>

      {/* Admin status controls */}
      {isAdmin && onStatusChange && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Change Status</p>
          <div className="flex gap-2">
            {(['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as RobotStatus[])
              .filter(s => s !== robot.status)
              .map(status => (
                <button
                  key={status}
                  onClick={() => onStatusChange(robot.id, status)}
                  className={`flex-1 py-2 text-[11px] font-medium rounded-lg border transition-colors cursor-pointer ${
                    status === 'ACTIVE'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                      : status === 'MAINTENANCE'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {status === 'ACTIVE' ? 'Activate' : status === 'MAINTENANCE' ? 'Maintain' : 'Deactivate'}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
