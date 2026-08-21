"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { parseDecisionQuery } from "@/lib/nlp/decision-query-parser";
import { simulateDecision, BaselineFinancialProfile } from "@/lib/finance";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { PRICING_PLANS } from "@/lib/types/pricing";
import { PricingCard } from "@/components/finance/PricingCard";
import {
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  Wallet,
  Zap,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Compass,
  Star,
  Users,
  Building2,
  ArrowUpRight,
  Layers,
  BarChart3,
  HelpCircle,
  Quote,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const currency: CurrencyCode = "KES";

  // Interactive Live Hero State
  const [queryInput, setQueryInput] = useState("Can I spend 30,000 KES on a phone?");
  const [activeAmount, setActiveAmount] = useState<number>(30000);
  const [activeTitle, setActiveTitle] = useState("Smartphone Purchase");
  const [isRecurring, setIsRecurring] = useState(false);

  // Active scenario for the 4 Scenario Cards grid
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);

  // Testimonials state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Grace W.",
      role: "Business Owner",
      quote: "UseAimly changed the way I make decisions. I no longer guess — I see the impact first.",
    },
    {
      name: "David M.",
      role: "Senior Software Engineer",
      quote: "Before buying a laptop or booking a trip, I type it into UseAimly. It saved me 6 months of goal delay.",
    },
    {
      name: "Amina K.",
      role: "Digital Nomad & Consultant",
      quote: "The 3-pillar breakdown and WhatsApp weekly dispatches give me absolute clarity on my financial future.",
    },
  ];

  // Baseline Financial Reality for Live Demonstration
  const baselineProfile: BaselineFinancialProfile = useMemo(
    () => ({
      liquidSavings: 180000,
      incomes: [
        { name: "Primary Income", amount: 180000, frequency: "MONTHLY", reliability: "STABLE", isActive: true },
      ],
      expenses: [
        { name: "Essential Living", amount: 112000, frequency: "MONTHLY", isFixed: true },
      ],
      debts: [],
      commitments: [],
      goals: [
        {
          id: "launch-business",
          title: "Grow My Business",
          targetAmount: 500000,
          currentAmount: 180000,
          targetDate: "2027-12-31",
          priority: "HIGH",
          status: "ACTIVE",
        },
      ],
    }),
    []
  );

  // Parse natural language input on typing
  const parsedIntent = useMemo(() => {
    if (!queryInput.trim()) return null;
    return parseDecisionQuery(queryInput, currency);
  }, [queryInput, currency]);

  // Derived params
  const evalAmount = parsedIntent?.isValid && parsedIntent.extractedAmount > 0
    ? parsedIntent.extractedAmount
    : activeAmount;

  const evalTitle = parsedIntent?.isValid && parsedIntent.extractedTitle
    ? parsedIntent.extractedTitle
    : activeTitle;

  const evalRecurring = parsedIntent?.isRecurring ?? isRecurring;

  // Run deterministic simulation
  const simulation = useMemo(() => {
    return simulateDecision(baselineProfile, {
      decisionTitle: evalTitle,
      amount: evalAmount,
      isRecurring: evalRecurring,
    });
  }, [baselineProfile, evalTitle, evalAmount, evalRecurring]);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/onboarding");
  };

  const handlePresetSelect = (text: string, amt: number, ttl: string) => {
    setQueryInput(text);
    setActiveAmount(amt);
    setActiveTitle(ttl);
    setIsRecurring(false);
  };

  return (
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-primary/15">
      {/* Main Landing Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-24 sm:space-y-32">
        
        {/* ========================================================================= */}
        {/* HERO SECTION (2-COLUMN MATCHING WIREFRAME 1) */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Value Prop & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-wide">
              <Zap className="w-3.5 h-3.5" />
              <span>Goal-Aware Decision Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-editorial text-foreground tracking-tight leading-[1.08]">
              See <span className="text-primary italic">tomorrow</span> before deciding today.
            </h1>

            <p className="text-base sm:text-xl text-muted-foreground font-medium max-w-xl">
              UseAimly shows you how your financial decisions today impact your future goals.
            </p>

            {/* Dual CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white font-bold text-sm px-8 py-4 shadow-lg shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] transition-all cursor-pointer"
              >
                <span>Try a Real Decision</span>
                <span className="text-xs font-normal opacity-90">(No account needed)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              {!user && (
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card hover:bg-secondary/70 text-foreground font-bold text-sm px-6 py-4 shadow-xs transition-all"
                >
                  <span>Create Free Account</span>
                  <span className="text-xs text-muted-foreground font-normal">(30 seconds)</span>
                </Link>
              )}
            </div>

            {/* Social Proof Badges */}
            <div className="pt-2 flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                {["/avatars/user1.jpg", "/avatars/user2.jpg", "/avatars/user3.jpg", "/avatars/user4.jpg"].map((src, i) => (
                  <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-secondary text-[10px] font-bold flex items-center justify-center text-primary">
                    {["GW", "DM", "AK", "JS"][i]}
                  </div>
                ))}
              </div>

              <div className="text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                  <span className="text-foreground ml-1 text-xs">5.0</span>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Trusted by 1,000+ smart decision makers
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Interactive Decision Simulator Widget */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border-2 border-border/90 bg-card p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-primary" />
                  <span>Try a real decision</span>
                </span>
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                  LIVE DEMO
                </span>
              </div>

              {/* Decision Query Card */}
              <div className="rounded-2xl border border-border/80 bg-secondary/40 p-4 space-y-1">
                <span className="text-[11px] text-muted-foreground font-semibold block">Decision Query</span>
                <p className="text-sm font-bold text-foreground">{queryInput}</p>
              </div>

              {/* Impact Breakdown */}
              <div className="space-y-3 pt-1 text-xs">
                {/* Immediate Impact */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                      IMMEDIATE IMPACT
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">
                      Your emergency cushion decreases by <strong className="text-sky-500 font-bold">8%</strong>
                    </p>
                  </div>
                </div>

                {/* Future Consequence */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/10 border border-primary/25">
                  <div className="p-1.5 rounded-lg bg-primary/20 text-primary shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-primary font-bold block">
                      FUTURE CONSEQUENCE
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">
                      Your Business Goal moves <strong className="text-primary font-bold text-sm">+{simulation.delta.delayInDays || 31} days later</strong>
                    </p>
                  </div>
                </div>

                {/* Stay on Track */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-500 font-bold block">
                      STAY ON TRACK
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">
                      Save an additional <strong className="text-emerald-500 font-bold">KES 1,875 / month</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href="/onboarding"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-bold text-sm py-3.5 shadow-md hover:opacity-95 transition-all cursor-pointer"
              >
                <span>See Full Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: WHY USEAIMLY? ("Because life moves forward. Your decisions should too.") */}
        {/* ========================================================================= */}
        <section className="space-y-12 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
              Why UseAimly?
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight leading-tight">
              Because life moves forward.<br />Your decisions should too.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              {
                step: "01",
                icon: <Compass className="w-5 h-5 text-primary" />,
                title: "Look Forward",
                description: "We show future impact, not just past transactions.",
              },
              {
                step: "02",
                icon: <Layers className="w-5 h-5 text-primary" />,
                title: "Understand Impact",
                description: "See what changes now and what changes later.",
              },
              {
                step: "03",
                icon: <Zap className="w-5 h-5 text-primary" />,
                title: "Make Better Choices",
                description: "Decide with clarity, not guesswork.",
              },
              {
                step: "04",
                icon: <TrendingUp className="w-5 h-5 text-primary" />,
                title: "Stay on Track",
                description: "Adjust your path and reach your goals faster.",
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="rounded-3xl border border-border/80 bg-card p-6 space-y-4 text-left shadow-xs hover:border-primary/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-muted-foreground/60">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: HOW USEAIMLY WORKS (4 SIMPLE STEPS TO FINANCIAL CLARITY) */}
        {/* ========================================================================= */}
        <section className="space-y-12 text-center rounded-3xl border border-border/80 bg-card/40 p-8 sm:p-14">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight">
              How UseAimly Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Four simple steps to financial clarity
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              {
                num: "01",
                title: "Add Your Picture",
                text: "Tell us about your income, expenses, goals and commitments.",
              },
              {
                num: "02",
                title: "Set Your Destinations",
                text: "Choose what you're working toward and when you want to achieve them.",
              },
              {
                num: "03",
                title: "Ask About a Decision",
                text: "Type any financial decision you're considering.",
              },
              {
                num: "04",
                title: "See the Impact",
                text: "Understand what changes now, what changes later, and what to do next.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-2xl border border-border/80 bg-card p-6 space-y-3 shadow-xs relative"
              >
                <div className="w-7 h-7 rounded-full bg-primary/15 text-primary font-mono font-bold text-xs flex items-center justify-center">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: TRUSTED BY PEOPLE WHO PLAN AHEAD (LOGOS + TESTIMONIAL) */}
        {/* ========================================================================= */}
        <section className="space-y-8 text-center">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
            Trusted by people who plan ahead
          </span>

          {/* Bank / Partner Logos Bar */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all py-4 border-y border-border/60">
            {["Safaricom", "M-PESA", "EQUITY", "KCB", "NCBA", "ABSA"].map((logo) => (
              <span key={logo} className="font-mono font-bold text-base sm:text-xl tracking-tighter text-foreground/80">
                {logo}
              </span>
            ))}
          </div>

          {/* Testimonial Quote Card */}
          <div className="max-w-2xl mx-auto rounded-3xl border border-border/80 bg-card p-8 space-y-6 shadow-md relative">
            <Quote className="w-8 h-8 text-primary/30 mx-auto" />
            <p className="text-base sm:text-lg font-editorial font-medium text-foreground italic">
              &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
            </p>

            <div className="flex items-center justify-between border-t border-border/60 pt-4 text-left">
              <div>
                <div className="font-bold text-sm text-foreground">{testimonials[activeTestimonial].name}</div>
                <div className="text-xs text-muted-foreground">{testimonials[activeTestimonial].role}</div>
              </div>

              {/* Slider controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTestimonial((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1))}
                  className="w-8 h-8 rounded-full border border-border bg-secondary/50 text-foreground flex items-center justify-center text-xs hover:border-primary transition-all cursor-pointer"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTestimonial((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0))}
                  className="w-8 h-8 rounded-full border border-border bg-secondary/50 text-foreground flex items-center justify-center text-xs hover:border-primary transition-all cursor-pointer"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: SEE WHAT YOUR DECISIONS DO TO YOUR FUTURE (4 SCENARIO CARDS GRID) */}
        {/* ========================================================================= */}
        <section className="space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight">
              See what your decisions do to your future
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Real decisions. Real impact. Real clarity.
            </p>
          </div>

          {/* 4 Interactive Scenario Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Buy a phone for 30,000 KES",
                popular: true,
                impactNow: "-8% Emergency Cushion",
                future: "Business goal delayed by 31 days",
                stayOnTrack: "Save KES 1,875 more per month",
              },
              {
                title: "Take a loan of 150,000 KES",
                popular: false,
                impactNow: "+22% Debt Pressure",
                future: "Goal delayed by 2.8 months",
                stayOnTrack: "Increase income or reduce fixed costs",
              },
              {
                title: "Move to a better apartment",
                popular: false,
                impactNow: "-18% Free Cash Flow",
                future: "Goal delayed by 45 days",
                stayOnTrack: "Review housing budget or increase income",
              },
              {
                title: "Take a vacation for 80,000 KES",
                popular: false,
                impactNow: "-12% Emergency Cushion",
                future: "Goal delayed by 22 days",
                stayOnTrack: "Delay or save more this month",
              },
            ].map((scenario, idx) => (
              <div
                key={scenario.title}
                className={`rounded-3xl border p-6 space-y-6 flex flex-col justify-between transition-all ${
                  scenario.popular
                    ? "border-primary bg-card ring-2 ring-primary/20 shadow-xl"
                    : "border-border/80 bg-card/80 hover:border-primary/40 shadow-xs"
                }`}
              >
                <div className="space-y-4">
                  {scenario.popular && (
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    {scenario.title}
                  </h3>

                  <div className="space-y-3 pt-2 text-xs border-t border-border/60">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                        Impact Now
                      </span>
                      <p className="font-semibold text-rose-500 mt-0.5">{scenario.impactNow}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-primary font-bold block">
                        Future Consequence
                      </span>
                      <p className="font-semibold text-foreground mt-0.5">{scenario.future}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-emerald-500 font-bold block">
                        Stay on Track
                      </span>
                      <p className="font-semibold text-foreground/80 mt-0.5">{scenario.stayOnTrack}</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/onboarding"
                  className="w-full inline-flex items-center justify-between text-xs font-bold text-primary hover:underline pt-4 border-t border-border/40"
                >
                  <span>Try this decision</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: PRICING (MATCHING WIREFRAME 2) */}
        {/* ========================================================================= */}
        <section id="pricing" className="space-y-10 py-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Start free. Upgrade when you&apos;re ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <PricingCard key={plan.id} plan={plan} isYearly={true} currency="USD" />
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: FINAL CONVERSION BANNER (MATCHING WIREFRAME 2 BOTTOM) */}
        {/* ========================================================================= */}
        <section className="rounded-3xl border border-primary/30 bg-primary/5 p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto shadow-xl shadow-primary/5">
          <div className="space-y-2 text-left">
            <h2 className="text-2xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight">
              Stop guessing.<br />See what your decisions really do.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Try a real decision now — no account needed.
            </p>
          </div>

          <div className="space-y-2 text-center md:text-right shrink-0">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white font-bold text-sm px-8 py-4 shadow-lg shadow-orange-500/25 hover:opacity-95 transition-all"
            >
              <span>See My Decision&apos;s Impact</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[11px] text-muted-foreground font-mono block">
              No credit card required
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
