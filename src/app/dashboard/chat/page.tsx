export default function AquaBotChat() {
  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
         <h2 className="text-2xl font-bold text-white tracking-tight mb-1">AquaBot AI</h2>
         <p className="text-gray-500 font-light text-sm">Direct interface with system intelligence and diagnostics.</p>
      </div>
      <div className="bg-[#0A0A0C] border border-white/5 rounded-2xl shadow-lg shadow-black/50 p-8 flex flex-col items-center justify-center min-h-[500px]">
         <div className="w-16 h-16 rounded-full bg-[#00D6FF]/10 border border-[#00D6FF]/20 flex items-center justify-center mb-4">
             <div className="w-4 h-4 rounded-full bg-[#00D6FF] shadow-[0_0_15px_#00D6FF] animate-pulse" />
         </div>
         <h3 className="text-lg font-medium text-white mb-2">Neural Link Established</h3>
         <p className="text-gray-500 font-light text-sm max-w-md text-center">AquaBot is monitoring systems actively. Chat interface module is initializing.</p>
      </div>
    </div>
  );
}
