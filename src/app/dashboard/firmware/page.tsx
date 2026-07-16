"use client";
import React, { useEffect } from 'react';
import { useRobot } from '@/hooks/useRobot';
import { HardDrive, CheckCircle2, Clock, Download, ShieldCheck, Cpu } from 'lucide-react';

const firmwareHistory = [
  { version: 'v1.2.4-stable', date: '2026-06-15', notes: 'Improved humidity sensor calibration accuracy. Fixed WiFi reconnection on sleep wake.' },
  { version: 'v1.2.3-stable', date: '2026-05-20', notes: 'Added low-power hibernation mode. Optimized water flow rate calculations.' },
  { version: 'v1.2.2-stable', date: '2026-04-10', notes: 'Initial production firmware. Core telemetry streaming and pump control.' },
];

export default function FirmwarePage() {
  const { robots, fetchRobots } = useRobot();

  useEffect(() => { void fetchRobots(); }, [fetchRobots]);

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">Firmware Status</h2>
        <p className="text-foreground/60 font-light text-sm">Monitor device firmware versions and check for over-the-air updates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Current Firmware Info */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 blur-[50px] pointer-events-none" />
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Current Firmware</h3>
                <p className="text-sm text-foreground/60 font-light">AquaBuddy ESP32 Core Runtime</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-background border border-black/5 dark:border-white/5 rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1">Version</p>
                <p className="text-xl font-bold text-accent">v1.2.4</p>
                <p className="text-[10px] text-foreground/50 mt-1">stable channel</p>
              </div>
              <div className="bg-background border border-black/5 dark:border-white/5 rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">Up to Date</span>
                </div>
                <p className="text-[10px] text-foreground/50 mt-1">Last checked: today</p>
              </div>
            </div>

            <button className="w-full py-3.5 bg-accent/10 border border-accent/20 text-accent font-semibold text-sm rounded-xl hover:bg-accent/15 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <Download className="w-4 h-4" />
              Check for OTA Update
            </button>
          </div>

          {/* Device Firmware per Robot */}
          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-4">Device Firmware Versions</h3>
            {robots.length === 0 ? (
              <p className="text-sm text-foreground/40 text-center py-6">No devices linked.</p>
            ) : (
              <div className="space-y-3">
                {robots.map((robot) => (
                  <div key={robot.id} className="flex items-center justify-between bg-background border border-black/5 dark:border-white/5 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <Cpu className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{robot.name}</p>
                        <p className="text-[10px] font-mono text-foreground/50">{robot.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">v1.2.4</p>
                      <p className="text-[10px] text-emerald-400 font-semibold">Up to date</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Update History & Guide */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-4">Release History</h3>
            <div className="relative pl-6 border-l border-black/10 dark:border-white/10 space-y-5">
              {firmwareHistory.map((fw, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-background border-2 border-accent" />
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-foreground">{fw.version}</span>
                    <span className="text-[10px] text-foreground/50 flex items-center gap-1"><Clock className="w-3 h-3" />{fw.date}</span>
                  </div>
                  <p className="text-xs text-foreground/65 font-light leading-relaxed">{fw.notes}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-4">Flashing Guide</h3>
            <div className="space-y-3 text-xs text-foreground/70 font-light leading-relaxed">
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-[10px] flex-shrink-0">1</div>
                <p>Connect your AquaBuddy unit to USB-C and open the ESP32 Flash Tool.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-[10px] flex-shrink-0">2</div>
                <p>Select the latest .bin firmware file from the release page.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-[10px] flex-shrink-0">3</div>
                <p>Hold the BOOT button and click Flash. The device will reboot automatically.</p>
              </div>
            </div>
          </div>

          <div className="bg-accent/5 border border-accent/10 rounded-3xl p-6 text-center">
            <ShieldCheck className="w-8 h-8 text-accent mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-foreground mb-1">Future OTA Updates</h4>
            <p className="text-xs text-foreground/60 font-light">Wireless over-the-air firmware deployments will be available in firmware v2.0.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
