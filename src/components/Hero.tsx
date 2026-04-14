"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { ParticleBackground } from "./ParticleBackground";

export const Hero = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background z-[1]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto pt-20 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-sm font-medium text-white mb-6 inline-block tracking-wide">
            Introducing the Future of Water
          </span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-6"
        >
          AquaBuddy <span className="text-glow bg-clip-text text-transparent bg-gradient-to-r from-white to-[#00D6FF]">E-tech</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl md:text-2xl text-white/80 max-w-2xl font-light mb-10"
        >
          Pure water. Pure innovation. AI-powered atmospheric water generation for any environment.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href="/buy-robot"
            className="flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accentGlow text-white rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(0,102,204,0.4)] hover:shadow-[0_0_30px_rgba(0,214,255,0.6)]"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </a>
          <button className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full font-semibold transition-all">
            <Play className="w-5 h-5 fill-white" /> Watch Demo
          </button>
        </motion.div>
      </div>
    </section>
  );
};
