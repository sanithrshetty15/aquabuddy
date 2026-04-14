"use client";

import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
      <Navbar />
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00D6FF] opacity-5 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-400 font-light">Log in to manage your AquaBuddy system.</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input type="email" placeholder="hello@aquabuddy.com" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-400">
              <input type="checkbox" className="mr-2 rounded border-white/20 bg-black/40 text-accent focus:ring-accent" />
              Remember me
            </label>
            <Link href="#" className="text-accent hover:text-[#00D6FF] transition-colors">Forgot password?</Link>
          </div>
          <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 py-4 mt-2 bg-gradient-to-r from-[#0066CC] to-[#00D6FF] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(0,102,204,0.3)]">
            Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400 font-light">
          Don't have an account? <Link href="/register" className="text-white font-medium hover:underline">Register your device</Link>
        </p>
      </div>
    </div>
  );
}
