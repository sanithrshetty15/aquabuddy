"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRobot } from '@/hooks/useRobot';
import { Navbar } from '@/components/Navbar';
import {
  Bot,
  Cpu,
  Key,
  ShieldCheck,
  Calendar,
  Settings,
  HelpCircle,
  Activity,
  Droplets,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const robotModels = [
  {
    model: 'AQB-CLASSIC',
    name: 'AquaBuddy Classic',
    yield: 'Up to 10L / day',
    description: 'Ultra-compact household atmospheric water generator. Ideal for clean drinking water in apartments or small homes.',
    features: ['10L Daily Yield', 'Standard HEPA filtration', 'Basic App Analytics', 'Low Power Mode'],
    color: 'from-blue-600/20 to-cyan-600/5'
  },
  {
    model: 'AQB-PRO',
    name: 'AquaBuddy Pro',
    yield: 'Up to 25L / day',
    description: 'High-capacity home/office condenser featuring predictive ML atmosphere analytics and modular component breakdown views.',
    features: ['25L Daily Yield', 'Multi-stage UV & HEPA filtration', 'Digital Twin R3F Telemetry', 'Smart Pump Automation'],
    color: 'from-accent/20 to-accentGlow/5'
  },
  {
    model: 'AQB-MAX',
    name: 'AquaBuddy Max',
    yield: 'Up to 75L / day',
    description: 'Heavy-duty industrial generator for commercial facilities, off-grid cabins, and community agriculture pipelines.',
    features: ['75L Daily Yield', 'Commercial reverse osmosis', 'Fleet Management integration', 'Solar/Battery Grid compatibility'],
    color: 'from-purple-600/20 to-indigo-600/5'
  }
];

const timelineMilestones = [
  { date: 'Q3 2026', title: 'Atmospheric Water Generator Launch', desc: 'Rollout of the AquaBuddy Classic core engineering unit.' },
  { date: 'Q1 2027', title: 'Digital Twin Integration', desc: 'Full 3D React Three Fiber telemetry overlays for virtual inspection.' },
  { date: 'Q3 2027', title: 'Automated Filtration Arrays', desc: 'Next-gen self-cleaning filter cartridges with automated restocking.' },
  { date: 'Q1 2028', title: 'AquaBuddy Grid Networks', desc: 'Decentralized peer-to-peer water sharing and community pipeline arrays.' }
];

export default function RobotPage() {
  const { isAuthenticated, user } = useAuth();
  const { robots, fetchRobots, linkRobot, linkRobotLoading, linkRobotError } = useRobot();

  const [activationCode, setActivationCode] = useState('');
  const [robotName, setRobotName] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchRobots();
    }
  }, [isAuthenticated, fetchRobots]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    if (!activationCode.trim()) {
      setLocalError('Activation code is required.');
      return;
    }

    const nameToUse = robotName.trim() || undefined;
    const ok = await linkRobot(activationCode.trim(), nameToUse);

    if (ok) {
      setSuccessMsg('AquaBuddy device successfully activated and linked!');
      setActivationCode('');
      setRobotName('');
      void fetchRobots();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 text-center max-w-7xl mx-auto w-full">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          AquaBuddy Device Fleet
        </h1>
        <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto font-light leading-relaxed">
          Unify your atmospheric water generators. Activate hardware, view blueprints, and track development milestones.
        </p>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        
        {/* Left Column: Activation & Status */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Activation Form Card */}
          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[40px] pointer-events-none" />
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2.5">
              <Key className="w-5 h-5 text-accent" />
              Activate New Hardware
            </h3>
            <p className="text-xs text-foreground/75 font-light mb-6">
              Enter the unique 8-character activation decal code printed on the underside of your AquaBuddy hardware.
            </p>

            {isAuthenticated ? (
              <form onSubmit={handleActivate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">Activation Code *</label>
                    <input
                      type="text"
                      placeholder="AQB-XXXXX"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                      className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-all uppercase placeholder:text-foreground/30 text-foreground"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">Unit Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Backyard Condenser"
                      value={robotName}
                      onChange={(e) => setRobotName(e.target.value)}
                      className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-all placeholder:text-foreground/30 text-foreground"
                    />
                  </div>
                </div>

                {linkRobotError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{linkRobotError}</span>
                  </div>
                )}
                {localError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{localError}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={linkRobotLoading}
                  className="w-full py-3.5 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(0,102,204,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {linkRobotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Activate Hardware'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 border border-dashed border-black/10 dark:border-white/10 rounded-2xl bg-background/50">
                <p className="text-sm text-foreground/75 mb-4">Please log in to link and activate your AquaBuddy hardware.</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/login" className="px-5 py-2.5 bg-accent text-white font-medium text-xs rounded-lg hover:opacity-90 transition-opacity">
                    Log In
                  </Link>
                  <Link href="/register" className="px-5 py-2.5 border border-black/10 dark:border-white/10 text-foreground font-medium text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Connected Robots Status Dashboard */}
          {isAuthenticated && (
            <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2.5">
                <Bot className="w-5 h-5 text-accent" />
                Active Registered Hardware
              </h3>
              
              {robots.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-black/10 dark:border-white/10 rounded-2xl bg-background/30 text-foreground/50">
                  <Bot className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No active devices registered to your account yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {robots.map((robot) => (
                    <div key={robot.id} className="bg-background border border-black/5 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                          <Cpu className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{robot.name}</p>
                          <p className="text-[10px] font-mono text-foreground/50">{robot.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${robot.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className="text-[10px] font-medium tracking-wide uppercase text-foreground/60">{robot.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Guide / Activation Guide */}
          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2.5">
              <HelpCircle className="w-5 h-5 text-accent" />
              Activation Guide
            </h3>
            <div className="space-y-4 font-light text-sm text-foreground/80 leading-relaxed">
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-0.5">Power On System</h4>
                  <p className="text-xs text-foreground/70">Connect AquaBuddy to an AC outlet or direct solar inverter. The initialization LED will pulse orange.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-0.5">Locate Activation Code</h4>
                  <p className="text-xs text-foreground/70">Find the 8-character unique activation decal code printed on the metal chassis on the underside of your system.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-0.5">Submit & Synchronize</h4>
                  <p className="text-xs text-foreground/70">Enter the code in the form above. Once linked, the hardware connects to the global cloud array via Wi-Fi telemetry.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Roadmap, Specifications, Future features */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Engineering Roadmap Timeline */}
          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-accent" />
              Engineering Roadmap
            </h3>
            
            <div className="relative pl-6 border-l border-black/10 dark:border-white/10 space-y-6">
              {timelineMilestones.map((m, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-accent transition-transform group-hover:scale-125 duration-300" />
                  <span className="text-[10px] font-bold text-accent tracking-wider uppercase">{m.date}</span>
                  <h4 className="text-sm font-semibold text-foreground mt-0.5 mb-1">{m.title}</h4>
                  <p className="text-xs text-foreground/65 font-light leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Future Technology / Features */}
          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[40px] pointer-events-none" />
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2.5">
              <Settings className="w-5 h-5 text-accent" />
              Future Integrations
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-background/50 border border-black/5 dark:border-white/5 rounded-2xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-1">R3F Interactive Digital Twin</h4>
                <p className="text-xs text-foreground/75 font-light leading-relaxed">
                  Interactive transparent chassis overlays mapping local heat pumps, fans, filters, and collection tanks virtualized in 3D.
                </p>
              </div>

              <div className="p-4 bg-background/50 border border-black/5 dark:border-white/5 rounded-2xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-1">Predictive ML Yield Projections</h4>
                <p className="text-xs text-foreground/75 font-light leading-relaxed">
                  Live atmospheric hygrometer feedback feed overlayed on historical climate mapping charts projecting 72-hour yields.
                </p>
              </div>

              <div className="p-4 bg-background/50 border border-black/5 dark:border-white/5 rounded-2xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-1">Smart Pump Actuation Control</h4>
                <p className="text-xs text-foreground/75 font-light leading-relaxed">
                  Actuate pumps, triggers, low-yield hibernation modes, and maintenance loops directly from client-side UI overrides.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* System Models Grid */}
      <section className="max-w-7xl mx-auto w-full px-6 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-2">AquaBuddy Hardware Configurations</h2>
          <p className="text-sm text-foreground/70 max-w-xl mx-auto font-light leading-relaxed">
            Highly optimized condensation systems engineering pure drinking water out of thin air.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {robotModels.map((item) => (
            <div
              key={item.model}
              className={`bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between group hover:border-accent/30 hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} blur-[30px] pointer-events-none group-hover:opacity-100 opacity-60 transition-opacity`} />
              
              <div>
                <span className="text-[10px] font-mono tracking-wider text-foreground/50 uppercase">{item.model}</span>
                <h3 className="text-xl font-bold text-foreground mt-1 mb-2">{item.name}</h3>
                
                <div className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full w-fit mb-4">
                  <Droplets className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-semibold text-accent">{item.yield}</span>
                </div>

                <p className="text-xs text-foreground/75 font-light leading-relaxed mb-6">{item.description}</p>
              </div>

              <div className="pt-4 border-t border-black/5 dark:border-white/5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-2">Specifications</h4>
                <ul className="space-y-2">
                  {item.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-foreground/80 font-light">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
