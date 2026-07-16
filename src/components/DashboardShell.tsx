"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, LayoutDashboard, Map, MessageSquare,
  MessageCircle, Bell, BarChart2,
  Settings, LogOut, Link2, Bot, Shield,
  Activity, Users, MessageSquareMore,
  Gamepad2, HardDrive, ScrollText, DollarSign,
  Wrench, Cpu, Rocket, Crown, Database,
  Cloud, ToggleLeft, UserCog, FileText
} from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import LinkRobotModal from "./modals/LinkRobotModal";
import { useAuth } from "@/hooks/useAuth";
import { useRobot } from "@/hooks/useRobot";

// ─── Registered User (0 robots) ───
const registeredUserLinks = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Live Map", href: "/dashboard/map", icon: Map },
  { name: "Robot", href: "/robot", icon: Rocket },
  { name: "Feedback", href: "/dashboard/feedback", icon: MessageCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

// ─── Activated User (owns ≥1 robot) ───
const activatedUserLinks = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Live Map", href: "/dashboard/map", icon: Map },
  { name: "Robot", href: "/robot", icon: Rocket },
  { name: "Robot Telemetry", href: "/dashboard/robot-management", icon: Cpu },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "AquaBot AI", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Firmware", href: "/dashboard/firmware", icon: HardDrive },
  { name: "Maintenance", href: "/dashboard/booking", icon: Wrench },
  { name: "Feedback", href: "/dashboard/feedback", icon: MessageCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

// ─── Administrator ───
const adminUserLinks = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Live Map", href: "/dashboard/map", icon: Map },
  { name: "Live Operations", href: "/dashboard/live-operations", icon: Activity },
  { name: "Remote Control", href: "/dashboard/remote-control", icon: Gamepad2 },
  { name: "AquaBot AI", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Robot Management", href: "/dashboard/robot-management", icon: Bot },
  { name: "User Management", href: "/dashboard/user-management", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { name: "Robot Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Revenue Dashboard", href: "/dashboard/revenue", icon: DollarSign },
  { name: "Feedback Mgmt", href: "/dashboard/feedback-management", icon: MessageSquareMore },
  { name: "Firmware Mgmt", href: "/dashboard/firmware-management", icon: HardDrive },
  { name: "Robot Logs", href: "/dashboard/robot-logs", icon: ScrollText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

// ─── Platform Owner ───
const ownerUserLinks = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Live Map", href: "/dashboard/map", icon: Map },
  { name: "Live Operations", href: "/dashboard/live-operations", icon: Activity },
  { name: "Remote Control", href: "/dashboard/remote-control", icon: Gamepad2 },
  { name: "AquaBot AI", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Robot Management", href: "/dashboard/robot-management", icon: Bot },
  { name: "User Management", href: "/dashboard/user-management", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { name: "Robot Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Revenue Dashboard", href: "/dashboard/revenue", icon: DollarSign },
  { name: "Feedback Mgmt", href: "/dashboard/feedback-management", icon: MessageSquareMore },
  { name: "Firmware Mgmt", href: "/dashboard/firmware-management", icon: HardDrive },
  { name: "Robot Logs", href: "/dashboard/robot-logs", icon: ScrollText },
  // ─ Owner-exclusive pages ─
  { name: "Platform Settings", href: "/dashboard/platform-settings", icon: Crown },
  { name: "Database Health", href: "/dashboard/database-health", icon: Database },
  { name: "Cloud Status", href: "/dashboard/cloud-status", icon: Cloud },
  { name: "Feature Flags", href: "/dashboard/feature-flags", icon: ToggleLeft },
  { name: "Admin Management", href: "/dashboard/admin-management", icon: UserCog },
  { name: "Audit Logs", href: "/dashboard/audit-logs", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLinkRobotOpen, setIsLinkRobotOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const { robots, fetchRobots } = useRobot();

  useEffect(() => {
    if (isAuthenticated) {
      void fetchRobots();
    }
  }, [fetchRobots, isAuthenticated]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const isOwner = user?.role === "OWNER";
  const isAdmin = user?.role === "ADMIN";
  const isActivatedUser = user?.role === "USER" && robots.length > 0;

  const sidebarLinks = useMemo(() => {
    if (isOwner) return ownerUserLinks;
    if (isAdmin) return adminUserLinks;
    if (isActivatedUser) return activatedUserLinks;
    return registeredUserLinks;
  }, [isOwner, isAdmin, isActivatedUser]);

  const roleLabel = isOwner ? "Platform Owner" : isAdmin ? "Administrator" : isActivatedUser ? "Activated" : "Registered";
  const roleBadgeColor = isOwner
    ? "text-purple-400 bg-purple-500/10 border-purple-500/20"
    : isAdmin
      ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
      : isActivatedUser
        ? "text-accent bg-accent/10 border-accent/20"
        : "text-foreground/60 bg-foreground/5 border-foreground/10";
  const initials = `${user?.firstName?.[0] || "A"}${user?.lastName?.[0] || "B"}`.toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 h-16 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <button
            onClick={toggleSidebar}
            className="group flex flex-col gap-[5px] p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-black/10 dark:hover:border-white/10"
            aria-label="Toggle Menu"
          >
            <span className="h-[2px] w-5 bg-foreground/80 rounded-full group-hover:bg-foreground transition-colors" />
            <span className="h-[2px] w-5 bg-foreground/80 rounded-full group-hover:bg-foreground transition-colors" />
            <span className="h-[2px] w-5 bg-foreground/80 rounded-full group-hover:bg-foreground transition-colors" />
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-secondaryBg p-1.5 rounded-lg border border-black/10 dark:border-white/10 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
              <Image src="/assets/logo.png" alt="Logo" width={20} height={20} className="w-5 h-5 object-contain" />
            </div>
            <span className="font-semibold tracking-tight hidden sm:block text-foreground">
              AquaBuddy <span className="font-light italic text-foreground/50 text-sm">Dashboard</span>
            </span>
          </Link>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 opacity-80 pointer-events-none">
          <span className="text-sm font-medium tracking-wide text-foreground drop-shadow-md">
            {sidebarLinks.find(l => l.href === pathname)?.name || "Dashboard"}
          </span>
        </div>

        <div className="flex items-center gap-5">
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 border rounded-full ${roleBadgeColor}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase">{roleLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsLinkRobotOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 bg-secondaryBg border border-black/10 dark:border-white/10 rounded-xl text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Link2 className="w-4 h-4" />
            Link Robot
          </button>
          <ThemeToggle />
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0066CC] to-[#00D6FF] shadow-[0_0_15px_rgba(0,102,204,0.3)] hover:shadow-[0_0_20px_rgba(0,214,255,0.5)] cursor-pointer transition-shadow flex items-center justify-center text-[11px] font-bold text-white">
            {initials}
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative">
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={closeSidebar}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />

              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-[280px] bg-secondaryBg/95 backdrop-blur-xl border-r border-black/5 dark:border-white/5 shadow-2xl z-50 flex flex-col"
              >
                <div className="h-16 px-6 flex items-center border-b border-black/5 dark:border-white/5 justify-between bg-black/5 dark:bg-black/20">
                  <span className="font-bold tracking-widest text-xs uppercase text-foreground/60">Navigation</span>
                  <button onClick={closeSidebar} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-foreground/60 hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLinkRobotOpen(true);
                      closeSidebar();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors mb-4 cursor-pointer"
                  >
                    <Link2 className="w-4 h-4" />
                    Link Robot
                  </button>

                  {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                            ? "bg-accent/15 text-accent font-medium border border-accent/30 shadow-[0_0_10px_rgba(0,102,204,0.1)]"
                            : "text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 font-light"
                          }`}
                      >
                        <link.icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-foreground/50"}`} />
                        <span className="text-sm">{link.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-black/20">
                  <button
                    type="button"
                    onClick={() => void logout()}
                    disabled={isAuthLoading}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-colors text-sm font-medium disabled:opacity-60 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Secure Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 w-full pb-20 md:pb-12 bg-background min-h-[calc(100vh-200px)]">
          {children}
        </main>
      </div>

      <LinkRobotModal isOpen={isLinkRobotOpen} onClose={() => setIsLinkRobotOpen(false)} />
    </div>
  );
};
