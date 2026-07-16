"use client";

import { Database, Activity, HardDrive, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

const dbMetrics = [
  { label: "Connection Pool", value: "5 / 20", status: "healthy", icon: Activity },
  { label: "Storage Used", value: "142 MB", status: "healthy", icon: HardDrive },
  { label: "Avg Query Time", value: "12ms", status: "healthy", icon: Clock },
  { label: "Active Connections", value: "3", status: "healthy", icon: Database },
];

const tables = [
  { name: "User", rows: 4, size: "48 KB", lastWrite: "2 min ago" },
  { name: "Robot", rows: 2, size: "16 KB", lastWrite: "5 min ago" },
  { name: "SensorReading", rows: 156, size: "1.2 MB", lastWrite: "30 sec ago" },
  { name: "MaintenanceLog", rows: 8, size: "32 KB", lastWrite: "1 hr ago" },
  { name: "Alert", rows: 24, size: "64 KB", lastWrite: "3 min ago" },
  { name: "Feedback", rows: 12, size: "28 KB", lastWrite: "15 min ago" },
];

export default function DatabaseHealthPage() {
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Database className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Database Health</h1>
          <p className="text-sm text-foreground/50 font-light">PostgreSQL instance monitoring — Owner access only</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">All Systems Operational</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dbMetrics.map((m) => (
          <div key={m.label} className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <m.icon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">{m.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Tables List */}
      <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/5">
          <h2 className="text-sm font-semibold text-foreground">Table Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-foreground/40 uppercase tracking-wider border-b border-black/5 dark:border-white/5">
                <th className="text-left px-6 py-3 font-semibold">Table</th>
                <th className="text-left px-6 py-3 font-semibold">Rows</th>
                <th className="text-left px-6 py-3 font-semibold">Size</th>
                <th className="text-left px-6 py-3 font-semibold">Last Write</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {tables.map((t) => (
                <tr key={t.name} className="hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                  <td className="px-6 py-3 font-medium text-foreground">{t.name}</td>
                  <td className="px-6 py-3 text-foreground/70">{t.rows.toLocaleString()}</td>
                  <td className="px-6 py-3 text-foreground/70">{t.size}</td>
                  <td className="px-6 py-3 text-foreground/70">{t.lastWrite}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> OK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 flex items-start gap-4">
        <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Production Database</p>
          <p className="text-xs text-foreground/50 mt-1 leading-relaxed">
            Direct modifications to production data require dual authorization. All queries are logged to the Audit Trail.
          </p>
        </div>
      </div>
    </div>
  );
}
