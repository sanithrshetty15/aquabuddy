"use client";

import { motion } from "framer-motion";

const items = [
  { title: "Real-time Monitoring", text: "Crystal clear analytics on water output." },
  { title: "AI Optimization", text: "Learns humidity patterns over time." },
  { title: "Self-Cleaning", text: "UV sterilized components run 24/7." },
  { title: "Remote Control", text: "Manage settings from anywhere in the world." },
  { title: "Sustainable Yield", text: "Zero waste and ultra-efficient." },
  { title: "Grid Independence", text: "Solar compatible battery system." },
];

export const Carousel = () => {
  return (
    <section className="py-24 bg-[#050505] overflow-hidden flex flex-col relative border-t border-white/5">
      <div className="absolute top-0 left-0 bottom-0 w-16 md:w-48 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-16 md:w-48 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
      
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Everything you need</h2>
      </div>

      <div className="flex w-max relative cursor-grab active:cursor-grabbing">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-6 px-3 hover:[animation-play-state:paused]"
        >
          {/* We must duplicate the items exactly so half the width matches the full width of one set */}
          {[...items, ...items].map((item, i) => (
            <div key={i} className="w-[300px] h-[200px] shrink-0 bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col justify-center backdrop-blur-sm transition-transform hover:scale-105 hover:bg-white/10 group">
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-accentGlow transition-colors">{item.title}</h3>
              <p className="text-sm font-light text-gray-400">{item.text}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
