"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./container";
import {
  ArrowUp,
  ShieldCheck,
  Sparkles,
  Target,
  Compass,
  ArrowRight,
  Lock,
  Globe,
  HelpCircle,
  TrendingUp,
  Layers,
  Zap,
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
    <footer className="relative mt-24 border-t border-border/80 bg-card/90 backdrop-blur-2xl text-muted-foreground rounded-t-[2.5rem] sm:rounded-t-[4rem] transition-colors duration-200 shadow-2xl overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <Container className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
        {/* TOP BRAND STATEMENT & NEWSLETTER BAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-border/60 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono font-bold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Goal-Aware Financial Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-editorial text-foreground tracking-tight leading-tight">
              See tomorrow before deciding today.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl font-medium leading-relaxed">
              UseAimly calculates the exact time impact of every purchase decision on your future life goals. Protect your liquidity and stay on track.
            </p>
          </div>

          {/* Quick Newsletter / Action Card */}
          <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-background/80 p-6 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-foreground tracking-wider">
                Stay Ahead
              </span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Monthly Insights
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Get monthly decision strategy teardowns & liquidity optimization tips.
            </p>

            {isSubscribed ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-between gap-2 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Subscribed! Check your inbox for monthly strategy teardowns.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubscribed(false)}
                  className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 underline opacity-80 hover:opacity-100 shrink-0"
                >
                  Add another
                </button>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 pt-1">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden transition-colors"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold hover:opacity-95 transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* STRUCTURED NAVIGATION GRID */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          {/* Column 1: Brand & Status (Span 2 on mobile) */}
          <div className="col-span-2 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              The premier decision intelligence platform connecting present spending choices to long-term financial freedom.
            </p>

            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border/80 text-[11px] font-mono text-foreground font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Engine Status: Operational</span>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px]">
              Platform
            </h4>
            <ul className="space-y-2">
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
              <li>
                <Link href="/app/insights" className="hover:text-foreground transition-colors">
                  Proactive Foresight
                </Link>
              </li>
              <li>
                <Link href="/app/money" className="hover:text-foreground transition-colors">
                  Cashflow Registries
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Pricing & Tiers */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px]">
              Monetization
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Starter (Free)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <span>Pro Strategist</span>
                  <span className="text-[9px] bg-primary/20 text-primary font-bold px-1.5 py-0.2 rounded">
                    Popular
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Premium Elite
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Compare Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Security & Architecture */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold uppercase tracking-wider text-foreground text-[11px]">
              Security
            </h4>
            <ul className="space-y-2">
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
              <li>
                <Link href="/design-system" className="hover:text-foreground transition-colors">
                  Design System
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR & COPYRIGHT */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span>© {new Date().getFullYear()} UseAimly Inc. All rights reserved.</span>
            <span>•</span>
            <span className="text-foreground/80 font-semibold">Cash Affordability ≠ Plan Affordability</span>
          </div>

          {/* Back to Top & Region */}
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-muted-foreground">USD / KES Compatible</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1.5 text-[11px] font-bold text-foreground hover:border-primary/40 transition-colors cursor-pointer shadow-xs"
              title="Scroll to top"
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
