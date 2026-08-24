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
  Check,
} from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const isAppView = pathname.startsWith("/app");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isDecidePage = pathname.startsWith("/app/decide") || pathname === "/decide" || pathname.startsWith("/app/decisions");
  const isCheckout = pathname.startsWith("/checkout");

  // Hide footer on mobile screens (< 768px) during onboarding, decision completion, and checkout flows
  const hideOnMobile = isOnboarding || isDecidePage || isCheckout;

  const { t, language } = useI18n();
  const isFr = language === "fr";
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
      <footer className={`w-full border-t border-border/60 bg-card/60 backdrop-blur-md py-6 mt-16 transition-colors ${hideOnMobile ? "hidden md:block" : ""}`}>
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
    <footer className={`relative mt-8 sm:mt-16 border-t border-zinc-800/80 bg-[#09090C] text-zinc-300 rounded-t-[2.5rem] sm:rounded-t-[3rem] shadow-2xl overflow-hidden font-sans ${hideOnMobile ? "hidden md:block" : ""}`}>
      {/* Subtle Warm Amber/Orange Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[120px] bg-gradient-to-b from-[#FF5533]/10 via-[#FF5533]/3 to-transparent blur-2xl pointer-events-none" />

      <Container size="hero" className="py-10 sm:py-16 px-4 sm:px-6 lg:px-10 2xl:px-16 space-y-10 sm:space-y-14 relative z-10">
        {/* BRAND STATEMENT & NEWSLETTER CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-zinc-800/80 items-center">
          <div className="lg:col-span-7 space-y-3 text-left">
            <UseaimlyLogo size="md" showTagline={true} />
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-medium leading-relaxed">
              {isFr
                ? "UseAimly est une plateforme d'intelligence décisionnelle financière. Nous calculons l'impact prédictif de chaque achat sur vos liquidités, vos charges fixes et vos objectifs de vie."
                : "UseAimly is a financial decision intelligence platform. We calculate the exact future arrival impact of every purchase decision before you commit, protecting your cashflow resilience."}
            </p>
          </div>

          {/* Strategic Insights Newsletter Card */}
          <div className="lg:col-span-5 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4 sm:p-5 space-y-3 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-zinc-100 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5533]" />
                <span>{t("footerBriefingTitle")}</span>
              </span>
              <span className="text-[10px] font-mono text-[#FF5533] font-bold bg-[#FF5533]/15 px-2.5 py-0.5 rounded-full border border-[#FF5533]/30">
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
                  className="text-[10px] font-mono underline opacity-80 shrink-0 hover:opacity-100 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={t("footerSubscribePlaceholder")}
                  required
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-[#FF5533] focus:outline-none min-h-[42px] font-medium"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-[#FF5533] hover:bg-[#FF4422] text-white px-5 py-2.5 text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px] shadow-sm"
                >
                  <span>{t("footerSubscribeBtn")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* STRUCTURED HIGH-CONTRAST NAVIGATION GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-xs text-left">
          {/* Column 1: Engine Status */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold uppercase tracking-wider text-zinc-100 text-xs">
              {t("footerSystemHealth")}
            </h4>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t("systemOperational")}</span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Decision Engine v2.5
            </p>
            <p className="text-[11px] text-zinc-500 font-mono">
              Same inputs → same calculation → same result
            </p>
          </div>

          {/* Column 2: Platform Features */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold uppercase tracking-wider text-zinc-100 text-xs">
              {isFr ? "Plateforme" : "Platform"}
            </h4>
            <ul className="space-y-2 text-zinc-400 font-medium">
              <li>
                <Link href="/app/decide" className="hover:text-white transition-colors">
                  {isFr ? "Studio de Décision" : "Decision Studio"}
                </Link>
              </li>
              <li>
                <Link href="/app/goals" className="hover:text-white transition-colors">
                  {isFr ? "Objectifs de Vie" : "Life Destinations"}
                </Link>
              </li>
              <li>
                <Link href="/app/what-if" className="hover:text-white transition-colors">
                  {isFr ? "Simulations Et Si" : "What-If Sandbox"}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  {isFr ? "Tarifs & Offres" : "Pricing & Plans"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Positioning */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold uppercase tracking-wider text-zinc-100 text-xs">
              {isFr ? "Méthodologie" : "Methodology"}
            </h4>
            <ul className="space-y-2 text-zinc-400 font-medium">
              <li>
                <span className="text-zinc-300">Modèle des 3 Piliers</span>
              </li>
              <li>
                <span className="text-zinc-300">Coût Futur d'une Décision</span>
              </li>
              <li>
                <span className="text-zinc-300">Calcul Déterministe</span>
              </li>
              <li>
                <span className="text-zinc-300">Résilience du Cashflow</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Security & Privacy */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold uppercase tracking-wider text-zinc-100 text-xs">
              {isFr ? "Confiance & Sécurité" : "Trust & Security"}
            </h4>
            <ul className="space-y-2 text-zinc-300 font-medium">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#FF5533] shrink-0" />
                <span>Calculs purs sans hallucination</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zéro identifiant bancaire requis</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Row Level Security (RLS) isolé</span>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT & BACK TO TOP BAR */}
        <div className="pt-6 sm:pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-zinc-400 text-center sm:text-left">
            <span>© {new Date().getFullYear()} UseAimly. {t("rightsReserved")}</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-zinc-200 font-bold block sm:inline">
              Don&apos;t just see what it costs. See what it changes.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-zinc-500 text-[11px]">Currency: {currency}</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-3.5 py-1.5 text-xs font-bold text-zinc-100 hover:border-[#FF5533] transition-colors cursor-pointer shadow-sm"
            >
              <span>{t("footerBackToTop")}</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#FF5533]" />
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
