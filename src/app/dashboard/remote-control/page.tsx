"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRobot } from '@/hooks/useRobot';
import { sendRobotCommand } from '@/services/robot.service';
import {
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square, AlertOctagon,
  Droplets, Zap, Fan, Lightbulb, Radio, Gauge, Battery, Wifi,
  ArrowLeftCircle, Loader2, ShieldAlert, AlertTriangle
} from 'lucide-react';

export default function RemoteControlPage() {
  const { robots, fetchRobots } = useRobot();
  const [selectedRobotId, setSelectedRobotId] = useState('');
  const [speed, setSpeed] = useState(50);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);
  const [commandTimeout, setCommandTimeout] = useState<NodeJS.Timeout | null>(null);

  // Mock toggle states
  const [pumpOn, setPumpOn] = useState(false);
  const [relayOn, setRelayOn] = useState(false);
  const [fanOn, setFanOn] = useState(false);
  const [lightOn, setLightOn] = useState(false);

  useEffect(() => { void fetchRobots(); }, [fetchRobots]);
  useEffect(() => { if (robots.length > 0 && !selectedRobotId) setSelectedRobotId(robots[0].id); }, [robots, selectedRobotId]);

  const sendCommand = async (cmd: string) => {
    if (!selectedRobotId) return;
    setActiveCommand(cmd);
    // Auto-timeout: clear active command after 5 seconds of inactivity
    if (commandTimeout) clearTimeout(commandTimeout);
    const timeout = setTimeout(() => setActiveCommand(null), 5000);
    setCommandTimeout(timeout);

    try {
      await sendRobotCommand(selectedRobotId, cmd);
    } catch (err: any) {
      console.error('Failed to send robot command:', err);
      alert(err.response?.data?.error?.message || 'Failed to execute command on unit.');
    }
  };

  const toggleActuator = async (name: string, currentState: boolean, toggleFn: (v: boolean) => void, onCmd: string, offCmd: string) => {
    if (!selectedRobotId) return;
    const action = currentState ? 'DEACTIVATE' : 'ACTIVATE';
    const confirmed = window.confirm(
      `⚠️ You are about to ${action} the ${name} on a physical robot.\n\nAre you sure you want to proceed?`
    );
    if (confirmed) {
      try {
        const cmd = currentState ? offCmd : onCmd;
        await sendRobotCommand(selectedRobotId, cmd);
        toggleFn(!currentState);
      } catch (err: any) {
        console.error('Failed to toggle actuator:', err);
        alert(err.response?.data?.error?.message || 'Failed to execute actuator toggle on unit.');
      }
    }
  };

  const activeRobot = robots.find(r => r.id === selectedRobotId);

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
      <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">Manual Remote Control</h2>
          <p className="text-foreground/60 font-light text-sm">Direct hardware manipulation — Administrator only.</p>
        </div>
        <div className="flex items-center gap-3">
          {robots.length > 0 && (
            <select
              value={selectedRobotId}
              onChange={(e) => setSelectedRobotId(e.target.value)}
              className="bg-secondaryBg border border-black/10 dark:border-white/10 text-foreground rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-accent cursor-pointer"
            >
              {robots.map(r => <option key={r.id} value={r.id}>{r.name} ({r.code})</option>)}
            </select>
          )}
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 bg-secondaryBg border border-black/10 dark:border-white/10 rounded-xl text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            <ArrowLeftCircle className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>

      {/* ─── Safety Warning Overlay ─── */}
      {!safetyAcknowledged && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-secondaryBg border border-red-500/20 rounded-3xl p-8 md:p-10 max-w-md w-full shadow-[0_0_60px_rgba(239,68,68,0.15)] text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">Physical Robot Warning</h2>
            <p className="text-sm text-foreground/60 leading-relaxed mb-2">
              You are about to control a <span className="font-bold text-red-400">physical robot</span> in the real world.
            </p>
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3 text-left">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <ul className="text-xs text-foreground/50 space-y-1.5 leading-relaxed">
                  <li>• All commands are <strong className="text-foreground/70">immediately executed</strong> on the hardware</li>
                  <li>• Commands <strong className="text-foreground/70">auto-timeout after 5 seconds</strong> of inactivity</li>
                  <li>• Actuator toggles require <strong className="text-foreground/70">manual confirmation</strong></li>
                  <li>• Use <strong className="text-red-400">Emergency Stop</strong> if anything goes wrong</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setSafetyAcknowledged(true)}
              className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer"
            >
              I Understand — Enable Controls
            </button>
            <Link href="/dashboard" className="block mt-3 text-xs text-foreground/40 hover:text-foreground/60 transition-colors">
              Cancel and return to dashboard
            </Link>
          </div>
        </div>
      )}

      {robots.length === 0 ? (
        <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-foreground/60 text-sm">Loading fleet data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Directional Controls */}
          <div className="lg:col-span-5 bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-6">Movement Controls</h3>
            <div className="flex flex-col items-center gap-3">
              {/* Forward */}
              <button onClick={() => sendCommand('FORWARD')}
                className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${activeCommand === 'FORWARD' ? 'bg-accent/20 border-accent text-accent scale-95' : 'bg-background border-black/10 dark:border-white/10 text-foreground/70 hover:border-accent/50 hover:text-accent'}`}>
                <ArrowUp className="w-8 h-8" />
              </button>
              {/* Left / Stop / Right */}
              <div className="flex items-center gap-3">
                <button onClick={() => sendCommand('LEFT')}
                  className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${activeCommand === 'LEFT' ? 'bg-accent/20 border-accent text-accent scale-95' : 'bg-background border-black/10 dark:border-white/10 text-foreground/70 hover:border-accent/50 hover:text-accent'}`}>
                  <ArrowLeft className="w-8 h-8" />
                </button>
                <button onClick={() => sendCommand('STOP')}
                  className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${activeCommand === 'STOP' ? 'bg-amber-500/20 border-amber-500 text-amber-500 scale-95' : 'bg-background border-black/10 dark:border-white/10 text-foreground/70 hover:border-amber-500/50 hover:text-amber-500'}`}>
                  <Square className="w-7 h-7" />
                </button>
                <button onClick={() => sendCommand('RIGHT')}
                  className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${activeCommand === 'RIGHT' ? 'bg-accent/20 border-accent text-accent scale-95' : 'bg-background border-black/10 dark:border-white/10 text-foreground/70 hover:border-accent/50 hover:text-accent'}`}>
                  <ArrowRight className="w-8 h-8" />
                </button>
              </div>
              {/* Backward */}
              <button onClick={() => sendCommand('BACKWARD')}
                className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${activeCommand === 'BACKWARD' ? 'bg-accent/20 border-accent text-accent scale-95' : 'bg-background border-black/10 dark:border-white/10 text-foreground/70 hover:border-accent/50 hover:text-accent'}`}>
                <ArrowDown className="w-8 h-8" />
              </button>
            </div>

            {/* Emergency Stop */}
            <button onClick={() => sendCommand('EMERGENCY_STOP')}
              className="w-full mt-6 py-4 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-500 font-bold text-sm uppercase tracking-wider hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <AlertOctagon className="w-5 h-5" />
              Emergency Stop
            </button>

            {/* Speed */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">Speed</span>
                <span className="text-sm font-semibold text-accent">{speed}%</span>
              </div>
              <input type="range" min={10} max={100} value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer" />
            </div>
          </div>

          {/* Actuator Controls & Status */}
          <div className="lg:col-span-7 space-y-6">
            {/* Actuators */}
            <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-4">Actuator Overrides</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Pump', on: pumpOn, toggle: () => toggleActuator('Pump', pumpOn, setPumpOn, 'PUMP_ON', 'PUMP_OFF'), icon: Droplets, color: 'blue' },
                  { label: 'Relay', on: relayOn, toggle: () => toggleActuator('Relay', relayOn, setRelayOn, 'RELAY_ON', 'RELAY_OFF'), icon: Zap, color: 'amber' },
                  { label: 'Fan', on: fanOn, toggle: () => toggleActuator('Fan', fanOn, setFanOn, 'FAN_ON', 'FAN_OFF'), icon: Fan, color: 'cyan' },
                  { label: 'Light', on: lightOn, toggle: () => toggleActuator('Light', lightOn, setLightOn, 'LIGHT_ON', 'LIGHT_OFF'), icon: Lightbulb, color: 'yellow' },
                ].map((item) => (
                  <button key={item.label} onClick={item.toggle}
                    className={`p-5 rounded-2xl border-2 text-center transition-all cursor-pointer ${item.on
                        ? `bg-${item.color}-500/10 border-${item.color}-500/30 shadow-[0_0_15px_rgba(0,150,255,0.1)]`
                        : 'bg-background border-black/10 dark:border-white/10 hover:border-foreground/20'
                      }`}>
                    <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.on ? 'text-accent' : 'text-foreground/40'}`} />
                    <span className={`text-xs font-semibold ${item.on ? 'text-accent' : 'text-foreground/60'}`}>{item.label}</span>
                    <div className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${item.on ? 'text-emerald-400' : 'text-foreground/30'}`}>
                      {item.on ? 'ON' : 'OFF'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Telemetry */}
            <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-4">Device Telemetry</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-background border border-black/5 dark:border-white/5 rounded-2xl p-4 text-center">
                  <Battery className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                  <span className="text-lg font-bold text-foreground">87%</span>
                  <p className="text-[10px] text-foreground/50 mt-1">Battery</p>
                </div>
                <div className="bg-background border border-black/5 dark:border-white/5 rounded-2xl p-4 text-center">
                  <Wifi className="w-5 h-5 mx-auto mb-1 text-accent" />
                  <span className="text-lg font-bold text-foreground">Strong</span>
                  <p className="text-[10px] text-foreground/50 mt-1">Connection</p>
                </div>
                <div className="bg-background border border-black/5 dark:border-white/5 rounded-2xl p-4 text-center">
                  <Gauge className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                  <span className="text-lg font-bold text-foreground">{speed}%</span>
                  <p className="text-[10px] text-foreground/50 mt-1">Speed</p>
                </div>
                <div className="bg-background border border-black/5 dark:border-white/5 rounded-2xl p-4 text-center">
                  <Radio className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                  <span className="text-lg font-bold text-foreground">Manual</span>
                  <p className="text-[10px] text-foreground/50 mt-1">Mode</p>
                </div>
              </div>
            </div>

            {/* Camera Placeholder */}
            <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-xl flex items-center justify-center min-h-[200px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
              <div className="text-center z-10">
                <span className="text-lg tracking-widest font-light text-foreground/40">[ Robot Camera Feed ]</span>
                <p className="text-xs text-foreground/30 mt-2">Coming Soon — Firmware v2.0</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
