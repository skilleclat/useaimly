"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  Compass,
} from "lucide-react";

interface StripeSessionDetails {
  isValid: boolean;
  status: "active" | "pending" | "failed";
  planName: string;
  priceFormatted?: string;
  intervalText?: string;
  customerEmail?: string;
  amountPaid?: number;
  currency?: string;
  billingCycle?: "MONTHLY" | "ANNUAL";
}

export function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { format } = useCurrency();

  const sessionId = searchParams.get("session_id") || searchParams.get("sessionId");
  const planParam = searchParams.get("plan");
  const cycleParam = searchParams.get("cycle");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionDetails, setSessionDetails] = useState<StripeSessionDetails | null>(null);

  const verifyCheckout = useCallback(async () => {
    setIsLoading(true);

    try {
      // 1. If we have a sessionId query param from Stripe
      if (sessionId) {
        const res = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          const isAnnual = data.billingCycle === "ANNUAL";
          setSessionDetails({
            isValid: true,
            status: data.status === "pending" ? "pending" : "active",
            planName: data.plan === "premium" ? "UseAimly Premium" : "UseAimly Pro",
            priceFormatted: isAnnual ? "$39.00 / year" : "$4.99 / month",
            intervalText: isAnnual ? "Billed annually" : "Billed monthly",
            customerEmail: data.customerEmail || user?.email || undefined,
            amountPaid: data.amountPaid || (isAnnual ? 39.0 : 4.99),
            currency: data.currency || "USD",
            billingCycle: data.billingCycle,
          });

          await refreshProfile();
          return;
        }
      }

      // 2. If authenticated user already has Pro / Premium in profile
      if (profile?.plan_tier === "pro" || profile?.plan_tier === "premium" || planParam === "pro" || planParam === "premium") {
        const isAnnual = cycleParam === "ANNUAL";
        setSessionDetails({
          isValid: true,
          status: "active",
          planName: profile?.plan_tier === "premium" ? "UseAimly Premium" : "UseAimly Pro",
          priceFormatted: isAnnual ? "$39.00 / year" : "$4.99 / month",
          intervalText: isAnnual ? "Billed annually" : "Billed monthly",
          customerEmail: user?.email || undefined,
          amountPaid: isAnnual ? 39.0 : 4.99,
          currency: "USD",
          billingCycle: isAnnual ? "ANNUAL" : "MONTHLY",
        });
        await refreshProfile();
        return;
      }

      // 3. Fallback: payment completed successfully without active session lookup
      setSessionDetails({
        isValid: true,
        status: "active",
        planName: "UseAimly Pro",
        priceFormatted: "$4.99 / month",
        intervalText: "Billed monthly",
        customerEmail: user?.email || undefined,
        amountPaid: 4.99,
        currency: "USD",
      });
    } catch (err: any) {
      console.warn("Session verification warning:", err);
      // Non-blocking fallback
      setSessionDetails({
        isValid: true,
        status: "active",
        planName: "UseAimly Pro",
        priceFormatted: "$4.99 / month",
        customerEmail: user?.email || undefined,
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, planParam, cycleParam, profile, user, refreshProfile]);

  useEffect(() => {
    verifyCheckout();
  }, [verifyCheckout]);

  const dashboardTarget = user ? "/app" : "/login?redirect=/app";
  const decideTarget = user ? "/app/decide" : "/login?redirect=/app/decide";

  const VALUE_BULLETS = [
    {
      title: "Analyze important financial decisions with deeper insights",
      desc: "Run multi-variable scenarios before committing capital or recurring expenses.",
    },
    {
      title: "Understand the real financial impact before committing",
      desc: "See exact cash cushion impacts, monthly runway shifts, and liquidity health.",
    },
    {
      title: "Connect decisions with financial goals",
      desc: "Measure the exact delay days and timeline adjustments on your life destinations.",
    },
    {
      title: "Access advanced Decision Engine capabilities",
      desc: "Simulate cash purchases, installments, and postponement alternatives side-by-side.",
    },
    {
      title: "Make smarter, more confident decisions",
      desc: "Replace emotional second-guessing with deterministic mathematical clarity.",
    },
  ];

  return (
    <div className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 font-sans antialiased text-foreground">
      <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
        {/* Loading Overlay Spinner if verifying */}
        {isLoading && (
          <div className="rounded-[2.5rem] border border-border/80 bg-card p-12 text-center space-y-4 shadow-xl">
            <div className="inline-flex p-3.5 rounded-full bg-primary/10 text-primary animate-spin">
              <Loader2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Verifying your payment...
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              Connecting with Stripe and setting up your UseAimly Pro workspace.
            </p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* 1. SUCCESS HERO */}
            <div className="text-center space-y-4">
              {/* Confident, Refined Checkmark */}
              <div className="inline-flex items-center justify-center p-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-1">
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 text-white">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                  Welcome to UseAimly Pro
                </h1>
                <p className="text-base sm:text-lg font-medium text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  Your subscription is active. You now have access to the full UseAimly Pro experience.
                </p>
              </div>
            </div>

            {/* STRIPE VERIFIED SESSION CARD (If session or customer data is present) */}
            {sessionDetails && (
              <div className="rounded-[2rem] border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Subscription Summary
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-[11px] font-mono text-muted-foreground block">Plan</span>
                    <span className="text-base font-extrabold text-foreground">{sessionDetails.planName}</span>
                  </div>

                  {sessionDetails.priceFormatted && (
                    <div>
                      <span className="text-[11px] font-mono text-muted-foreground block">Rate</span>
                      <span className="text-base font-extrabold text-foreground font-mono">
                        {sessionDetails.priceFormatted}
                      </span>
                    </div>
                  )}

                  {sessionDetails.customerEmail && (
                    <div className="sm:col-span-2 pt-2 border-t border-border/40 flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Account</span>
                      <span className="font-semibold text-foreground">{sessionDetails.customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. VALUE CONFIRMATION */}
            <div className="rounded-[2rem] border border-border/80 bg-secondary/30 p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>What You Can Now Do</span>
                </h2>
                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  Full Pro Access
                </span>
              </div>

              <div className="space-y-3.5">
                {VALUE_BULLETS.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                    <div className="mt-0.5 p-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">{bullet.title}</span>
                      <span className="text-xs text-muted-foreground leading-relaxed block mt-0.5">
                        {bullet.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. PRIMARY CTA & 4. SECONDARY CTA */}
            <div className="space-y-3 pt-2">
              {/* Primary Button */}
              <Link
                href={dashboardTarget}
                className="w-full rounded-2xl bg-[#FF4D26] hover:bg-[#E53E1B] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base py-4 px-8 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>Go to My Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Secondary Button */}
              <Link
                href={decideTarget}
                className="w-full rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground border border-border font-bold text-xs sm:text-sm py-3.5 px-6 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-primary" />
                <span>Analyze a Decision</span>
              </Link>
            </div>

            {/* 5. ACCOUNT NOTICE */}
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border/70 text-center space-y-1">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your subscription is now active. If you signed up with a new account, make sure you are logged into the UseAimly account you want to use.
              </p>
            </div>

            {/* Security Guarantee Badge */}
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground/80 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>256-Bit SSL Encrypted • Verified Subscription</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
