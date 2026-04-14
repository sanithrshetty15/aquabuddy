export default function DashboardOverview() {
  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
         <h2 className="text-2xl font-bold text-white tracking-tight mb-1">System Overview</h2>
         <p className="text-gray-500 font-light text-sm">Real-time AquaBuddy telemetry and performance.</p>
      </div>
      
      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0A0A0C] border border-white/5 rounded-2xl p-6 shadow-lg shadow-black/50 hover:border-[#0066CC]/30 transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066CC]/10 blur-[50px] group-hover:bg-[#0066CC]/20 transition-colors pointer-events-none" />
          <h3 className="text-gray-400 font-medium text-sm mb-4">Water Generated Today</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white tracking-tight">14.2</span>
            <span className="text-lg text-gray-500 font-medium">L</span>
          </div>
          <p className="text-xs text-[#00D6FF] mt-3 font-medium bg-[#00D6FF]/10 border border-[#00D6FF]/20 inline-block px-2.5 py-1 rounded-full">+2.4L vs yesterday</p>
        </div>

        <div className="bg-[#0A0A0C] border border-white/5 rounded-2xl p-6 shadow-lg shadow-black/50 hover:border-[#00D6FF]/30 transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D6FF]/10 blur-[50px] group-hover:bg-[#00D6FF]/20 transition-colors pointer-events-none" />
          <h3 className="text-gray-400 font-medium text-sm mb-4">System Status</h3>
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-[#00D6FF] shadow-[0_0_10px_#00D6FF] animate-pulse" />
             <span className="text-3xl font-bold text-white tracking-tight">Online</span>
          </div>
          <p className="text-xs text-gray-500 mt-4 font-light">Last synced: Just now</p>
        </div>

        <div className="bg-[#0A0A0C] border border-white/5 rounded-2xl p-6 shadow-lg shadow-black/50 hover:border-green-500/30 transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] group-hover:bg-green-500/20 transition-colors pointer-events-none" />
          <h3 className="text-gray-400 font-medium text-sm mb-4">Filter Health</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white tracking-tight">92</span>
            <span className="text-lg text-gray-500 font-medium">%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
             <div className="bg-green-400 h-full w-[92%] shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
          </div>
        </div>
      </div>
      
      {/* Lower Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Tracking Card */}
          <div className="col-span-1 lg:col-span-8 bg-[#0A0A0C] border border-white/5 rounded-2xl shadow-lg shadow-black/50 overflow-hidden flex flex-col min-h-[400px]">
             <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="font-semibold text-white text-sm">Live Map Tracking</h3>
                <span className="text-xs font-medium text-[#00D6FF]">GPS Active</span>
             </div>
             <div className="flex-1 relative flex items-center justify-center p-6 bg-[#050505]/50">
                 <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #00D6FF 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                 <div className="w-2.5 h-2.5 bg-[#00D6FF] rounded-full absolute shadow-[0_0_20px_#00D6FF] z-10" />
                 <div className="bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md z-10">
                    <p className="text-sm text-gray-400 font-light tracking-wide uppercase">Map Interface Placeholder</p>
                 </div>
             </div>
          </div>

          {/* AquaBot Panel */}
          <div className="col-span-1 lg:col-span-4 bg-[#0A0A0C] border border-white/5 rounded-2xl shadow-lg shadow-black/50 flex flex-col min-h-[400px]">
             <div className="px-6 py-5 border-b border-white/5 flex gap-3 items-center bg-white/[0.02]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00D6FF] shadow-[0_0_8px_#00D6FF]" />
                <h3 className="font-semibold text-white text-sm">AquaBot AI</h3>
             </div>
             <div className="flex-1 p-6 flex flex-col justify-end">
                <div className="bg-white/5 p-4 rounded-xl rounded-tl-sm border border-white/5 text-sm font-light text-gray-300 w-[85%] mb-4 shadow-sm">
                   System is functioning nominally. Humidity levels are optimal for maximum water extraction.
                </div>
                <div className="relative mt-2">
                    <input type="text" placeholder="Ask AquaBot a question..." className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#00D6FF] focus:ring-1 focus:ring-[#00D6FF] transition-all placeholder:text-gray-600 shadow-inner" />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                    </button>
                </div>
             </div>
          </div>
      </div>
      
      {/* Activity Timeline / Alerts */}
      <div className="mt-6 bg-[#0A0A0C] border border-white/5 rounded-2xl shadow-lg shadow-black/50 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
             <h3 className="font-semibold text-white text-sm">Activity & Alerts</h3>
          </div>
          <div className="p-6">
             <div className="flex gap-4 items-start pb-6 border-b border-white/5">
                <div className="mt-1 w-2 h-2 rounded-full bg-white/30" />
                <div>
                   <p className="text-sm text-white font-medium mb-1">Maintenance Recommended</p>
                   <p className="text-xs text-gray-500 font-light">Dust filter is approaching 10% health. Consider replacing soon.</p>
                </div>
                <span className="ml-auto text-xs text-gray-600">2h ago</span>
             </div>
             <div className="flex gap-4 items-start pt-6">
                <div className="mt-1 w-2 h-2 rounded-full bg-[#00D6FF]" />
                <div>
                   <p className="text-sm text-white font-medium mb-1">Weekly Target Reached</p>
                   <p className="text-xs text-gray-500 font-light">AquaBuddy successfully generated 105L of pure water this week.</p>
                </div>
                <span className="ml-auto text-xs text-gray-600">1d ago</span>
             </div>
          </div>
      </div>
    </div>
  );
}
