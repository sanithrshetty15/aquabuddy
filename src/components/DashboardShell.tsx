"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, LayoutDashboard, Map, MessageSquare, Calendar,
  MessageCircle, Bell, ShoppingCart, CreditCard, BarChart2,
  Settings, LogOut
} from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Live Map Tracking", href: "/dashboard/map", icon: Map },
  { name: "AquaBot AI", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Booking System", href: "/dashboard/booking", icon: Calendar },
  { name: "Feedback", href: "/dashboard/feedback", icon: MessageCircle },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Robot Purchase", href: "/buy-robot", icon: ShoppingCart },
  { name: "Plans", href: "/plans", icon: CreditCard },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on responsive resize if needed, or simply maintain state.
  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <button
            onClick={toggleSidebar}
            className="group flex flex-col gap-[5px] p-2 hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/10"
            aria-label="Toggle Menu"
          >
            <span className="h-[2px] w-5 bg-white/80 rounded-full group-hover:bg-white transition-colors" />
            <span className="h-[2px] w-5 bg-white/80 rounded-full group-hover:bg-white transition-colors" />
            <span className="h-[2px] w-5 bg-white/80 rounded-full group-hover:bg-white transition-colors" />
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-white/5 p-1.5 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
              <Image src="/assets/logo.png" alt="Logo" width={20} height={20} className="w-5 h-5 object-contain" />
            </div>
            <span className="font-semibold tracking-tight hidden sm:block text-gray-100">
              AquaBuddy <span className="font-light italic text-gray-500 text-sm">Dashboard</span>
            </span>
          </Link>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 hidden md:flex opacity-80 pointer-events-none">
          <span className="text-sm font-medium tracking-wide text-white drop-shadow-md">
            {links.find(l => l.href === pathname)?.name || "Dashboard"}
          </span>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#00D6FF]/10 border border-[#00D6FF]/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00D6FF] animate-pulse" />
            <span className="text-xs font-semibold text-[#00D6FF] tracking-wider uppercase">Owner Role</span>
          </div>
          <ThemeToggle />
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0066CC] to-[#00D6FF] shadow-[0_0_15px_rgba(0,102,204,0.3)] hover:shadow-[0_0_20px_rgba(0,214,255,0.5)] cursor-pointer transition-shadow" />
        </div>
      </header>

      <div className="flex-1 flex relative">
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={closeSidebar}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />

              {/* Drawer Content */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0A0A0C]/95 backdrop-blur-xl border-r border-white/5 shadow-2xl z-50 flex flex-col"
              >
                <div className="h-16 px-6 flex items-center border-b border-white/5 justify-between bg-black/20">
                  <span className="font-bold tracking-widest text-xs uppercase text-gray-400">Navigation Menu</span>
                  <button onClick={closeSidebar} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                  {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                            ? "bg-[#0066CC]/15 text-[#00D6FF] font-medium border border-[#0066CC]/30 shadow-[0_0_10px_rgba(0,102,204,0.1)]"
                            : "text-gray-400 hover:text-white hover:bg-white/5 font-light"
                          }`}
                      >
                        <link.icon className={`w-4 h-4 ${isActive ? "text-[#00D6FF]" : "text-gray-500"}`} />
                        <span className="text-sm">{link.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-white/5 bg-black/20">
                  <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium">
                    <LogOut className="w-4 h-4" />
                    Secure Logout
                  </Link>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Viewport */}
        <main className="flex-1 w-full pb-20 md:pb-12 bg-[#050505]">
          {children}
        </main>
      </div>
    </div>
  );
};
