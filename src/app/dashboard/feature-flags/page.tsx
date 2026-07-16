"use client";

import { ToggleLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useState } from "react";

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  scope: "global" | "beta" | "internal";
  lastModified: string;
}

const initialFlags: FeatureFlag[] = [
  {
    id: "ff_realtime_telemetry",
    name: "Realtime Telemetry Streaming",
    description: "Enable live WebSocket-based sensor data streaming to dashboard",
    enabled: true,
    scope: "global",
    lastModified: "2026-07-10",
  },
  {
    id: "ff_ai_chatbot",
    name: "AquaBot AI Assistant",
    description: "GPT-powered conversational assistant for robot diagnostics",
    enabled: true,
    scope: "global",
    lastModified: "2026-07-08",
  },
  {
    id: "ff_predictive_maint",
    name: "Predictive Maintenance",
    description: "ML-based anomaly detection for proactive service scheduling",
    enabled: false,
    scope: "beta",
    lastModified: "2026-07-12",
  },
  {
    id: "ff_fleet_management",
    name: "Fleet Management View",
    description: "Multi-robot overview panel for enterprise deployments",
    enabled: false,
    scope: "internal",
    lastModified: "2026-07-14",
  },
  {
    id: "ff_ota_firmware",
    name: "OTA Firmware Updates",
    description: "Push firmware updates to robots over-the-air",
    enabled: true,
    scope: "global",
    lastModified: "2026-07-05",
  },
  {
    id: "ff_water_quality",
    name: "Water Quality Index",
    description: "TDS/pH/conductivity composite scoring for generated water",
    enabled: false,
    scope: "beta",
    lastModified: "2026-07-13",
  },
];

const scopeColors: Record<string, string> = {
  global: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  beta: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  internal: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);

  const toggleFlag = (id: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled, lastModified: new Date().toISOString().split("T")[0] } : f))
    );
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <ToggleLeft className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Feature Flags</h1>
          <p className="text-sm text-foreground/50 font-light">Toggle platform features globally — Owner access only</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-2">Total Flags</p>
          <p className="text-2xl font-bold text-foreground">{flags.length}</p>
        </div>
        <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-2">Enabled</p>
          <p className="text-2xl font-bold text-emerald-400">{flags.filter((f) => f.enabled).length}</p>
        </div>
        <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-2">Disabled</p>
          <p className="text-2xl font-bold text-foreground/50">{flags.filter((f) => !f.enabled).length}</p>
        </div>
      </div>

      {/* Flags List */}
      <div className="space-y-3">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-5 flex items-center gap-5 hover:border-indigo-500/15 transition-all"
          >
            <button
              type="button"
              onClick={() => toggleFlag(flag.id)}
              className={`w-12 h-7 rounded-full relative transition-colors duration-200 cursor-pointer shrink-0 ${
                flag.enabled ? "bg-emerald-500" : "bg-foreground/20"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  flag.enabled ? "left-6" : "left-1"
                }`}
              />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-sm font-semibold text-foreground">{flag.name}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${scopeColors[flag.scope]}`}>
                  {flag.scope}
                </span>
              </div>
              <p className="text-xs text-foreground/50 leading-relaxed">{flag.description}</p>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-foreground/40 shrink-0">
              <Clock className="w-3 h-3" />
              {flag.lastModified}
            </div>

            {flag.enabled ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-foreground/30 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
