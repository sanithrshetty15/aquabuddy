export default function SystemAlerts() {
  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
         <div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-1">System Alerts</h2>
            <p className="text-gray-500 font-light text-sm">Review warnings and operational milestones.</p>
         </div>
         <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-semibold border border-red-500/20">All Clear</span>
      </div>
      <div className="bg-[#0A0A0C] border border-white/5 rounded-2xl shadow-lg shadow-black/50 p-8 flex flex-col items-center justify-center min-h-[400px]">
         <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-gray-500">
             <span className="text-2xl opacity-50">🔔</span>
         </div>
         <h3 className="text-lg font-medium text-white mb-2">No Active Alerts</h3>
         <p className="text-gray-500 font-light text-sm max-w-md text-center">Your AquaBuddy system is operating at peak efficiency under nominal parameters.</p>
      </div>
    </div>
  );
}
