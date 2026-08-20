"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import {
  ArrowRight,
  ShieldCheck,
  Target,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Layers,
  Compass,
  HelpCircle,
  Activity,
  Zap,
  RefreshCw,
  Sliders,
  ChevronRight,
  Layers3,
  Check,
} from "lucide-react";

export default function LandingPage() {
  const currency: CurrencyCode = "KES";

  // Interactive decision simulation state
  const [heroAmount, setHeroAmount] = useState<number>(30000);
  const [selectedStrategy, setSelectedStrategy] = useState<"cash" | "spread" | "postpone">("cash");
  const [activeTab, setActiveTab] = useState<"trajectory" | "matrix" | "telemetry">("trajectory");

  // Dynamic simulation computations
  const heroSimulation = useMemo(() => {
    const liquidReserves = 180000;
    const monthlyAllocation = 45000;
    
    // Calculated strategy variations
    if (selectedStrategy === "cash") {
      const remainingCash = Math.max(0, liquidReserves - heroAmount);
      const delayDays = Math.ceil(heroAmount / monthlyAllocation) * 30;
      const additionalMonthlySavings = Math.round(heroAmount / 16);
      const bufferMonths = Number((remainingCash / 75000).toFixed(1));
      return {
        remainingCash,
        delayDays,
        additionalMonthlySavings,
        bufferMonths,
        verdict: delayDays > 60 ? "HIGH_IMPACT" : delayDays > 20 ? "MANAGEABLE" : "SAFE",
        arrivalDate: delayDays > 0 ? `Jan 2028 (+${delayDays}d)` : "Nov 2027",
        monthlyImpact: `- ${formatCurrency(heroAmount, currency)} immediate`,
      };
    } else if (selectedStrategy === "spread") {
      const spreadMonthly = Math.round(heroAmount / 3);
      const remainingCash = liquidReserves;
      const delayDays = Math.ceil(spreadMonthly / monthlyAllocation) * 15;
      const bufferMonths = Number((remainingCash / 75000).toFixed(1));
      return {
        remainingCash,
        delayDays,
        additionalMonthlySavings: spreadMonthly,
        bufferMonths,
        verdict: "MANAGEABLE",
        arrivalDate: `Dec 2027 (+${delayDays}d)`,
        monthlyImpact: `- ${formatCurrency(spreadMonthly, currency)} / mo (3 mo)`,
      };
    } else {
      // Postpone strategy
      const remainingCash = liquidReserves;
      const delayDays = 0;
      const bufferMonths = Number((remainingCash / 75000).toFixed(1));
      return {
        remainingCash,
        delayDays: 0,
        additionalMonthlySavings: 0,
        bufferMonths,
        verdict: "SAFE",
        arrivalDate: "Nov 2027 (On Schedule)",
        monthlyImpact: "KES 0 immediate (Saved in advance)",
      };
    }
  }, [heroAmount, selectedStrategy, currency]);

  return (
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-primary/20 selection:text-foreground">
      {/* ========================================================================= */}
      {/* TELEMETRY TOP BAR */}
      {/* ========================================================================= */}
      <div className="border-b border-border/60 bg-secondary/40 py-2 px-4 sm:px-8 text-[11px] font-mono flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulseGlow" />
          <span className="font-bold text-foreground">SYSTEM OPERATIONAL</span>
          <span className="hidden sm:inline text-muted-foreground/60">•</span>
          <span className="hidden sm:inline">ENGINE V2.4 DETERMINISTIC</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline">ZERO BANK PASSWORDS REQUIRED</span>
          <span className="text-primary font-bold">KES / USD / EUR SUPPORTED</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-16 sm:space-y-24">
        {/* ========================================================================= */}
        {/* SECTION 1: HERO CANVAS & VISUALIZATION */}
        {/* ========================================================================= */}
        <section className="relative rounded-3xl border border-border/80 bg-card p-6 sm:p-12 lg:p-16 overflow-hidden bg-grid-pattern shadow-sm">
          {/* Engineered Top Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8 sm:mb-12 border-b border-border/60 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/60 text-xs font-mono font-medium text-foreground">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span>Goal-Aware Financial Intelligence</span>
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              MODEL STATUS: <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% DETERMINISTIC TS</span>
            </div>
          </div>

          {/* Hero Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Typographic Headline & Copy */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-foreground leading-[0.95]">
                  See tomorrow<br />
                  <span className="text-muted-foreground font-normal">before deciding</span><br />
                  today.
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl font-normal leading-relaxed">
                  Understand how today&apos;s financial decisions affect the destinations you&apos;re working toward. Because <span className="text-foreground font-semibold underline decoration-primary/50 underline-offset-4">cash affordability is not plan affordability</span>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm px-7 py-3.5 shadow-sm hover:opacity-95 transition-all"
                >
                  <span>Launch Intelligence Engine</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/app/decide"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 text-foreground font-medium text-sm px-6 py-3.5 hover:bg-secondary transition-colors"
                >
                  <Sliders className="w-4 h-4 text-muted-foreground" />
                  <span>Simulate a Purchase</span>
                </Link>
              </div>

              {/* Micro Metrics Line */}
              <div className="pt-4 border-t border-border/60 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Computation</div>
                  <div className="text-xs font-mono font-bold text-foreground">0ms Latency</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Privacy</div>
                  <div className="text-xs font-mono font-bold text-foreground">Client Isolation</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Accuracy</div>
                  <div className="text-xs font-mono font-bold text-primary">Exact Days</div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Precision Trajectory Visualization & System Outputs */}
            <div className="lg:col-span-6 space-y-4">
              {/* Product Trajectory Graph Box */}
              <div className="rounded-2xl border border-border bg-background p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between text-xs border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2 font-mono font-bold">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>FINANCIAL TRAJECTORY CANVAS</span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">GOAL: START MY BUSINESS (500K)</span>
                </div>

                {/* SVG Graph: Baseline vs Decision Delay */}
                <div className="relative h-44 w-full bg-secondary/30 rounded-xl border border-border/40 p-3 flex flex-col justify-between">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none opacity-20">
                    <div className="border-b border-dashed border-foreground/50 w-full" />
                    <div className="border-b border-dashed border-foreground/50 w-full" />
                    <div className="border-b border-dashed border-foreground/50 w-full" />
                  </div>

                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
                    {/* Target Horizon Line */}
                    <line x1="0" y1="20" x2="400" y2="20" stroke="currentColor" strokeDasharray="3 3" strokeOpacity="0.3" strokeWidth="1" />
                    <text x="390" y="15" textAnchor="end" fill="currentColor" opacity="0.5" className="text-[9px] font-mono">Target: 500k KES</text>

                    {/* Baseline Path (Solid Green Line) */}
                    <path
                      d="M 10 100 Q 150 80, 260 50 T 320 20"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                    />

                    {/* Decision Impact Path (Dashed Orange Line) */}
                    <path
                      d="M 10 100 Q 150 80, 260 75 T 380 20"
                      fill="none"
                      stroke="#FF5533"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />

                    {/* Nodes */}
                    <circle cx="10" cy="100" r="4" fill="currentColor" />
                    <text x="10" y="115" fill="currentColor" opacity="0.6" className="text-[9px] font-mono">Today</text>

                    {/* Decision Point */}
                    <circle cx="150" cy="80" r="4" fill="#FF5533" />
                    <text x="150" y="98" fill="#FF5533" className="text-[9px] font-mono font-bold" textAnchor="middle">-30k KES</text>

                    {/* Baseline Arrival Marker */}
                    <circle cx="320" cy="20" r="4" fill="#10B981" />
                    <text x="320" y="12" fill="#10B981" className="text-[9px] font-mono font-bold" textAnchor="middle">Nov 2027</text>

                    {/* Delayed Arrival Marker */}
                    <circle cx="380" cy="20" r="4" fill="#FF5533" />
                    <text x="380" y="12" fill="#FF5533" className="text-[9px] font-mono font-bold" textAnchor="end">Jan 2028 (+45d)</text>
                  </svg>
                </div>

                {/* Graph Legend */}
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
                    <span>Baseline Arrival (Nov 2027)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-primary border-t border-dashed border-primary inline-block" />
                    <span className="text-primary font-bold">Simulated Purchase (+45 days)</span>
                  </div>
                </div>
              </div>

              {/* Floating Engineered Telemetry Output Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* System Card 1: Primary Insight */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2 text-left">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-primary uppercase">
                    <span>Primary Trajectory Shift</span>
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">● IMPACT</span>
                  </div>
                  <div className="text-lg font-mono font-extrabold text-foreground">
                    +45 Days Delay
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    &ldquo;Start my business&rdquo; milestone shifts from Nov 2027 to Jan 2028.
                  </div>
                </div>

                {/* System Card 2: Secondary Insight */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-left">
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase">
                    <span>Resilience Cushion</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">2.4 Months</span>
                  </div>
                  <div className="text-lg font-mono font-extrabold text-foreground">
                    {formatCurrency(150000, currency)}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Liquid reserves remain above the minimum 2-month threshold.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: SYSTEM CALCULATION FLOW (PROBLEM -> SIMULATION -> RESULT) */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-left space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Pre-Commitment Decision Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Test every decision before committing your savings
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-normal">
              Most money tools catalog what already happened in the past. UseAimly is built to calculate the exact future consequences of today&apos;s choices before cash leaves your bank.
            </p>
          </div>

          {/* System Pipeline Graphic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: PROBLEM INPUT */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 text-left flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground uppercase">STEP 01</span>
                  <span className="text-xs font-mono text-muted-foreground">User Intent</span>
                </div>
                <h3 className="text-lg font-bold text-foreground leading-snug">
                  &ldquo;Before I commit 30,000 KES to a tech upgrade...&rdquo;
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The user inputs a proposed expense or commitment in natural language or numeric value.
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                <span>QUERY PARSER</span>
                <span className="text-primary font-bold">ONE-OFF EXPENSE</span>
              </div>
            </div>

            {/* Step 2: DETERMINISTIC SIMULATION */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 text-left flex flex-col justify-between shadow-xs relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase">STEP 02</span>
                  <span className="text-xs font-mono text-primary font-bold">3-Pillar Engine</span>
                </div>
                <h3 className="text-lg font-bold text-foreground leading-snug">
                  Engine computes 3 pillars simultaneously
                </h3>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded bg-secondary/40">
                    <span className="text-muted-foreground">Cash Buffer:</span>
                    <span className="font-bold text-foreground">180k → 150k KES</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-secondary/40">
                    <span className="text-muted-foreground">Recovery Time:</span>
                    <span className="font-bold text-foreground">16 mo @ +1.8k/mo</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-secondary/40">
                    <span className="text-muted-foreground">Target Delay:</span>
                    <span className="font-bold text-primary">+45 Days</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-border/60 text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                <span>TS FORMULA</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">VERIFIED MATH</span>
              </div>
            </div>

            {/* Step 3: RESULT VERDICT */}
            <div className="rounded-2xl border border-primary/40 bg-card p-6 space-y-4 text-left flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">STEP 03</span>
                  <span className="text-xs font-mono text-muted-foreground">Actionable Verdict</span>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-muted-foreground uppercase">Affordability Status</div>
                  <div className="text-xl font-mono font-extrabold text-primary">MANAGEABLE</div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Liquid funds are available, but to prevent the 45-day delay on your business goal, save an extra KES 1,875/month for 16 months.
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                <span>DECISION ADVICE</span>
                <span className="text-foreground font-bold">RECOVERY PLAN READY</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: PRODUCT UI MODULE SHOWCASE (ACTUAL PRODUCT INTERFACE) */}
        {/* ========================================================================= */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 space-y-8 text-left shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-primary uppercase">PRODUCT ARCHITECTURE</div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Real financial intelligence. Not fake dashboards.
              </h2>
            </div>

            {/* Tab Controls */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/70 border border-border/80 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("trajectory")}
                className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all ${
                  activeTab === "trajectory"
                    ? "bg-background text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Destination Radar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("matrix")}
                className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all ${
                  activeTab === "matrix"
                    ? "bg-background text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Affordability Matrix
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("telemetry")}
                className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all ${
                  activeTab === "telemetry"
                    ? "bg-background text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Insights Stream
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          {activeTab === "trajectory" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-2xl border border-border bg-background p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-border/60 pb-4">
                    <div>
                      <div className="text-[11px] font-mono text-muted-foreground">PRIMARY DESTINATION</div>
                      <div className="text-xl font-bold text-foreground">Lancer mon entreprise</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-mono text-muted-foreground">TARGET DATE</div>
                      <div className="text-sm font-mono font-bold text-primary">Nov 2027</div>
                    </div>
                  </div>

                  {/* Progress Bar & Pace */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span>Saved: KES 180,000 / KES 500,000</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">36% Complete</span>
                    </div>
                    <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "36%" }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono pt-2">
                    <div className="p-3 rounded-xl bg-secondary/40 border border-border/40">
                      <div className="text-[10px] text-muted-foreground">CURRENT PACE</div>
                      <div className="font-bold text-foreground">45 000 KES/mo</div>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/40 border border-border/40">
                      <div className="text-[10px] text-muted-foreground">REQUIRED PACE</div>
                      <div className="font-bold text-primary">48 200 KES/mo</div>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-muted-foreground">VELOCITY GAP</div>
                      <div className="font-bold text-amber-600 dark:text-amber-400">-3 200 KES/mo</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4 text-xs">
                <div className="rounded-2xl border border-border bg-background p-6 space-y-4">
                  <div className="font-mono font-bold uppercase text-muted-foreground text-[11px]">DESTINATION HEALTH METRICS</div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-border/60">
                      <span className="text-muted-foreground">Runway Security:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">2.4 Months Charges</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/60">
                      <span className="text-muted-foreground">Monthly Free Cash Flow:</span>
                      <span className="font-mono font-bold text-foreground">68 000 KES / mo</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/60">
                      <span className="text-muted-foreground">Pace Warning:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">Mild Shortfall</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    UseAimly continuously calculates whether your savings velocity matches your target arrival date. If your pace drops, it triggers recovery actions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "matrix" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn text-xs">
              <div className="rounded-2xl border border-border bg-background p-6 space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-zinc-400" />
                  <span>TRADITIONAL BANK / BUDGET VIEW</span>
                </div>
                <h3 className="text-base font-bold text-foreground">Cash Affordability (&ldquo;Can I pay today?&rdquo;)</h3>
                <div className="p-4 rounded-xl bg-secondary/40 font-mono space-y-2">
                  <div>Liquid Cash: KES 180,000</div>
                  <div>Expense: KES 30,000</div>
                  <div className="text-emerald-600 font-bold">Status: APPROVED (Balance &gt; Expense)</div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Traditional tools look only at cash on hand. They tell you that you can afford the purchase simply because you won&apos;t go into overdraft today.
                </p>
              </div>

              <div className="rounded-2xl border border-primary/40 bg-background p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>USEAIMLY PLAN AFFORDABILITY VIEW</span>
                </div>
                <h3 className="text-base font-bold text-foreground">Plan Affordability (&ldquo;What does this shift?&rdquo;)</h3>
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 font-mono space-y-2">
                  <div>Destination: Start my business</div>
                  <div>Target Date Shift: +45 Days (Nov 2027 → Jan 2028)</div>
                  <div className="text-primary font-bold">Status: DELAY DETECTED</div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  UseAimly connects today&apos;s dollar to tomorrow&apos;s goal. Even if you have the cash, it calculates the opportunity cost in time.
                </p>
              </div>
            </div>
          )}

          {activeTab === "telemetry" && (
            <div className="space-y-3 animate-fadeIn text-xs font-mono">
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="font-bold text-foreground">RULE #1: PACE SHORTFALL DETECTED</span>
                    <div className="text-muted-foreground text-[11px]">Target: &ldquo;Start my business&rdquo; requires +3,200 KES/mo allocation to hit Nov 2027.</div>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">WARNING</span>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <div>
                    <span className="font-bold text-foreground">RULE #2: COMMITMENT SPIKE IN 58 DAYS</span>
                    <div className="text-muted-foreground text-[11px]">Annual Car Insurance premium (KES 42,000) due on Oct 17. Safe buffer allocated.</div>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-secondary text-muted-foreground text-[10px] font-bold">UPCOMING</span>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="font-bold text-foreground">RULE #3: CASH CUSHION SECURE</span>
                    <div className="text-muted-foreground text-[11px]">Liquid reserve (180,000 KES) covers 2.4 months of essential charges.</div>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">HEALTHY</span>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: INTERACTIVE DECISION SIMULATOR STUDIO */}
        {/* ========================================================================= */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-12 space-y-8 text-left shadow-sm">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase">
              <Sliders className="w-3.5 h-3.5" />
              <span>Interactive Decision Studio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Simulate a decision right now
            </h2>
            <p className="text-sm text-muted-foreground">
              Adjust the proposed purchase amount and compare 3 concrete strategies to preserve your destination timelines.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls Column */}
            <div className="lg:col-span-6 rounded-2xl border border-border bg-background p-6 space-y-6">
              {/* Amount Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground uppercase font-bold">Purchase Amount</span>
                  <span className="text-2xl font-black font-mono text-primary">
                    {formatCurrency(heroAmount, currency)}
                  </span>
                </div>

                <input
                  type="range"
                  min="5000"
                  max="150000"
                  step="5000"
                  value={heroAmount}
                  onChange={(e) => setHeroAmount(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
                />

                {/* Preset Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[15000, 30000, 60000, 100000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setHeroAmount(val)}
                      className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                        heroAmount === val
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-secondary/40 border-border/70 text-foreground hover:border-primary/40"
                      }`}
                    >
                      {val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategy Selector */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <div className="text-xs font-mono uppercase font-bold text-muted-foreground">
                  Select Decision Strategy
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStrategy("cash")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedStrategy === "cash"
                        ? "border-primary bg-primary/5 text-foreground font-bold shadow-xs"
                        : "border-border/70 bg-secondary/20 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground">Strategy A: Pay Cash Buffer</div>
                      <div className="text-[11px] font-normal text-muted-foreground">Pay full amount today from liquid reserves.</div>
                    </div>
                    {selectedStrategy === "cash" && <Check className="w-4 h-4 text-primary" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStrategy("spread")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedStrategy === "spread"
                        ? "border-primary bg-primary/5 text-foreground font-bold shadow-xs"
                        : "border-border/70 bg-secondary/20 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground">Strategy B: Spread Over 3 Months</div>
                      <div className="text-[11px] font-normal text-muted-foreground">Distribute monthly impact across 90 days.</div>
                    </div>
                    {selectedStrategy === "spread" && <Check className="w-4 h-4 text-primary" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStrategy("postpone")}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedStrategy === "postpone"
                        ? "border-primary bg-primary/5 text-foreground font-bold shadow-xs"
                        : "border-border/70 bg-secondary/20 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground">Strategy C: Postpone & Save First</div>
                      <div className="text-[11px] font-normal text-muted-foreground">Save dedicated cash prior to purchase. Zero destination delay.</div>
                    </div>
                    {selectedStrategy === "postpone" && <Check className="w-4 h-4 text-primary" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Output Verdict Box */}
            <div className="lg:col-span-6 rounded-2xl border border-border bg-background p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-3 text-xs font-mono">
                <span className="text-muted-foreground uppercase font-bold">SIMULATION VERDICT</span>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  heroSimulation.verdict === "SAFE"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : heroSimulation.verdict === "MANAGEABLE"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}>
                  ● {heroSimulation.verdict}
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/40">
                  <span className="text-muted-foreground">Remaining Liquid Cash:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(heroSimulation.remainingCash, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/40">
                  <span className="text-muted-foreground">Destination Arrival Date:</span>
                  <span className="font-bold text-primary">
                    {heroSimulation.arrivalDate}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/40">
                  <span className="text-muted-foreground">Resilience Cushion:</span>
                  <span className="font-bold text-foreground">
                    {heroSimulation.bufferMonths} Months Buffer
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/app/decide"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-xs font-mono font-bold shadow-xs hover:opacity-95 transition-all"
                >
                  <span>Open Full Decision Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FOOTER CALL TO ACTION & SYSTEM BANNER */}
        {/* ========================================================================= */}
        <section className="rounded-3xl border border-border bg-card p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Start making goal-aware decisions today.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-normal">
              No bank credentials required. Setup your destinations and test your first financial decision in under 3 minutes.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm px-8 py-4 shadow-sm hover:opacity-95 transition-all"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 text-foreground font-semibold text-sm px-6 py-4 hover:bg-secondary transition-colors"
            >
              <span>Start Onboarding</span>
            </Link>
          </div>

          <div className="pt-6 border-t border-border/60 text-[11px] font-mono text-muted-foreground flex flex-wrap items-center justify-center gap-4">
            <span>✓ 100% DETERMINISTIC COMPUTATION</span>
            <span>•</span>
            <span>✓ ZERO DATA SELLING</span>
            <span>•</span>
            <span>✓ REAL-TIME TRAJECTORY MAP</span>
          </div>
        </section>
      </div>
    </div>
  );
}
