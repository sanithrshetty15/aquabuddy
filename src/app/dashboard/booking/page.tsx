"use client";
import React, { useState, useEffect } from 'react';
import { useRobot } from '@/hooks/useRobot';
import { Calendar, Clock, Wrench, CheckCircle, Loader2, AlertTriangle, Droplets, Zap, Fan, RotateCw, Shield, Activity } from 'lucide-react';

export default function BookingSystem() {
  const { robots, fetchRobots } = useRobot();
  const [selectedRobot, setSelectedRobot] = useState('');
  const [serviceType, setServiceType] = useState('routine');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => { void fetchRobots(); }, [fetchRobots]);
  useEffect(() => { if (robots.length > 0 && !selectedRobot) setSelectedRobot(robots[0].id); }, [robots, selectedRobot]);

  // Default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRobot || !date) return;
    setIsSubmitting(true);
    
    // Mock booking
    await new Promise(r => setTimeout(r, 1000));
    const robot = robots.find(r => r.id === selectedRobot);
    setBookings(prev => [...prev, {
      id: `BK-${Date.now()}`,
      robot: robot?.name || 'Unknown',
      type: serviceType,
      date, time, notes,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
    }]);
    setSubmitted(true);
    setNotes('');
    setTimeout(() => setSubmitted(false), 3000);
    setIsSubmitting(false);
  };

  const serviceTypes = [
    { value: 'routine', label: 'Routine Inspection', desc: 'Standard 90-day check', icon: Wrench },
    { value: 'filter', label: 'Filter Replacement', desc: 'Air & condensation filters', icon: AlertTriangle },
    { value: 'repair', label: 'Repair Service', desc: 'Component repair or replacement', icon: Wrench },
    { value: 'calibration', label: 'Sensor Calibration', desc: 'Recalibrate humidity & temp sensors', icon: Clock },
  ];

  // Mock lifecycle data per robot (in production this would come from API)
  const lifecycleData: Record<string, {
    installationDate: string;
    warrantyStatus: string;
    warrantyExpiry: string;
    lifetimeWaterGenerated: string;
    lifetimeRuntime: string;
    pumpRuntime: string;
    fanRuntime: string;
    relayCycles: number;
    batteryHealth: string;
    sensorHealth: string;
  }> = {};

  robots.forEach((r) => {
    lifecycleData[r.id] = {
      installationDate: '2026-01-15',
      warrantyStatus: 'Active',
      warrantyExpiry: '2028-01-15',
      lifetimeWaterGenerated: '1,247 L',
      lifetimeRuntime: '4,320 hrs',
      pumpRuntime: '2,180 hrs',
      fanRuntime: '3,890 hrs',
      relayCycles: 15420,
      batteryHealth: '94%',
      sensorHealth: '98%',
    };
  });

  const currentLifecycle = selectedRobot ? lifecycleData[selectedRobot] : null;

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">Service & Maintenance</h2>
        <p className="text-foreground/60 font-light text-sm">Schedule maintenance, view robot lifecycle history, and track service records.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">Schedule Maintenance</h3>
            </div>

            <div>
              <label className="block text-xs text-foreground/50 font-semibold uppercase tracking-wider mb-2">Select Robot</label>
              <select value={selectedRobot} onChange={(e) => setSelectedRobot(e.target.value)}
                className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent cursor-pointer">
                {robots.map(r => <option key={r.id} value={r.id}>{r.name} ({r.code})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-foreground/50 font-semibold uppercase tracking-wider mb-3">Service Type</label>
              <div className="grid grid-cols-2 gap-3">
                {serviceTypes.map(st => (
                  <button key={st.value} type="button" onClick={() => setServiceType(st.value)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      serviceType === st.value
                        ? 'bg-accent/10 border-accent/30 shadow-[0_0_15px_rgba(0,102,204,0.05)]'
                        : 'bg-background border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'
                    }`}>
                    <st.icon className={`w-4 h-4 mb-2 ${serviceType === st.value ? 'text-accent' : 'text-foreground/40'}`} />
                    <p className={`text-xs font-semibold ${serviceType === st.value ? 'text-foreground font-bold' : 'text-foreground/80'}`}>{st.label}</p>
                    <p className="text-[10px] text-foreground/50 mt-0.5">{st.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-foreground/50 font-semibold uppercase tracking-wider mb-2">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs text-foreground/50 font-semibold uppercase tracking-wider mb-2">Time</label>
                <select value={time} onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent cursor-pointer">
                  {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-foreground/50 font-semibold uppercase tracking-wider mb-2">Notes (Optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe any issues or specific requests..."
                rows={3} className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent placeholder:text-foreground/30 resize-none" />
            </div>

            <button type="submit" disabled={isSubmitting || !selectedRobot || !date}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : submitted ? <CheckCircle className="w-4 h-4 text-white" /> : <Calendar className="w-4 h-4" />}
              {isSubmitting ? 'Scheduling...' : submitted ? 'Booked!' : 'Schedule Service'}
            </button>
          </form>
        </div>

        {/* Scheduled Bookings */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider px-1">Scheduled Services</h3>
          {bookings.length === 0 ? (
            <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-12 text-center shadow-2xl">
              <Calendar className="w-8 h-8 text-foreground/30 mx-auto mb-3" />
              <p className="text-foreground/50 text-sm font-light">No upcoming bookings. Schedule your first maintenance visit.</p>
            </div>
          ) : (
            bookings.map(b => (
              <div key={b.id} className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-5 shadow-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{serviceTypes.find(s => s.value === b.type)?.label}</p>
                    <p className="text-[10px] text-foreground/50">{b.robot} · {b.id}</p>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-accent/10 text-accent border border-accent/20">
                    {b.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-foreground/60">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Robot Lifecycle History ─── */}
      {currentLifecycle && (
        <div className="mt-10">
          <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider px-1 mb-4">Robot Lifecycle History</h3>
          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {/* Installation */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-foreground/50">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest">Installed</span>
                </div>
                <p className="text-sm font-bold text-foreground">{currentLifecycle.installationDate}</p>
              </div>

              {/* Warranty */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-foreground/50">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest">Warranty</span>
                </div>
                <p className="text-sm font-bold text-emerald-400">{currentLifecycle.warrantyStatus}</p>
                <p className="text-[10px] text-foreground/40">Expires {currentLifecycle.warrantyExpiry}</p>
              </div>

              {/* Lifetime Water */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-foreground/50">
                  <Droplets className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest">Water Generated</span>
                </div>
                <p className="text-sm font-bold text-accent">{currentLifecycle.lifetimeWaterGenerated}</p>
              </div>

              {/* Total Runtime */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-foreground/50">
                  <Activity className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest">Total Runtime</span>
                </div>
                <p className="text-sm font-bold text-foreground">{currentLifecycle.lifetimeRuntime}</p>
              </div>

              {/* Battery Health */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-foreground/50">
                  <Zap className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest">Battery Health</span>
                </div>
                <p className="text-sm font-bold text-emerald-400">{currentLifecycle.batteryHealth}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-black/5 dark:border-white/5 my-6" />

            {/* Component Runtimes Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div className="bg-background rounded-2xl p-4 border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">Pump Runtime</span>
                </div>
                <p className="text-lg font-bold text-foreground">{currentLifecycle.pumpRuntime}</p>
              </div>

              <div className="bg-background rounded-2xl p-4 border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Fan className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">Fan Runtime</span>
                </div>
                <p className="text-lg font-bold text-foreground">{currentLifecycle.fanRuntime}</p>
              </div>

              <div className="bg-background rounded-2xl p-4 border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">Relay Cycles</span>
                </div>
                <p className="text-lg font-bold text-foreground">{currentLifecycle.relayCycles.toLocaleString()}</p>
              </div>

              <div className="bg-background rounded-2xl p-4 border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">Sensor Health</span>
                </div>
                <p className="text-lg font-bold text-emerald-400">{currentLifecycle.sensorHealth}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
