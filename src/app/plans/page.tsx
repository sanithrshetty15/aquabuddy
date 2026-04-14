import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function Plans() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col pt-20">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center pb-24">
         <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Simple, Transparent Pricing</h1>
         <p className="text-xl text-gray-400 max-w-2xl font-light mb-16">Choose the system that fits your household's water independence goals.</p>
         
         <div className="flex gap-8 max-w-5xl w-full flex-col md:flex-row justify-center items-center md:items-stretch">
            <div className="border border-white/10 bg-white/5 p-8 rounded-3xl w-full max-w-[350px] text-left flex flex-col">
                <h3 className="text-2xl font-bold mb-2">AquaBuddy Basic</h3>
                <p className="text-[#00D6FF] text-4xl font-bold mb-8">$1,299</p>
                <ul className="text-gray-400 space-y-4 mb-10 flex-1 font-light">
                   <li className="flex gap-3 items-center"><span className="text-[#0066CC]">✓</span> Up to 10L daily yield</li>
                   <li className="flex gap-3 items-center"><span className="text-[#0066CC]">✓</span> Standard mobile companion app</li>
                   <li className="flex gap-3 items-center"><span className="text-[#0066CC]">✓</span> Comprehensive 1-Year Warranty</li>
                   <li className="flex gap-3 items-center"><span className="text-[#0066CC]">✓</span> Direct-to-home delivery</li>
                </ul>
                <Link href="/buy-robot" className="w-full block py-4 text-center border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors font-medium">Select Basic</Link>
            </div>
            <div className="border border-[#0066CC]/50 bg-gradient-to-b from-[#0066CC]/20 to-transparent p-8 xl:scale-105 rounded-3xl w-full max-w-[350px] text-left relative overflow-hidden flex flex-col shadow-[0_0_40px_rgba(0,102,204,0.15)]">
                <div className="absolute top-0 right-0 bg-[#0066CC] text-xs tracking-wider text-white font-bold px-4 py-1.5 rounded-bl-xl">POPULAR</div>
                <h3 className="text-2xl font-bold mb-2 text-white">AquaBuddy Pro</h3>
                <p className="text-[#00D6FF] text-4xl font-bold mb-8">$1,999</p>
                <ul className="text-gray-300 space-y-4 mb-10 flex-1 font-light">
                   <li className="flex gap-3 items-center"><span className="text-[#00D6FF] drop-shadow-[0_0_5px_#00D6FF]">✓</span> Up to 25L daily yield</li>
                   <li className="flex gap-3 items-center"><span className="text-[#00D6FF] drop-shadow-[0_0_5px_#00D6FF]">✓</span> Priority predictive AI algorithms</li>
                   <li className="flex gap-3 items-center"><span className="text-[#00D6FF] drop-shadow-[0_0_5px_#00D6FF]">✓</span> Advanced component breakdown View</li>
                   <li className="flex gap-3 items-center"><span className="text-[#00D6FF] drop-shadow-[0_0_5px_#00D6FF]">✓</span> 5-Year Extended Elite Warranty</li>
                </ul>
                <Link href="/buy-robot" className="w-full block text-center py-4 bg-gradient-to-r from-[#0066CC] to-[#00D6FF] text-white rounded-xl hover:opacity-90 shadow-[0_0_20px_rgba(0,102,204,0.4)] transition-all font-semibold">Select Pro</Link>
            </div>
         </div>
      </div>
    </div>
  );
}
