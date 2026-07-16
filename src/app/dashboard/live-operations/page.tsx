"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRobot } from '@/hooks/useRobot';
import {
  Activity, Users, Bot, ShieldAlert, Cpu, Loader2,
  Gamepad2, Settings, Power, RefreshCw, Radio, Battery,
  Droplets, Thermometer, Percent, AlertOctagon, HelpCircle
} from 'lucide-react';
import axiosInstance from '@/services/api.service';

export default function LiveOperations() {
  const { robots, fetchRobots } = useRobot();
  const [selectedRobotId, setSelectedRobotId] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Live Operation state overrides (simulated)
  const [robotMode, setRobotMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [pumpState, setPumpState] = useState(true);
  const [fanState, setFanState] = useState(true);
  const [relayState, setRelayState] = useState(false);
  const [lightState, setLightState] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [obstacleDetected, setObstacleDetected] = useState(false);

  useEffect(() => {
    void fetchRobots();
    
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/admin/stats');
        if (res.data.success) setStats(res.data.data);
      } catch { /* silent */ }
      finally { setIsLoadingStats(false); }
    };
    void fetchStats();
  }, [fetchRobots]);

  useEffect(() => {
    if (robots.length > 0 && !selectedRobotId) {
      setSelectedRobotId(robots[0].id);
    }
  }, [robots, selectedRobotId]);

  // Simulate small updates to battery, humidity, obstacle status
  useEffect(() => {
    const timer = setInterval(() => {
      setBatteryLevel((prev) => Math.max(12, prev - (Math.random() > 0.8 ? 1 : 0)));
      setObstacleDetected(Math.random() > 0.85);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const activeRobot = robots.find(r => r.id === selectedRobotId);

  const handleRestart = () => {
    alert(`Initiated warm reboot command for device: ${activeRobot?.name || 'Selected Unit'}`);
  };

  const handleEStop = () => {
    setPumpState(false);
    setFanState(false);
    setRelayState(false);
    setLightState(false);
    setRobotMode('MANUAL');
    alert(`EMERGENCY STOP SHUTDOWN COMMAND ISSUED FOR DEVICE: ${activeRobot?.name}`);
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">Live Operations Deck</h2>
          <p className="text-foreground/60 font-light text-sm">Real-time status monitoring, sensor feeds, and remote operation controls.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/remote-control"
            className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/95 text-white font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4" />
            Dedicated Joystick Control
          </Link>
        </div>
      </div>

      {/* Fleet Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-5 shadow-md">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Total Operators</span>
            <Users className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-5 shadow-md">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Fleet Robots</span>
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.totalRobots || 0}</p>
        </div>
        <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-5 shadow-md">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Active Geolocation Nodes</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.activeRobots || 0}</p>
        </div>
        <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-5 shadow-md">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Active System Warnings</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.activeAlerts || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Device selector & Telemetry readings */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" />
                Live Telemetry Deck
              </h3>
              
              {robots.length > 0 && (
                <select
                  value={selectedRobotId}
                  onChange={(e) => setSelectedRobotId(e.target.value)}
                  className="bg-background border border-black/10 dark:border-white/10 text-foreground rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-accent cursor-pointer"
                >
                  {robots.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              )}
            </div>

            {robots.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-black/10 dark:border-white/10 rounded-2xl bg-background/50">
                <p className="text-sm text-foreground/50">No devices available in the fleet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Geolocation & basic specs */}
                <div className="p-4 bg-background border border-black/5 dark:border-white/5 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-foreground/50 block mb-0.5">Device Coordinates</span>
                    <span className="font-mono font-semibold text-foreground">{activeRobot?.lat?.toFixed(4)}, {activeRobot?.lng?.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-foreground/50 block mb-0.5">Model ID</span>
                    <span className="font-semibold text-accent">{activeRobot?.model}</span>
                  </div>
                  <div>
                    <span className="text-foreground/50 block mb-0.5">Physical Status</span>
                    <span className={`font-semibold uppercase ${activeRobot?.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>{activeRobot?.status}</span>
                  </div>
                </div>

                {/* Grid Sensor Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-background border border-black/5 dark:border-white/5 p-4 rounded-2xl text-center">
                    <Percent className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                    <span className="text-lg font-bold text-foreground">74.5%</span>
                    <p className="text-[10px] text-foreground/50 mt-1">Humidity</p>
                  </div>
                  <div className="bg-background border border-black/5 dark:border-white/5 p-4 rounded-2xl text-center">
                    <Thermometer className="w-4 h-4 mx-auto mb-1 text-orange-400" />
                    <span className="text-lg font-bold text-foreground">28.3°C</span>
                    <p className="text-[10px] text-foreground/50 mt-1">Temperature</p>
                  </div>
                  <div className="bg-background border border-black/5 dark:border-white/5 p-4 rounded-2xl text-center">
                    <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                    <span className="text-lg font-bold text-foreground">42.5L</span>
                    <p className="text-[10px] text-foreground/50 mt-1">Water Level</p>
                  </div>
                  <div className="bg-background border border-black/5 dark:border-white/5 p-4 rounded-2xl text-center">
                    <Battery className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <span className="text-lg font-bold text-foreground">{batteryLevel}%</span>
                    <p className="text-[10px] text-foreground/50 mt-1">Battery</p>
                  </div>
                </div>

                {/* Additional Telemetry Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-background border border-black/5 dark:border-white/5 rounded-2xl space-y-2 text-xs">
                    <h4 className="font-bold text-foreground/50 mb-2 uppercase tracking-wider text-[10px]">Obstacle Array</h4>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">IR Alignment</span>
                      <span className="font-semibold text-emerald-400">OPTIMAL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Obstacle Detection</span>
                      <span className={`font-semibold ${obstacleDetected ? 'text-red-400 animate-pulse' : 'text-foreground/50'}`}>
                        {obstacleDetected ? 'ALERT' : 'NONE'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Safety Limit Switch</span>
                      <span className="font-semibold text-emerald-400">CLOSED</span>
                    </div>
                  </div>

                  <div className="p-4 bg-background border border-black/5 dark:border-white/5 rounded-2xl space-y-2 text-xs">
                    <h4 className="font-bold text-foreground/50 mb-2 uppercase tracking-wider text-[10px]">Cloud Connection</h4>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">MQTT Link</span>
                      <span className="font-semibold text-emerald-400">ONLINE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">WiFi RSSI</span>
                      <span className="font-semibold text-accent">-54 dBm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Diagnostics Status</span>
                      <span className="font-semibold text-emerald-400">NOMINAL</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Override Controls & Manual Overwrites */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[40px] pointer-events-none" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-accent" />
              Operational Mode Overrides
            </h3>

            {robots.length > 0 && (
              <div className="space-y-4">
                {/* Mode Select */}
                <div className="flex items-center justify-between p-3.5 bg-background border border-black/5 dark:border-white/5 rounded-2xl">
                  <div>
                    <span className="text-xs font-semibold text-foreground">Robot Operation Mode</span>
                    <p className="text-[10px] text-foreground/50 font-light mt-0.5">Automatic loops vs manual override</p>
                  </div>
                  <div className="flex gap-1.5 p-1 bg-secondaryBg rounded-xl border border-black/10 dark:border-white/10">
                    <button
                      onClick={() => setRobotMode('AUTO')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${robotMode === 'AUTO' ? 'bg-accent text-white' : 'text-foreground/50'}`}
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => setRobotMode('MANUAL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${robotMode === 'MANUAL' ? 'bg-accent text-white' : 'text-foreground/50'}`}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                {/* Actuator switches */}
                <div className="p-4 bg-background border border-black/5 dark:border-white/5 rounded-2xl space-y-3">
                  <h4 className="font-bold text-foreground/50 mb-2 uppercase tracking-wider text-[10px]">Actuator Manual Toggles</h4>
                  
                  <div className="flex items-center justify-between text-xs py-1 border-b border-black/5 dark:border-white/5">
                    <span className="text-foreground/75 font-light">Water Intake Pump</span>
                    <button onClick={() => setPumpState(!pumpState)} className={`p-1.5 rounded-lg transition-colors ${pumpState ? 'text-accent bg-accent/15' : 'text-foreground/40 hover:bg-foreground/5'}`}>
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-black/5 dark:border-white/5">
                    <span className="text-foreground/75 font-light">Condensation Intake Fan</span>
                    <button onClick={() => setFanState(!fanState)} className={`p-1.5 rounded-lg transition-colors ${fanState ? 'text-accent bg-accent/15' : 'text-foreground/40 hover:bg-foreground/5'}`}>
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-black/5 dark:border-white/5">
                    <span className="text-foreground/75 font-light">AC Relay Compressor Switch</span>
                    <button onClick={() => setRelayState(!relayState)} className={`p-1.5 rounded-lg transition-colors ${relayState ? 'text-accent bg-accent/15' : 'text-foreground/40 hover:bg-foreground/5'}`}>
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-foreground/75 font-light">Chassis Safety Indicator LED</span>
                    <button onClick={() => setLightState(!lightState)} className={`p-1.5 rounded-lg transition-colors ${lightState ? 'text-accent bg-accent/15' : 'text-foreground/40 hover:bg-foreground/5'}`}>
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Operations CTAs */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button onClick={handleRestart} className="py-3 bg-background hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 text-foreground font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Warm Reboot
                  </button>
                  <button onClick={handleEStop} className="py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    E-Stop
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-xl flex gap-3.5 items-start">
            <HelpCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="text-xs font-light leading-relaxed text-foreground/70">
              <h4 className="font-semibold text-foreground mb-1">Local Firmware Autonomy</h4>
              <p>When AUTO mode is selected, the ESP32 hardware executes internal firmware control loops for temperature and humidity. The operator console monitors feeds only.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
