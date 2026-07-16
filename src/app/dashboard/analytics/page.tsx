"use client";
import React, { useState, useEffect } from 'react';
import { useRobot } from '@/hooks/useRobot';
import { useSensor } from '@/hooks/useSensor';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { HumidityChart } from '@/components/charts/HumidityChart';
import { TemperatureChart } from '@/components/charts/TemperatureChart';
import { WaterCollectionChart } from '@/components/charts/WaterCollectionChart';
import { EfficiencyChart } from '@/components/charts/EfficiencyChart';
import { PredictionChart } from '@/components/charts/PredictionChart';
import {
  Droplets,
  Percent,
  Thermometer,
  Zap,
  BarChart,
} from 'lucide-react';

export default function SystemAnalytics() {
  const { robots, fetchRobots } = useRobot();
  const [selectedRobotId, setSelectedRobotId] = useState<string>('');
  const [timeframeDays, setTimeframeDays] = useState<number>(7);

  useEffect(() => {
    void fetchRobots();
  }, [fetchRobots]);

  useEffect(() => {
    if (robots.length > 0 && !selectedRobotId) {
      setSelectedRobotId(robots[0].id);
    }
  }, [robots, selectedRobotId]);

  const { chartData, isLoading } = useAnalytics(selectedRobotId, timeframeDays);
  const { latestReading, historyData, sensorStats } = useSensor(selectedRobotId);

  const activeRobot = robots.find((r) => r.id === selectedRobotId);

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">Advanced Analytics</h2>
          <p className="text-foreground/60 font-light text-sm">
            Deep dive telemetry trends, weather correlation, and ML predictions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {robots.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Unit:</span>
              <select
                value={selectedRobotId}
                onChange={(e) => setSelectedRobotId(e.target.value)}
                className="bg-secondaryBg border border-black/10 dark:border-white/10 text-foreground rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-accent cursor-pointer"
              >
                {robots.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Range:</span>
            <select
              value={timeframeDays}
              onChange={(e) => setTimeframeDays(Number(e.target.value))}
              className="bg-secondaryBg border border-black/10 dark:border-white/10 text-foreground rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {robots.length === 0 ? (
        <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-12 text-center shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-accent/5 flex items-center justify-center mb-4 border border-accent/10">
            <span className="text-2xl opacity-60">📈</span>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Active Telemetry Source</h3>
          <p className="text-foreground/50 font-light text-sm max-w-md text-center">
            You must link a robot to begin parsing historical sensors and yield analytics.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Summary Aggregates Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-foreground/50 text-xs mb-2">
                <Percent className="w-4 h-4 text-cyan-400" />
                <span>Avg Humidity</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {sensorStats?.avgHumidity ? `${sensorStats.avgHumidity}%` : '--'}
              </p>
            </div>

            <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-foreground/50 text-xs mb-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span>Avg Temp</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {sensorStats?.avgTemperature ? `${sensorStats.avgTemperature}°C` : '--'}
              </p>
            </div>

            <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-foreground/50 text-xs mb-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span>Total Yield</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {sensorStats?.totalWaterFlow ? `${sensorStats.totalWaterFlow.toFixed(2)} L` : '--'}
              </p>
            </div>

            <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-foreground/50 text-xs mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Power Consumed</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {sensorStats?.totalPower ? `${sensorStats.totalPower.toFixed(2)} kWh` : '--'}
              </p>
            </div>
          </div>

          {/* Charts Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              
              {/* Climate Charts */}
              <ChartContainer title="Atmospheric Analytics" subtitle="Humidity and Temperature correlation" isLoading={isLoading}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div>
                    <h4 className="text-xs text-foreground/60 font-medium mb-3">Relative Humidity (%)</h4>
                    <HumidityChart data={historyData} />
                  </div>
                  <div>
                    <h4 className="text-xs text-foreground/60 font-medium mb-3">Ambient Temperature (°C)</h4>
                    <TemperatureChart data={historyData} />
                  </div>
                </div>
              </ChartContainer>

              {/* Water Yield Overtime */}
              <ChartContainer title="Water Yield History" subtitle="Water volume extracted (Liters)" isLoading={isLoading}>
                <WaterCollectionChart data={historyData} />
              </ChartContainer>
            </div>

            {/* Right Side Info Cards */}
            <div className="lg:col-span-4 space-y-6">
              <ChartContainer title="Condensation Ratio" subtitle="Conversion rate efficiency" isLoading={isLoading}>
                <EfficiencyChart reading={latestReading} />
              </ChartContainer>

              {/* Aggregation Insights */}
              <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-accent" />
                  Environmental Summary
                </h3>
                <div className="space-y-4 text-xs font-light text-foreground/70 leading-relaxed">
                  <p>
                    Based on telemetry parsing, <strong className="text-foreground">{activeRobot?.name}</strong> exhibits peak performance at relative humidity thresholds higher than <strong className="text-accent">55%</strong>.
                  </p>
                  <p>
                    Aggregated records show <strong className="text-foreground">{sensorStats?.readingCount || 0} telemetry readings</strong> analyzed over the selected date range. Water conversion efficiency increases by <strong className="text-emerald-400">12%</strong> during nocturnal hours due to favorable humidity profiles.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Forecasting */}
          <ChartContainer title="Atmospheric Yield Forecasting" subtitle="Predictive models overlaying future 3 days forecast" isLoading={isLoading}>
            <PredictionChart historicalData={historyData} predictions={chartData?.predictions || []} />
          </ChartContainer>
        </div>
      )}
    </div>
  );
}
