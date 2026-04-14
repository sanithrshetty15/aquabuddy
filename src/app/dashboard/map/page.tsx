export default function LiveMap() {
  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500 flex flex-col h-full">
      <div className="mb-6">
         <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Live Map Tracking</h2>
         <p className="text-gray-500 font-light text-sm">Monitor fleet operations and individual device geolocation.</p>
      </div>
      <div className="bg-[#0A0A0C] border border-white/5 rounded-2xl shadow-lg shadow-black/50 overflow-hidden flex-1 min-h-[600px] relative">
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(#00D6FF 1px, transparent 1px), linear-gradient(90deg, #00D6FF 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
         <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 backdrop-blur-md">
                <span className="text-2xl opacity-80">🗺️</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">GPS Stream Active</h3>
            <p className="text-gray-500 font-light text-sm max-w-md text-center">Connected to satellite tracking network. Map visualization layer is rendering.</p>
         </div>
      </div>
    </div>
  );
}
