"use client";

import { FileText, Filter, Download, User, Shield, Settings, Database, Clock } from "lucide-react";
import { useState } from "react";

type AuditAction = "LOGIN" | "ROLE_CHANGE" | "CONFIG_UPDATE" | "DATA_EXPORT" | "FEATURE_TOGGLE" | "ROBOT_COMMAND";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: AuditAction;
  description: string;
  ipAddress: string;
}

const auditLogs: AuditEntry[] = [
  {
    id: "aud_001",
    timestamp: "2026-07-15 13:45:02",
    actor: "aquabuddytechnologies@gmail.com",
    actorRole: "OWNER",
    action: "FEATURE_TOGGLE",
    description: "Enabled 'Predictive Maintenance' feature flag",
    ipAddress: "103.21.XX.XX",
  },
  {
    id: "aud_002",
    timestamp: "2026-07-15 12:30:15",
    actor: "admin@aquabuddy.com",
    actorRole: "ADMIN",
    action: "ROLE_CHANGE",
    description: "Promoted user priya.k@aquabuddy.com to ADMIN",
    ipAddress: "103.21.XX.XX",
  },
  {
    id: "aud_003",
    timestamp: "2026-07-15 11:12:44",
    actor: "admin@aquabuddy.com",
    actorRole: "ADMIN",
    action: "ROBOT_COMMAND",
    description: "Sent RESTART command to robot AQ-2026-001",
    ipAddress: "103.21.XX.XX",
  },
  {
    id: "aud_004",
    timestamp: "2026-07-15 09:05:33",
    actor: "aquabuddytechnologies@gmail.com",
    actorRole: "OWNER",
    action: "CONFIG_UPDATE",
    description: "Updated API rate limit from 100 to 200 req/min",
    ipAddress: "103.21.XX.XX",
  },
  {
    id: "aud_005",
    timestamp: "2026-07-14 22:18:01",
    actor: "admin@aquabuddy.com",
    actorRole: "ADMIN",
    action: "DATA_EXPORT",
    description: "Exported sensor readings for robot AQ-2026-001 (CSV)",
    ipAddress: "103.21.XX.XX",
  },
  {
    id: "aud_006",
    timestamp: "2026-07-14 18:45:19",
    actor: "user@example.com",
    actorRole: "USER",
    action: "LOGIN",
    description: "Successful login via email/password",
    ipAddress: "49.37.XX.XX",
  },
];

const actionIcons: Record<AuditAction, typeof User> = {
  LOGIN: User,
  ROLE_CHANGE: Shield,
  CONFIG_UPDATE: Settings,
  DATA_EXPORT: Database,
  FEATURE_TOGGLE: Settings,
  ROBOT_COMMAND: Settings,
};

const actionColors: Record<AuditAction, string> = {
  LOGIN: "text-sky-400 bg-sky-500/10",
  ROLE_CHANGE: "text-amber-400 bg-amber-500/10",
  CONFIG_UPDATE: "text-purple-400 bg-purple-500/10",
  DATA_EXPORT: "text-emerald-400 bg-emerald-500/10",
  FEATURE_TOGGLE: "text-indigo-400 bg-indigo-500/10",
  ROBOT_COMMAND: "text-rose-400 bg-rose-500/10",
};

export default function AuditLogsPage() {
  const [filterAction, setFilterAction] = useState<AuditAction | "ALL">("ALL");

  const filtered = filterAction === "ALL" ? auditLogs : auditLogs.filter((l) => l.action === filterAction);

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Audit Logs</h1>
            <p className="text-sm text-foreground/50 font-light">Complete activity trail — Owner access only</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-foreground/40" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as AuditAction | "ALL")}
              className="bg-secondaryBg border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="ROLE_CHANGE">Role Change</option>
              <option value="CONFIG_UPDATE">Config Update</option>
              <option value="DATA_EXPORT">Data Export</option>
              <option value="FEATURE_TOGGLE">Feature Toggle</option>
              <option value="ROBOT_COMMAND">Robot Command</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-secondaryBg border border-black/10 dark:border-white/10 rounded-xl text-xs font-semibold text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filtered.map((entry) => {
          const Icon = actionIcons[entry.action];
          const color = actionColors[entry.action];
          return (
            <div
              key={entry.id}
              className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-5 flex items-start gap-4 hover:border-rose-500/10 transition-all"
            >
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">{entry.description}</p>
                <div className="flex items-center gap-4 text-xs text-foreground/40">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{entry.actor}</span>
                  <span className="font-semibold text-foreground/50">{entry.actorRole}</span>
                  <span className="font-mono">{entry.ipAddress}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-foreground/40 shrink-0">
                <Clock className="w-3 h-3" />
                {entry.timestamp}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-10 h-10 text-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-foreground/40">No audit entries match the selected filter.</p>
        </div>
      )}
    </div>
  );
}
