"use client";

import { Crown, Shield, Globe, Server, Palette, Bell } from "lucide-react";

const platformCards = [
  {
    title: "Platform Identity",
    description: "Brand name, logo, and public-facing configuration",
    icon: Crown,
    status: "Configured",
    statusColor: "text-green-400",
  },
  {
    title: "Security Policies",
    description: "Authentication rules, session timeouts, and rate limits",
    icon: Shield,
    status: "Active",
    statusColor: "text-green-400",
  },
  {
    title: "Regional Settings",
    description: "Default timezone, locale, and currency configuration",
    icon: Globe,
    status: "India / IST",
    statusColor: "text-accent",
  },
  {
    title: "API Gateway",
    description: "Rate limiting, CORS policies, and webhook endpoints",
    icon: Server,
    status: "Healthy",
    statusColor: "text-green-400",
  },
  {
    title: "Theme & Branding",
    description: "Color scheme, fonts, and UI customization overrides",
    icon: Palette,
    status: "Default",
    statusColor: "text-foreground/50",
  },
  {
    title: "Notification Channels",
    description: "Email provider, push notifications, and SMS gateway",
    icon: Bell,
    status: "2 Active",
    statusColor: "text-amber-400",
  },
];

export default function PlatformSettingsPage() {
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Crown className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Platform Settings</h1>
          <p className="text-sm text-foreground/50 font-light">Global platform configuration — Owner access only</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {platformCards.map((card) => (
          <div
            key={card.title}
            className="group bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-6 hover:border-purple-500/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.05)] transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/15 transition-colors">
                <card.icon className="w-5 h-5 text-purple-400" />
              </div>
              <span className={`text-xs font-semibold ${card.statusColor}`}>{card.status}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{card.title}</h3>
            <p className="text-xs text-foreground/50 leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-5 flex items-start gap-4">
        <Shield className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Owner-Only Configuration</p>
          <p className="text-xs text-foreground/50 mt-1 leading-relaxed">
            Changes made here affect the entire AquaBuddy platform. Modifications are logged in the Audit Trail and cannot be reversed by Administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
