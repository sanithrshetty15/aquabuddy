"use client";

import { Cloud, Wifi, Server, Globe, CheckCircle2, Clock, ArrowUpRight } from "lucide-react";

const services = [
  { name: "Supabase Auth", region: "ap-south-1", latency: "18ms", uptime: "99.98%", status: "operational" },
  { name: "PostgreSQL DB", region: "ap-south-1", latency: "12ms", uptime: "99.99%", status: "operational" },
  { name: "Realtime Engine", region: "ap-south-1", latency: "24ms", uptime: "99.95%", status: "operational" },
  { name: "MQTT Broker", region: "ap-south-1", latency: "8ms", uptime: "99.97%", status: "operational" },
  { name: "File Storage", region: "ap-south-1", latency: "45ms", uptime: "99.96%", status: "operational" },
  { name: "Edge Functions", region: "global", latency: "32ms", uptime: "99.90%", status: "degraded" },
];

export default function CloudStatusPage() {
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
          <Cloud className="w-6 h-6 text-sky-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Cloud Status</h1>
          <p className="text-sm text-foreground/50 font-light">Infrastructure health and service availability — Owner access only</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Services Up", value: "5/6", icon: Server, color: "text-emerald-400" },
          { label: "Avg Latency", value: "23ms", icon: Clock, color: "text-sky-400" },
          { label: "Global Uptime", value: "99.96%", icon: ArrowUpRight, color: "text-emerald-400" },
          { label: "Active Region", value: "ap-south-1", icon: Globe, color: "text-purple-400" },
        ].map((card) => (
          <div key={card.label} className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">{card.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Service Table */}
      <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/5">
          <h2 className="text-sm font-semibold text-foreground">Service Health</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-foreground/40 uppercase tracking-wider border-b border-black/5 dark:border-white/5">
                <th className="text-left px-6 py-3 font-semibold">Service</th>
                <th className="text-left px-6 py-3 font-semibold">Region</th>
                <th className="text-left px-6 py-3 font-semibold">Latency</th>
                <th className="text-left px-6 py-3 font-semibold">Uptime</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {services.map((s) => (
                <tr key={s.name} className="hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                  <td className="px-6 py-3 font-medium text-foreground flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5 text-sky-400" />
                    {s.name}
                  </td>
                  <td className="px-6 py-3 text-foreground/70 font-mono text-xs">{s.region}</td>
                  <td className="px-6 py-3 text-foreground/70">{s.latency}</td>
                  <td className="px-6 py-3 text-foreground/70">{s.uptime}</td>
                  <td className="px-6 py-3">
                    {s.status === "operational" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Operational
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                        <Clock className="w-3 h-3" /> Degraded
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
