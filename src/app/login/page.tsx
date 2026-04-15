"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsLoading(true);

    // Mock authentication delay
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden selection:bg-[#00D6FF] selection:text-black px-6">

      {/* 
        ==============================
        BACKGROUND & ANIMATION LAYER
        ==============================
      */}
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#0066CC] opacity-10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Decorative CSS Ring Animation */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] flex justify-center items-center pointer-events-none z-0 opacity-50">
        <style dangerouslySetInnerHTML={{
          __html: `
          .anim-ring { position: absolute; inset: 0; border: 1px solid rgba(0, 214, 255, 0.15); transition: 0.5s; }
          .anim-ring.layer-1 { border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%; animation: spin1 20s linear infinite; }
          .anim-ring.layer-2 { border-radius: 41% 44% 56% 59% / 38% 62% 63% 37%; animation: spin1 15s linear infinite; }
          .anim-ring.layer-3 { border-radius: 41% 44% 56% 59% / 38% 62% 63% 37%; animation: spin2 25s linear infinite; }
          @keyframes spin1 { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes spin2 { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
        `}} />
        <div className="relative w-full h-full">
          <i className="anim-ring layer-1" />
          <i className="anim-ring layer-2" style={{ borderColor:"rgba(0, 102, 204, 0.15)" }} />
          <i className="anim-ring layer-3" style={{ borderColor: "rgba(255, 255, 255, 0.05)" }} />
        </div>
      </div>

      {/* 
        ==============================
        CENTERED LOGIN CARD (Foreground)
        ==============================
      */}
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">

        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 mb-8">
          <Image src="/favicon.ico" alt="AquaBuddy" width={48} height={48} className="w-12 h-12 object-contain invert brightness-0" priority />
          <span className="text-2xl tracking-[0.2em] font-light uppercase text-white">AquaBuddy</span>
        </div>

        {/* Glassmorphism Card */}
        <div className="w-full bg-[#111111]/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_0_80px_rgba(0,102,204,0.15)] relative overflow-hidden">

          {/* Internal soft top glow for premium glass feel */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D6FF]/30 to-transparent" />

          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Welcome back</h1>
            <p className="text-gray-400 font-light text-sm md:text-base">Sign in to your control center.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 ml-1">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-5 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00D6FF] focus:border-[#00D6FF] transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 ml-1">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-5 pr-12 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00D6FF] focus:border-[#00D6FF] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 rounded border border-white/20 bg-black/40 group-hover:border-[#00D6FF]/50 transition-colors">
                  <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                  <div className="absolute inset-0 bg-[#00D6FF] rounded opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors select-none">Remember me</span>
              </label>

              <Link href="#" className="text-xs text-gray-400 hover:text-[#00D6FF] transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              disabled={isLoading}
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-8 bg-white text-black hover:bg-gray-200 disabled:opacity-70 disabled:hover:bg-white rounded-xl font-bold transition-all relative overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
              ) : (
                <>
                  <span className="relative z-10 text-sm">Sign In</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Text */}
        <p className="mt-8 text-center text-sm text-gray-500 font-light">
          Don&apos;t have an account? <Link href="/register" className="text-white hover:text-[#00D6FF] font-medium transition-colors">Register device</Link>
        </p>

      </div>
    </div>
  );
}
