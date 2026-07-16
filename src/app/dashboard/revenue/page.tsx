"use client";

import React from 'react';
import { DollarSign, Cpu, ArrowUpRight, TrendingUp, BarChart2, Globe, ShieldAlert } from 'lucide-react';

const revenueStats = [
  { label: 'Total Hardware Sales', value: '₹4,38,900.00', change: '+12.4%', icon: DollarSign, color: 'text-blue-500 bg-blue-500/10' },
  { label: 'Activated Licensing', value: '₹98,250.00', change: '+8.2%', icon: Cpu, color: 'text-accent bg-accent/10' },
  { label: 'Active Service Contracts', value: '₹62,000.00', change: '+15.1%', icon: TrendingUp, color: 'text-purple-500 bg-purple-500/10' },
];

const salesByRegion = [
  { region: 'Karnataka - Mangaluru', units: 14, share: '45%' },
  { region: 'Karnataka - Udupi', units: 10, share: '32%' },
  { region: 'Karnataka - Manipal', units: 7, share: '23%' },
];

export default function RevenueDashboard() {
  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">Corporate Revenue Indicators</h2>
        <p className="text-foreground/60 font-light text-sm">Monitor commercial unit registrations and enterprise hardware deployments.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {revenueStats.map((stat, i) => (
          <div key={i} className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                {stat.change}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales by Region */}
        <div className="lg:col-span-6 bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-6 flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" />
            Regional Hardware Distribution
          </h3>
          <div className="space-y-4">
            {salesByRegion.map((region, idx) => (
              <div key={idx} className="flex items-center justify-between bg-background border border-black/5 dark:border-white/5 rounded-2xl p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{region.region}</p>
                  <p className="text-[10px] text-foreground/50">{region.units} active devices deployed</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-accent">{region.share}</p>
                  <div className="w-20 bg-foreground/10 rounded-full h-1 mt-1 overflow-hidden">
                    <div className="bg-accent h-full rounded-full" style={{ width: region.share }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Breakdown */}
        <div className="lg:col-span-6 bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-accent" />
              Operations Breakdown
            </h3>
            <p className="text-xs text-foreground/70 font-light leading-relaxed mb-6">
              Unlike SaaS services, AquaBuddy operates on a physical deployment model. Revenue matches structural contracts, components shipping, and localized technical inspection contracts.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs py-2 border-b border-black/5 dark:border-white/5">
                <span className="text-foreground/60 font-light">Hardware Sales Share</span>
                <span className="font-semibold text-foreground">73.5%</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-black/5 dark:border-white/5">
                <span className="text-foreground/60 font-light">Firmware Licensing</span>
                <span className="font-semibold text-foreground">16.4%</span>
              </div>
              <div className="flex justify-between text-xs py-2">
                <span className="text-foreground/60 font-light">Field Service Operations</span>
                <span className="font-semibold text-foreground">10.1%</span>
              </div>
            </div>
          </div>

          <div className="bg-accent/5 border border-accent/10 rounded-2xl p-4 flex gap-3 items-start mt-6">
            <ShieldAlert className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-foreground/65 font-light leading-relaxed">
              Data synchronized with standard warehouse inventory nodes. Regional metrics are audited weekly on deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
