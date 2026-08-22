"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./container";
import { UseaimlyLogo } from "../design-system/UseaimlyLogo";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useCurrency } from "@/lib/currency/currency-context";
import {
  ArrowUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Globe,
  CheckCircle2,
  Activity,
  Award,
} from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const isAppView = pathname.startsWith("/app");
  const { t } = useI18n();
  const { currency } = useCurrency();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

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

  // Compact Minimalist Footer for Authenticated App View (/app)
  if (isAppView) {
    return (
      <footer className="w-full border-t border-border/60 bg-card/60 backdrop-blur-md py-6 mt-16 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3 text-muted-foreground">
            <UseaimlyLogo size="sm" showTagline={false} />
            <span className="text-zinc-600 dark:text-zinc-400">•</span>
            <span className="text-foreground/90 font-medium">
              {t("footerTagline")}
            </span>
          </div>

          <div className="flex items-center gap-6 text-muted-foreground text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {t("systemOperational")}
              </span>
            </div>
            <Link href="/app/goals" className="hover:text-foreground transition-colors font-medium">
              {t("navDestinations")}
            </Link>
            <Link href="/app/decide" className="hover:text-foreground transition-colors font-medium">
              {t("navDecide")}
            </Link>
            <Link href="/app/settings" className="hover:text-foreground transition-colors font-medium">
              {t("navSettings")}
            </Link>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg border border-border bg-secondary/50 text-foreground hover:bg-secondary transition-colors cursor-pointer"
              title={t("footerBackToTop")}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    );
  }

  // Full Executive Landing & Public Footer
  return (
    <footer className="relative mt-20 border-t border-zinc-800/80 bg-[#0B0C10] text-zinc-300 rounded-t-[3rem] shadow-2xl overflow-hidden font-sans">
      {/* Top Emerald Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[120px] bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent blur-2xl pointer-events-none" />

      <Container className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* BRAND STATEMENT & NEWSLETTER CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-zinc-800/80 items-center">
          <div className="lg:col-span-7 space-y-3 text-left">
            <UseaimlyLogo size="md" showTagline={true} />
            <p className="text-sm text-zinc-400 max-w-xl font-medium leading-relaxed">
              UseAimly is a goal-aware decision intelligence platform. We calculate the exact future arrival impact of every purchase decision before you spend, protecting your cashflow resilience.
            </p>
          </div>

          {/* Strategic Insights Newsletter Card */}
          <div className="lg:col-span-5 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-zinc-100 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t("footerBriefingTitle")}</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-extrabold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {t("footerBriefingTag")}
              </span>
            </div>

            {isSubscribed ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300 font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t("footerSubscribedSuccess")}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubscribed(false)}
                  className="text-[10px] font-mono underline opacity-80 shrink-0 hover:opacity-100"
                >
                  Reset
                </button>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={t("footerSubscribePlaceholder")}
                  required
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none min-h-[42px] font-medium"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-2.5 text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 min-h-[42px] shadow-sm"
                >
                  <span>{t("footerSubscribeBtn")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* STRUCTURED HIGH-CONTRAST NAVIGATION GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-left">
          {/* Column 1: Engine Status */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold uppercase tracking-wider text-zinc-100 text-xs">
              {t("footerSystemHealth")}
            </h4>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t("systemOperational")}</span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Deterministic Engine v2.5
            </p>
            <p className="text-[11px] text-zinc-500 font-mono">
              {t("deterministicMath")}
            </p>
          </div>

          {/* Column 2: Platform Features */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold uppercase tracking-wider text-zinc-100 text-xs">
              {t("footerCorePlatform")}
            </h4>
            <ul className="space-y-2 text-zinc-400 font-medium">
              <li>
                <Link href="/app/goals" className="hover:text-emerald-400 transition-colors">
                  {t("navDestinations")}
                </Link>
              </li>
              <li>
                <Link href="/app/decide" className="hover:text-emerald-400 transition-colors">
                  {t("navDecide")}
                </Link>
              </li>
              <li>
                <Link href="/app/what-if" className="hover:text-emerald-400 transition-colors">
                  {t("navWhatIf")}
                </Link>
              </li>
              <li>
                <Link href="/app/money?tab=INVESTMENTS" className="hover:text-emerald-400 transition-colors">
                  {t("navInvestments")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Monetization & Pricing */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold uppercase tracking-wider text-zinc-100 text-xs">
              {t("footerMonetization")}
            </h4>
            <ul className="space-y-2 text-zinc-400 font-medium">
              <li>
                <Link href="/pricing" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>Free Starter</span>
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>Aimly Pro</span>
                  <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded">Popular</span>
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>Aimly Premium</span>
                  <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded">Complete</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Security & Compliance */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold uppercase tracking-wider text-zinc-100 text-xs">
              {t("footerSecurity")}
            </h4>
            <ul className="space-y-2 text-zinc-300 font-medium">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Deterministic Computation</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero Bank Login Credentials</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Row Level Security (RLS)</span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>SOC2 Type II Ready</span>
              </li>
            </ul>
          </div>
        </div>

        {/* EXECUTIVE COPYRIGHT & BACK TO TOP BAR */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-zinc-400">
            <span>© {new Date().getFullYear()} UseAimly Inc. {t("rightsReserved")}</span>
            <span>•</span>
            <span className="text-zinc-200 font-bold">
              Cash Affordability ≠ Plan Affordability
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-zinc-500">Currency: {currency}</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-bold text-zinc-100 hover:border-emerald-500 transition-colors cursor-pointer shadow-sm"
            >
              <span>{t("footerBackToTop")}</span>
              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
