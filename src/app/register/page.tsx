"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const { register, isLoading, error: authError } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !state || !city || !password || !confirmPassword) {
      setLocalError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters long.");
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setLocalError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setLocalError("");
    await register({
      firstName,
      lastName,
      email,
      phone,
      country,
      state,
      city,
      password,
      confirmPassword,
      termsAccepted: agreeTerms,
      privacyAccepted: agreePrivacy,
    });
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden pt-24 pb-12 px-4">
      <Navbar />

      {/* Decorative Blur Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-accent/5 opacity-40 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-[500px] flex flex-col items-center">
        {/* Glassmorphism Card */}
        <div className="w-full bg-secondaryBg/80 backdrop-blur-3xl border border-black/5 dark:border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">Create Account</h1>
            <p className="text-foreground/60 font-light text-sm">Join the future of water independence.</p>
          </div>

          {displayError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="flex-1">{displayError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1.5">First Name</label>
                <input
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-black/10 dark:border-white/10 rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1.5">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-black/10 dark:border-white/10 rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent text-sm"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="hello@aquabuddy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-black/10 dark:border-white/10 rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-black/10 dark:border-white/10 rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent text-sm"
                />
              </div>
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1.5">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-black/10 dark:border-white/10 rounded-xl text-foreground focus:outline-none focus:border-accent text-xs cursor-pointer"
                >
                  <option value="India">India</option>
                  <option value="United States">USA</option>
                  <option value="Germany">Germany</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1.5">State</label>
                <input
                  type="text"
                  placeholder="Karnataka"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-black/10 dark:border-white/10 rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1.5">City</label>
                <input
                  type="text"
                  placeholder="Mangaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-black/10 dark:border-white/10 rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent text-xs"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-black/10 dark:border-white/10 rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/50 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-black/10 dark:border-white/10 rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent text-sm"
                />
              </div>
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-2 mt-4 text-xs">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 mr-2 rounded border-black/10 dark:border-white/20 bg-background text-accent focus:ring-accent cursor-pointer"
                />
                <label className="text-foreground/60 leading-snug cursor-pointer">
                  I agree to the <Link href="#" className="text-foreground font-semibold hover:underline">Terms of Service</Link>.
                </label>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="mt-0.5 mr-2 rounded border-black/10 dark:border-white/20 bg-background text-accent focus:ring-accent cursor-pointer"
                />
                <label className="text-foreground/60 leading-snug cursor-pointer">
                  I agree to the <Link href="#" className="text-foreground font-semibold hover:underline">Privacy Policy</Link>.
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 disabled:opacity-75 transition-all shadow-[0_0_20px_rgba(0,102,204,0.15)] cursor-pointer mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account <CheckCircle2 className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-foreground/60 font-light">
          Already have an account? <Link href="/login" className="text-foreground font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
