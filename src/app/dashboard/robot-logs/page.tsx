"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRobot } from '@/hooks/useRobot';
import { Terminal, RefreshCw, Trash2, Filter, Loader2 } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  robotName: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM';
  message: string;
}

const mockLogTemplates = [
  { level: 'INFO', message: 'Hygrometer sensor reading synchronized with cloud gateway' },
  { level: 'INFO', message: 'Atmospheric intake fan cycle started at 1200 RPM' },
  { level: 'WARN', message: 'Slight reduction in intake pressure detected. Check filter status' },
  { level: 'INFO', message: 'Condenser collection tray level updated: 42.5 L' },
  { level: 'ERROR', message: 'Compressor thermal threshold warning. Initiating safe ventilation' },
  { level: 'SYSTEM', message: 'Cloud link established successfully via secure secure-mqtt' },
  { level: 'INFO', message: 'Firmware validation check completed. Running v1.2.4' },
];

export default function RobotLogsPage() {
  const { robots, fetchRobots } = useRobot();
  const [selectedRobotId, setSelectedRobotId] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetchRobots();
    
    // Seed initial logs
    const initialLogs: LogEntry[] = Array.from({ length: 15 }).map((_, idx) => {
      const template = mockLogTemplates[Math.floor(Math.random() * mockLogTemplates.length)];
      return {
        id: `log-${Date.now()}-${idx}`,
        timestamp: new Date(Date.now() - (15 - idx) * 30000).toLocaleTimeString(),
        robotName: 'System Core',
        level: template.level as any,
        message: template.message,
      };
    });
    setLogs(initialLogs);
  }, [fetchRobots]);

  // Simulate streaming logs
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const template = mockLogTemplates[Math.floor(Math.random() * mockLogTemplates.length)];
      const targetRobot = robots.length > 0 
        ? robots[Math.floor(Math.random() * robots.length)] 
        : { name: 'System Gate' };

      const newEntry: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        robotName: targetRobot.name,
        level: template.level as any,
        message: template.message,
      };

      setLogs((prev) => [...prev.slice(-49), newEntry]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isStreaming, robots]);

  // Scroll to bottom when logs update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    const matchesRobot = selectedRobotId === 'all' || log.robotName === robots.find(r => r.id === selectedRobotId)?.name;
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesRobot && matchesLevel;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-400 font-bold';
      case 'WARN': return 'text-amber-400 font-semibold';
      case 'SYSTEM': return 'text-cyan-400 font-bold';
      default: return 'text-foreground/70';
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">System & Robot Logs</h2>
          <p className="text-foreground/60 font-light text-sm">Real-time terminal stream from active fleet units.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Robot Selector */}
          <select
            value={selectedRobotId}
            onChange={(e) => setSelectedRobotId(e.target.value)}
            className="bg-secondaryBg border border-black/10 dark:border-white/10 text-foreground rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Devices</option>
            {robots.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-secondaryBg border border-black/10 dark:border-white/10 text-foreground rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isStreaming 
                ? 'bg-accent/10 border-accent/20 text-accent' 
                : 'bg-secondaryBg border-black/10 dark:border-white/10 text-foreground/75'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isStreaming ? 'animate-spin' : ''}`} />
            {isStreaming ? 'Live' : 'Paused'}
          </button>

          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-secondaryBg border border-black/10 dark:border-white/10 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Terminal Board */}
      <div className="bg-[#050508] border border-black/15 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[550px] relative">
        <div className="bg-[#0A0A0E] px-6 py-4 border-b border-black/20 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono tracking-wider text-foreground/80 uppercase">Root Console Console Output</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
          </div>
        </div>

        <div 
          ref={logContainerRef}
          className="flex-1 p-6 font-mono text-xs overflow-y-auto space-y-2 select-text custom-scrollbar bg-black/40"
        >
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 hover:bg-white/[0.01] py-1 rounded transition-colors px-2">
              <span className="text-foreground/40 text-[10px] w-20 flex-shrink-0">{log.timestamp}</span>
              <span className="text-accent/60 w-32 flex-shrink-0 truncate">{log.robotName}</span>
              <span className={`w-16 flex-shrink-0 text-[10px] tracking-wide uppercase ${getLevelColor(log.level)}`}>
                [{log.level}]
              </span>
              <span className="text-foreground/85 flex-1">{log.message}</span>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="h-full flex items-center justify-center flex-col text-foreground/30 gap-2">
              <Terminal className="w-10 h-10 opacity-20" />
              <p className="text-xs">No matching system outputs streaming...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
