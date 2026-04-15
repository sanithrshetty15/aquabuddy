"use client";

import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden pt-20">
      <Navbar />
      
      {/* 
        ==============================
        BACKGROUND & ANIMATION LAYER
        ==============================
      */}
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#0066CC] opacity-10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Decorative CSS Ring Animation */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] flex justify-center items-center pointer-events-none z-0 opacity-50">
        <style dangerouslySetInnerHTML={{ __html: `
          .anim-ring { position: absolute; inset: 0; border: 1px solid rgba(0, 214, 255, 0.15); transition: 0.5s; }
          .anim-ring.layer-1 { border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%; animation: spin1 20s linear infinite; }
          .anim-ring.layer-2 { border-radius: 41% 44% 56% 59% / 38% 62% 63% 37%; animation: spin1 15s linear infinite; }
          .anim-ring.layer-3 { border-radius: 41% 44% 56% 59% / 38% 62% 63% 37%; animation: spin2 25s linear infinite; }
          @keyframes spin1 { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes spin2 { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
        `}} />
        <div className="relative w-full h-full">
          <i className="anim-ring layer-1" />
          <i className="anim-ring layer-2" style={{ borderColor: 'rgba(0, 102, 204, 0.15)' }} />
          <i className="anim-ring layer-3" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
        </div>
      </div>

      {/* 
        ==============================
        CENTERED REGISTER CARD (Foreground)
        ==============================
      */}
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center mt-10">
        
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 mb-8">
          {/* Using the same logo path/style as login */}
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
            <CheckCircle2 className="w-6 h-6 text-[#00D6FF]" />
          </div>
          <span className="text-2xl tracking-[0.2em] font-light uppercase text-white">AquaBuddy</span>
        </div>

        {/* Glassmorphism Card */}
        <div className="w-full bg-[#111111]/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_0_80px_rgba(0,102,204,0.15)] relative overflow-hidden">
          
          {/* Internal soft top glow for premium glass feel */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D6FF]/30 to-transparent" />

          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Create Account</h1>
            <p className="text-gray-400 font-light text-sm md:text-base">Join the future of water independence.</p>
          </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="flex gap-4">
             <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                <input type="text" placeholder="Jane" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" />
             </div>
             <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                <input type="text" placeholder="Doe" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input type="email" placeholder="hello@aquabuddy.com" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" />
          </div>
          
          <div className="flex items-start text-sm mt-4">
            <input type="checkbox" className="mt-1 mr-2 rounded border-white/20 bg-black/40 text-accent focus:ring-accent" />
            <label className="text-gray-400 leading-snug">
              I agree to the <Link href="#" className="text-white hover:underline">Terms of Service</Link> and <Link href="#" className="text-white hover:underline">Privacy Policy</Link>.
            </label>
          </div>
          
          <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 py-4 mt-4 bg-gradient-to-r from-[#0066CC] to-[#00D6FF] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(0,102,204,0.3)]">
            Create Account <CheckCircle2 className="w-4 h-4 ml-1" />
          </Link>
        </form>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400 font-light">
          Already have an account? <Link href="/login" className="text-white font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
