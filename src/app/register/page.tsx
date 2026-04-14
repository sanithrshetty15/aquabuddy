"use client";

import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden pt-20">
      <Navbar />
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0066CC] opacity-10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl my-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create Account</h1>
          <p className="text-gray-400 font-light">Join the future of water independence.</p>
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

        <p className="mt-8 text-center text-sm text-gray-400 font-light">
          Already have an account? <Link href="/login" className="text-white font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
