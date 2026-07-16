"use client";
import React, { useState } from 'react';
import { HardDrive, Upload, Rocket, RotateCcw, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const releases = [
  { version: 'v1.2.4-stable', date: '2026-06-15', status: 'DEPLOYED', devices: 3, notes: 'Humidity calibration fix.' },
  { version: 'v1.2.3-stable', date: '2026-05-20', status: 'DEPLOYED', devices: 3, notes: 'Low-power hibernation mode.' },
  { version: 'v1.2.2-stable', date: '2026-04-10', status: 'ARCHIVED', devices: 0, notes: 'Initial production firmware.' },
];

export default function FirmwareManagementPage() {
  const [uploading, setUploading] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setDeployed(true); setTimeout(() => setDeployed(false), 3000); }, 2000);
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">Firmware Management</h2>
        <p className="text-foreground/60 font-light text-sm">Upload, deploy, and rollback firmware binaries across the fleet.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-6">Upload Firmware Binary</h3>

            <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl p-10 text-center hover:border-accent/30 transition-colors cursor-pointer mb-6">
              <Upload className="w-10 h-10 text-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-foreground/60 font-light">Drag & drop .bin file here</p>
              <p className="text-[10px] text-foreground/40 mt-1">or click to browse</p>
            </div>

            <button onClick={handleUpload} disabled={uploading}
              className="w-full py-3.5 bg-accent text-white font-semibold text-sm rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
              {uploading ? <><HardDrive className="w-4 h-4 animate-spin" /> Deploying...</> :
               deployed ? <><CheckCircle2 className="w-4 h-4" /> Deployed!</> :
               <><Rocket className="w-4 h-4" /> Deploy to All Devices</>}
            </button>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Deployment Warning</h4>
                <p className="text-xs text-foreground/60 font-light leading-relaxed">OTA deployments will interrupt active water generation processes. Schedule firmware updates during off-peak hours.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Release Pipeline */}
        <div className="lg:col-span-7">
          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-black/5 dark:border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50">Release Pipeline</h3>
            </div>
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {releases.map((r) => (
                <div key={r.version} className="px-6 py-5 flex items-center justify-between hover:bg-background/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-foreground">{r.version}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${r.status === 'DEPLOYED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-foreground/5 text-foreground/50 border border-foreground/10'}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/60 font-light">{r.notes}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-foreground/40">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.date}</span>
                      <span>{r.devices} devices</span>
                    </div>
                  </div>
                  {r.status === 'DEPLOYED' && (
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-background border border-black/10 dark:border-white/10 rounded-xl text-xs font-medium text-foreground/70 hover:text-foreground transition-colors cursor-pointer">
                      <RotateCcw className="w-3 h-3" />
                      Rollback
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
