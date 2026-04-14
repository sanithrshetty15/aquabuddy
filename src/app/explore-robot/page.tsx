import { Navbar } from "@/components/Navbar";

export default function ExploreRobot() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col pt-20">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-7xl mx-auto w-full">
         <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Explore the Details</h1>
         <p className="text-lg md:text-xl text-gray-400 max-w-3xl font-light mb-12">Dive deep into the precise specifications, component anatomy, and dimensions. Experience the future of sustainable water harvesting.</p>
         
         {/* Futuristic Grid Viewer */}
         <div className="w-full aspect-video border border-white/10 rounded-3xl bg-black/40 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 z-0" style={{ backgroundImage: "linear-gradient(#111 2px, transparent 2px), linear-gradient(90deg, #111 2px, transparent 2px)", backgroundSize: "40px 40px" }} />
            <div className="absolute w-[800px] h-[800px] bg-[#00D6FF] rounded-full blur-[200px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000 z-0 pointer-events-none" />
            
            <div className="z-10 flex flex-col items-center text-gray-500 hover:text-white transition-colors duration-300">
               <span className="text-xl tracking-widest font-light">[ 3D Interactive Configuration Sandbox ]</span>
               <span className="text-sm mt-4">(Coming Soon)</span>
            </div>
         </div>
      </div>
    </div>
  );
}
