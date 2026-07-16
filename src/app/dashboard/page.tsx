"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRobot } from '@/hooks/useRobot';
import { useSensor } from '@/hooks/useSensor';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAlerts } from '@/hooks/useAlerts';
import { MetricCard } from '@/components/cards/MetricCard';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { HumidityChart } from '@/components/charts/HumidityChart';
import { TemperatureChart } from '@/components/charts/TemperatureChart';
import { WaterCollectionChart } from '@/components/charts/WaterCollectionChart';
import { EfficiencyChart } from '@/components/charts/EfficiencyChart';
import { PredictionChart } from '@/components/charts/PredictionChart';
import { AlertCard } from '@/components/cards/AlertCard';
import {
  Droplets,
  Activity,
  Bell,
  Cpu,
  Zap,
  Thermometer,
  Percent,
  Bot,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const { user } = useAuth();
  const { robots, fetchRobots, isLoading: isRobotsLoading } = useRobot();
  const [selectedRobotId, setSelectedRobotId] = useState<string>('');

  // Fetch robots list
  useEffect(() => {
    void fetchRobots();
  }, [fetchRobots]);

  // Set default selected robot when list loads
  useEffect(() => {
    if (robots.length > 0 && !selectedRobotId) {
      setSelectedRobotId(robots[0].id);
    }
  }, [robots, selectedRobotId]);

  // Fetch metrics and charts
  const { kpis, chartData, isLoading: isAnalyticsLoading } = useAnalytics(selectedRobotId);
  const { latestReading, historyData } = useSensor(selectedRobotId);
  const { alerts, acknowledgeAlert, resolveAlert, isProcessing } = useAlerts(selectedRobotId);

  // Quick questions for AquaBot AI state
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);

  const handleAskBot = () => {
    if (!chatInput.trim()) return;
    
    // Simple mock chatbot responses
    const query = chatInput.toLowerCase();
    let response = "I'm analyzing the telemetry feed. Everything appears to be within normal operating limits.";
    
    if (query.includes('water') || query.includes('produce')) {
      const generated = kpis?.totalWaterGenerated || 0;
      response = `Currently, the systems have produced a total of ${generated} Liters. Production rate scales with local humidity.`;
    } else if (query.includes('humidity') || query.includes('moisture')) {
      const hum = latestReading?.humidity || 65;
      response = `The local atmospheric humidity is currently at ${hum}%. Higher humidity levels directly increase condensation efficiency.`;
    } else if (query.includes('temp') || query.includes('heat')) {
      const temp = latestReading?.temperature || 24;
      response = `The ambient temperature is registered at ${temp}°C. Operating range is nominal.`;
    } else if (query.includes('alert') || query.includes('error')) {
      const activeAlerts = alerts.filter(a => a.status !== 'RESOLVED').length;
      response = activeAlerts > 0 
        ? `We have ${activeAlerts} unresolved alerts. Please acknowledge them at the bottom of the dashboard.`
        : "Excellent news! There are zero active alert logs in the system.";
    }

    setChatResponse(response);
    setChatInput('');
  };

  const activeRobot = robots.find((r) => r.id === selectedRobotId);

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">
            Welcome back, {user?.firstName || 'Operator'}
          </h2>
          <p className="text-foreground/75 font-light text-sm">
            Real-time AquaBuddy telemetry and performance indicators.
          </p>
        </div>

        {/* Robot Selector */}
        {robots.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Active Unit:</span>
            <select
              value={selectedRobotId}
              onChange={(e) => setSelectedRobotId(e.target.value)}
              className="bg-secondaryBg border border-black/10 dark:border-white/10 text-foreground rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-accent cursor-pointer"
            >
              {robots.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Water Yield"
          value={kpis ? `${kpis.totalWaterGenerated} L` : '0.00 L'}
          icon={Droplets}
          description="Cumulative water generated across all units"
          color="cyan"
        />
        <MetricCard
          title="Active Systems"
          value={kpis ? `${kpis.activeRobotsCount} / ${kpis.totalRobotsCount}` : '0 / 0'}
          icon={Activity}
          description="Liters producing units online"
          color="emerald"
        />
        <MetricCard
          title="Active Alerts"
          value={kpis ? kpis.activeAlertsCount : 0}
          icon={Bell}
          description="Requires acknowledgment or intervention"
          color={kpis?.activeAlertsCount > 0 ? 'rose' : 'blue'}
        />
      </div>

      {robots.length === 0 && !isRobotsLoading ? (
        /* Empty State */
        <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-12 text-center shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
            <Bot className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No Linked Robots Detected</h3>
          <p className="text-foreground/70 font-light text-sm max-w-md mx-auto mb-8">
            To view real-time atmospheric condensation analytics and telemetry, you need to link an AquaBuddy device.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/robot"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors cursor-pointer"
            >
              Order AquaBuddy
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Telemetry Section */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Charts Column */}
          <div className="col-span-1 lg:col-span-8 space-y-6">
            
            {/* Live Atmosphere Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartContainer title="Atmospheric Humidity" subtitle="Live hygrometer readings" isLoading={isAnalyticsLoading}>
                <HumidityChart data={historyData} />
              </ChartContainer>

              <ChartContainer title="Ambient Temperature" subtitle="Live thermometer readings" isLoading={isAnalyticsLoading}>
                <TemperatureChart data={historyData} />
              </ChartContainer>
            </div>

            {/* Live Yield & Efficiency Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartContainer title="Water Yield Rates" subtitle="Liters produced per telemetry log" isLoading={isAnalyticsLoading}>
                <WaterCollectionChart data={historyData} />
              </ChartContainer>

              <ChartContainer title="System Efficiency" subtitle="Power-to-water condensation ratio" isLoading={isAnalyticsLoading}>
                <EfficiencyChart reading={latestReading} />
              </ChartContainer>
            </div>

            {/* ML Prediction Chart */}
            <ChartContainer title="Atmospheric Yield Forecasting" subtitle="Predictive model overlay (3-Day yield projection)" isLoading={isAnalyticsLoading}>
              <PredictionChart historicalData={historyData} predictions={chartData?.predictions || []} />
            </ChartContainer>
          </div>

          {/* Real-time Telemetry Values & Chat Panel */}
          <div className="col-span-1 lg:col-span-4 space-y-6">
            
            {/* Telemetry Stats Card */}
            <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[40px] pointer-events-none" />
              <h3 className="font-semibold text-foreground text-sm mb-6 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" />
                Live Telemetry: {activeRobot?.name}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-background border border-black/5 dark:border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Percent className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-foreground/75 font-light">Humidity</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {latestReading ? `${latestReading.humidity.toFixed(1)}%` : '--'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-background border border-black/5 dark:border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-foreground/75 font-light">Temperature</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {latestReading ? `${latestReading.temperature.toFixed(1)}°C` : '--'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-background border border-black/5 dark:border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-foreground/75 font-light">Water Flow (Current)</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {latestReading ? `${latestReading.waterFlow.toFixed(2)} L/i` : '--'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-background border border-black/5 dark:border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs text-foreground/75 font-light">Tank Level</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {latestReading ? `${latestReading.waterLevel.toFixed(1)}L / 50L` : '--'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-background border border-black/5 dark:border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-foreground/75 font-light">Power Consumption</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {latestReading ? `${latestReading.powerConsumption.toFixed(3)} kWh` : '--'}
                  </span>
                </div>
              </div>
            </div>

            {/* AquaBot Panel */}
            <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl shadow-2xl flex flex-col overflow-hidden min-h-[300px]">
              <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex gap-3 items-center bg-background/10">
                <Bot className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground text-sm">AquaBot AI Assistant</h3>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                <div className="flex-1 overflow-y-auto max-h-[160px] custom-scrollbar space-y-3">
                  <div className="bg-background p-4 rounded-2xl rounded-tl-sm border border-black/5 dark:border-white/5 text-xs font-light text-foreground/80 shadow-sm leading-relaxed">
                    Hello! Ask me about humidity conditions, current water extraction stats, or any active warnings.
                  </div>
                  {chatResponse && (
                    <div className="bg-accent/10 p-4 rounded-2xl rounded-tr-sm border border-accent/20 text-xs font-light text-foreground/90 shadow-sm leading-relaxed">
                      {chatResponse}
                    </div>
                  )}
                </div>
                
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskBot()}
                    placeholder="Ask AquaBot..."
                    className="w-full bg-background border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3.5 text-xs text-foreground focus:outline-none focus:border-accent transition-all placeholder:text-foreground/40 shadow-inner pr-10"
                  />
                  <button
                    onClick={handleAskBot}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-secondaryBg hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors text-foreground/60 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Active Alerts List */}
      {alerts.filter((a) => a.status !== 'RESOLVED').length > 0 && (
        <div className="mt-8 bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 bg-background/10">
            <h3 className="font-semibold text-foreground text-sm">System Warnings & Alerts</h3>
          </div>
          <div className="p-6 space-y-4">
            {alerts
              .filter((a) => a.status !== 'RESOLVED')
              .map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={acknowledgeAlert}
                  onResolve={resolveAlert}
                  isProcessing={isProcessing}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
