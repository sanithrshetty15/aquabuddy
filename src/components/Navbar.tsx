"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { name: "Robot", href: "/robot" },
  { name: "Features", href: "/#features" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[60px] flex items-center ${
        scrolled
          ? "bg-white/85 dark:bg-[#050505]/85 backdrop-blur-md border-b border-black/5 dark:border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between h-full w-full max-w-7xl">
        <Link href="/" className="flex items-center gap-2 group z-50">
          <Image
            src="/assets/logo.png"
            alt="AquaBuddy Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
            priority
          />
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-baseline gap-1">
            AquaBuddy
            <span className="font-light italic text-sm text-gray-500 hover:text-accent transition-colors">
              E-tech
            </span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions & Theme */}
        <div className="hidden md:flex items-center gap-4 z-50">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/robot"
            className="text-sm font-medium bg-accent hover:bg-accentGlow text-white px-5 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(0,102,204,0.3)] hover:shadow-[0_0_20px_rgba(0,214,255,0.5)]"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4 z-50">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -mr-2 text-foreground/80 hover:text-foreground outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[60px] left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-black/5 dark:border-white/5 md:hidden shadow-lg"
          >
            <div className="flex flex-col p-6 gap-6">
              <ul className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-foreground/90 hover:text-accent transition-colors block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-foreground font-medium py-3 rounded-lg bg-secondaryBg"
                >
                  Log in
                </Link>
                <Link
                  href="/robot"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-lg text-white font-medium bg-gradient-to-r from-accent to-accentGlow"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
