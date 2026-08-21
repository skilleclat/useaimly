"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./container";
import { UseaimlyLogo } from "../design-system/UseaimlyLogo";
import {
  ArrowUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Globe,
} from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Hide root footer on authenticated application pages
  if (pathname.startsWith("/app")) {
    return null;
  }

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setIsSubscribed(true);
    setNewsletterEmail("");
  };

  return (
    <footer className="relative mt-12 border-t border-border/80 bg-[#09090D] text-muted-foreground transition-colors duration-200 shadow-2xl overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[150px] bg-primary/5 blur-[100px] pointer-events-none" />

      <Container className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* BRAND STATEMENT & NEWSLETTER BAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 border-b border-border/40 items-center">
          <div className="lg:col-span-7 space-y-2 text-left">
            <UseaimlyLogo size="md" showTagline={true} />
            <p className="text-xs text-muted-foreground max-w-lg font-medium leading-relaxed pt-1">
              UseAimly calculates the exact time impact of every purchase decision on your future life goals. Protect your liquidity and stay on track.
            </p>
          </div>

          {/* Quick Newsletter Card */}
          <div className="lg:col-span-5 rounded-2xl border border-border/60 bg-card/60 p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-foreground tracking-wider">
                Stay Ahead
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Monthly Teardowns
              </span>
            </div>

            {isSubscribed ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-400 font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Subscribed! Check your inbox.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubscribed(false)}
                  className="text-[10px] font-mono underline opacity-80 shrink-0"
                >
                  Add another
                </button>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden min-h-[36px]"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:opacity-95 transition-all shrink-0 cursor-pointer flex items-center gap-1 min-h-[36px]"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* COMPACT STRUCTURED NAVIGATION GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-left">
          {/* Column 1: Engine Status */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px]">
              Engine Status
            </h4>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Operational</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Deterministic Math Engine v2.4
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div className="space-y-2">
            <h4 className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px]">
              Platform
            </h4>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>
                <Link href="/app/goals" className="hover:text-foreground transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/app/decide" className="hover:text-foreground transition-colors">
                  Simulate Decision
                </Link>
              </li>
              <li>
                <Link href="/app/what-if" className="hover:text-foreground transition-colors">
                  What-If Laboratory
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Monetization */}
          <div className="space-y-2">
            <h4 className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px]">
              Monetization
            </h4>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Starter (Free)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pro Strategist
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Premium Elite
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Security */}
          <div className="space-y-2">
            <h4 className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px]">
              Security
            </h4>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-1.5 text-foreground/80 font-medium">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>Deterministic Math</span>
              </li>
              <li className="flex items-center gap-1.5 text-foreground/80 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Zero Bank Logins</span>
              </li>
              <li className="flex items-center gap-1.5 text-foreground/80 font-medium">
                <Globe className="w-3 h-3 text-emerald-500" />
                <span>Local Privacy First</span>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT BAR */}
        <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-muted-foreground">
            <span>© {new Date().getFullYear()} UseAimly Inc. All rights reserved.</span>
            <span>•</span>
            <span className="text-foreground/80 font-semibold">Cash Affordability ≠ Plan Affordability</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">USD / KES</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card px-3 py-1 text-[10px] font-bold text-foreground hover:border-primary/40 transition-colors cursor-pointer"
            >
              <span>Top</span>
              <ArrowUp className="w-3 h-3 text-primary" />
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
