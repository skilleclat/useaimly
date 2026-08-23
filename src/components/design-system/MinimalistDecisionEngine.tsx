"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Car,
  Home,
  CreditCard,
  ShoppingBag,
  Briefcase,
  Plane,
  ArrowRight,
  Pencil,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Lock,
  Building2,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { parseDecisionQuery } from "@/lib/nlp/decision-query-parser";
import { simulateDecision, BaselineFinancialProfile } from "@/lib/finance";

export interface DecisionCardOption {
  id: string;
  title: string;
  subtitle: string;
  defaultQuery: string;
  bgColor: string;
  iconBg: string;
  icon: React.ReactNode;
}

export function Hero3DGraphic() {
  return (
    <div className="relative w-full max-w-sm mx-auto flex items-center justify-center p-4">
      {/* 3D Soft Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 rounded-full blur-3xl transform scale-90 -z-10" />

      {/* Main Elevated 3D Card */}
      <div className="w-full bg-white dark:bg-card rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-border space-y-5 relative">
        {/* Skeleton Document Lines */}
        <div className="space-y-2">
          <div className="h-2.5 w-24 bg-gray-200 dark:bg-muted rounded-full" />
          <div className="h-2 w-36 bg-gray-100 dark:bg-muted/60 rounded-full" />
        </div>

        {/* Dynamic 3D Emerald Trendline SVG */}
        <div className="relative h-28 w-full flex items-center justify-center">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 80">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00A859" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00A859" stopOpacity="1" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#00A859" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Smooth trend curve */}
            <path
              d="M 10 60 Q 40 40, 70 50 T 130 20 T 190 10"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            {/* Endpoint target dot */}
            <circle cx="190" cy="10" r="6" fill="#00A859" />
            <circle cx="190" cy="10" r="11" fill="#00A859" fillOpacity="0.25" />
          </svg>
        </div>

        {/* Lower Row: Donut Chart Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-border">
          <div className="h-2.5 w-20 bg-gray-100 dark:bg-muted/80 rounded-full" />
          <div className="w-10 h-10 rounded-full border-4 border-[#00A859] border-t-transparent transform -rotate-45" />
        </div>

        {/* 3D Floating Emerald Shield Badge (Absolute Left) */}
        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-[#00A859] text-white p-3.5 rounded-2xl shadow-[0_12px_30px_rgba(0,168,89,0.4)] flex items-center justify-center border-2 border-white dark:border-card">
          <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
}

export function MinimalistDecisionEngine({
  baselineProfile,
  initialQuery = "",
  showQuickActions = true,
}: {
  baselineProfile?: BaselineFinancialProfile;
  initialQuery?: string;
  showQuickActions?: boolean;
}) {
  const { currency, format } = useCurrency();
  const [queryInput, setQueryInput] = useState(
    initialQuery || "I'm thinking of buying a KES 500,000 car."
  );
  const [activeCardId, setActiveCardId] = useState<string | null>("car");
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  // Default baseline profile
  const activeBaseline: BaselineFinancialProfile = useMemo(
    () =>
      baselineProfile || {
        liquidSavings: 180000,
        incomes: [
          { name: "Primary Income", amount: 180000, frequency: "MONTHLY", reliability: "STABLE", isActive: true },
        ],
        expenses: [
          { name: "Rent & Living", amount: 45000, frequency: "MONTHLY", isFixed: true },
          { name: "Food & Transport", amount: 35000, frequency: "MONTHLY", isFixed: true },
          { name: "Utilities", amount: 12000, frequency: "MONTHLY", isFixed: true },
        ],
        debts: [],
        commitments: [],
        goals: [
          {
            id: "main-goal",
            title: "Financial Goal",
            targetAmount: 500000,
            currentAmount: 180000,
            targetDate: "2027-03-31",
            priority: "HIGH",
            status: "ACTIVE",
          },
        ],
      },
    [baselineProfile]
  );

  // 6 DECISION CARDS MATCHING REFERENCE UI
  const DECISION_CARDS: DecisionCardOption[] = [
    {
      id: "car",
      title: "Buy a car",
      subtitle: "Can I afford it?",
      defaultQuery: "Can I afford a KES 500,000 car?",
      bgColor: "bg-emerald-500/10",
      iconBg: "bg-emerald-500 text-white",
      icon: <Car className="w-5 h-5" />,
    },
    {
      id: "home",
      title: "Buy a home",
      subtitle: "See the financial impact",
      defaultQuery: "Can I afford a KES 2,500,000 home deposit?",
      bgColor: "bg-emerald-500/10",
      iconBg: "bg-[#00A859] text-white",
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: "loan",
      title: "Take a loan",
      subtitle: "Can I handle the payments?",
      defaultQuery: "What happens if I take a KES 200,000 loan?",
      bgColor: "bg-purple-500/10",
      iconBg: "bg-purple-600 text-white",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: "purchase",
      title: "Make a big purchase",
      subtitle: "Know before you spend",
      defaultQuery: "Can I buy a KES 120,000 laptop?",
      bgColor: "bg-amber-500/10",
      iconBg: "bg-amber-500 text-white",
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      id: "business",
      title: "Start a business",
      subtitle: "Can my finances support it?",
      defaultQuery: "Can I invest KES 300,000 into a new business?",
      bgColor: "bg-blue-500/10",
      iconBg: "bg-blue-600 text-white",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      id: "trip",
      title: "Take a trip",
      subtitle: "Will it affect my goals?",
      defaultQuery: "Can I afford a KES 150,000 vacation?",
      bgColor: "bg-sky-500/10",
      iconBg: "bg-sky-500 text-white",
      icon: <Plane className="w-5 h-5" />,
    },
  ];

  // Parse natural language intent
  const parsedIntent = useMemo(() => {
    return parseDecisionQuery(queryInput, currency);
  }, [queryInput, currency]);

  const extractedAmount = parsedIntent?.isValid && parsedIntent.extractedAmount > 0
    ? parsedIntent.extractedAmount
    : 500000;

  const extractedTitle = parsedIntent?.isValid && parsedIntent.extractedTitle
    ? parsedIntent.extractedTitle
    : "Vehicle Purchase";

  const isRecurring = parsedIntent?.isRecurring ?? false;

  // Run deterministic simulation
  const simulation = useMemo(() => {
    return simulateDecision(activeBaseline, {
      decisionTitle: extractedTitle,
      amount: extractedAmount,
      isRecurring: isRecurring,
    });
  }, [activeBaseline, extractedTitle, extractedAmount, isRecurring]);

  // Verdict Badge
  const verdict = useMemo(() => {
    const status = simulation?.status || simulation?.executiveDecision;
    if (status === "SAFE" || status === "GO") {
      return {
        type: "AFFORDABLE",
        label: "YOU CAN AFFORD IT",
        badgeBg: "bg-emerald-500/10 text-[#00A859] border-emerald-500/30",
        cardBorder: "border-emerald-500/40",
        icon: <CheckCircle2 className="w-5 h-5 text-[#00A859]" />,
      };
    } else if (status === "MANAGEABLE" || status === "ADJUST") {
      return {
        type: "ADJUST",
        label: "ADJUST",
        badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
        cardBorder: "border-amber-500/40",
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      };
    } else {
      return {
        type: "NOT_YET",
        label: "NOT YET",
        badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
        cardBorder: "border-rose-500/40",
        icon: <XCircle className="w-5 h-5 text-rose-500" />,
      };
    }
  }, [simulation]);

  const plainReasons = useMemo(() => {
    const reasons: string[] = [];
    const formattedAmt = format(extractedAmount, { fromCurrency: "KES" });
    const formattedSavings = format(activeBaseline.liquidSavings, { fromCurrency: "KES" });

    if (verdict.type === "AFFORDABLE") {
      reasons.push(`Your liquid savings (${formattedSavings}) comfortably cover this ${formattedAmt} decision.`);
      reasons.push(`Your monthly cash flow remains positive after this purchase.`);
      reasons.push(`Your emergency reserve stays protected above your 3-month safety target.`);
    } else if (verdict.type === "ADJUST") {
      const shortage = Math.max(0, extractedAmount - activeBaseline.liquidSavings);
      if (shortage > 0) {
        reasons.push(`You need approximately ${format(shortage, { fromCurrency: "KES" })} more to reach your budget target.`);
      } else {
        reasons.push(`Paying comptant will temporarily lower your liquid emergency reserve.`);
      }
      reasons.push(`At your current saving rate, you could reach this target around March 2027.`);
      reasons.push(`Consider spreading payments across 3 months or increasing your monthly savings rate.`);
    } else {
      reasons.push(`This purchase requires more liquid reserves than your current available savings (${formattedSavings}).`);
      reasons.push(`Taking this on now would push your primary savings goal back by +${simulation.delta.delayInDays || 45} days.`);
      reasons.push(`We recommend saving for another 4 to 6 months before completing this decision.`);
    }
    return reasons.slice(0, 3);
  }, [extractedAmount, activeBaseline, verdict, simulation, format]);

  const handleCardClick = (card: DecisionCardOption) => {
    setActiveCardId(card.id);
    setQueryInput(card.defaultQuery);
  };

  const handleQuickAction = (text: string) => {
    setQueryInput(text);
  };

  return (
    <div className="space-y-10 w-full max-w-4xl mx-auto font-sans">
      {/* 1. DECISION CARDS ("What are you planning?") */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-foreground">
          What are you planning?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DECISION_CARDS.map((card) => {
            const isSelected = activeCardId === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card)}
                className={`group text-left p-5 rounded-3xl bg-white dark:bg-card border transition-all duration-200 cursor-pointer flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md ${
                  isSelected
                    ? "border-[#00A859] ring-2 ring-[#00A859]/20"
                    : "border-gray-100 dark:border-border hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon Square Badge */}
                  <div className={`p-3 rounded-2xl ${card.bgColor} shrink-0`}>
                    <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center shadow-sm`}>
                      {card.icon}
                    </div>
                  </div>

                  {/* Titles */}
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-foreground group-hover:text-[#00A859] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#00A859] shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. PRIMARY ACTION INPUT BOX ("What money decision are you considering?") */}
      <div className="space-y-5 rounded-3xl bg-[#062317] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          What money decision are you considering?
        </h2>

        <div className="space-y-4">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-gray-400">
              <Pencil className="w-4 h-4" />
            </div>

            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="For example: &quot;I'm thinking of buying a KES 500,000 car.&quot;"
              className="w-full rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 pl-11 pr-4 py-4 text-sm sm:text-base font-medium focus:outline-none focus:ring-4 focus:ring-[#00A859]/30 transition-all shadow-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("verdict-result-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-[#00A859] hover:bg-[#00964F] text-white font-bold text-base py-4 px-6 shadow-lg shadow-[#00A859]/30 transition-all cursor-pointer"
          >
            <span>Analyze my decision</span>
            <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* 3. PERSONALIZED QUICK ACTIONS ("Based on your finances") */}
      {showQuickActions && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-foreground">
              Based on your finances
            </h2>
            <span className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-foreground flex items-center gap-1 cursor-pointer">
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-3">
            {/* Prompt 1 */}
            <button
              type="button"
              onClick={() => handleQuickAction("Can I afford a KES 500,000 car?")}
              className="w-full text-left p-4 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border hover:border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-[#00A859] shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-foreground group-hover:text-[#00A859] transition-colors">
                    Can I afford a KES 500,000 car?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">
                    See affordability and monthly impact
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block text-[11px] font-bold text-[#00A859] bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  Popular
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#00A859] transition-colors" />
              </div>
            </button>

            {/* Prompt 2 */}
            <button
              type="button"
              onClick={() => handleQuickAction("What happens if I take a KES 200,000 loan?")}
              className="w-full text-left p-4 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border hover:border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-foreground group-hover:text-purple-600 transition-colors">
                    What happens if I take a KES 200,000 loan?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">
                    See repayment ability and total cost
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </button>

            {/* Prompt 3 */}
            <button
              type="button"
              onClick={() => handleQuickAction("Can I reach my savings goal by March 2027?")}
              className="w-full text-left p-4 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border hover:border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-foreground group-hover:text-amber-600 transition-colors">
                    Can I reach my savings goal by March 2027?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">
                    Check your progress and what to adjust
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
            </button>
          </div>
        </div>
      )}

      {/* 4. SECURITY & ENCRYPTION BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F0FDF4] dark:bg-emerald-950/20 border border-[#DCFCE7] dark:border-emerald-900/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#00A859] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-foreground">
              Your data is private and secure
            </h4>
            <p className="text-gray-500 dark:text-muted-foreground font-medium">
              Bank-level encryption. You&apos;re in control.
            </p>
          </div>
        </div>

        <Lock className="w-4 h-4 text-gray-400 shrink-0" />
      </div>

      {/* 5. VERDICT RESULT CARD (4 PROGRESSIVE LAYERS) */}
      <div
        id="verdict-result-section"
        className={`rounded-3xl border-2 ${verdict.cardBorder} bg-white dark:bg-card p-6 sm:p-8 space-y-6 shadow-xl transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-border pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500 font-bold">
              Your Decision
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-foreground">
              {extractedTitle} — {format(extractedAmount, { fromCurrency: "KES" })}
            </h3>
          </div>

          <div className={`px-4 py-2 rounded-full border ${verdict.badgeBg} font-extrabold text-xs tracking-wide flex items-center gap-2 shadow-xs`}>
            {verdict.icon}
            <span>{verdict.label}</span>
          </div>
        </div>

        {/* LAYER 1 & 2: WHY? (Max 3 simple reasons) */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            <span>Why?</span>
          </h4>
          <ul className="space-y-2.5">
            {plainReasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-800 dark:text-foreground font-medium leading-relaxed bg-gray-50 dark:bg-secondary/40 p-3.5 rounded-2xl border border-gray-100 dark:border-border/60">
                <span className="text-[#00A859] font-bold mt-0.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* LAYER 3: WHAT HAPPENS NEXT? (Visual Timeline) */}
        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-bold text-gray-900 dark:text-foreground">
            What happens next?
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-secondary/50 border border-gray-100 dark:border-border">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                Stage 1
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-foreground mt-1 block">NOW</span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">Analyze decision</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-secondary/50 border border-gray-100 dark:border-border">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                Stage 2
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-foreground mt-1 block">MONTH 3</span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">Buffer recovery</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-secondary/50 border border-gray-100 dark:border-border">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                Stage 3
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-foreground mt-1 block">MONTH 6</span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">Target reached</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-[#00A859]/30 text-[#00A859]">
              <span className="text-[10px] font-mono uppercase font-bold block">
                Stage 4
              </span>
              <span className="text-xs font-bold mt-1 block">PURCHASE READY</span>
              <span className="text-[11px] opacity-90 mt-0.5 block">Safe execution</span>
            </div>
          </div>
        </div>

        {/* LAYER 4: PROGRESSIVE DISCLOSURE ("View full analysis →") */}
        <div className="pt-2 border-t border-gray-100 dark:border-border flex flex-col items-center">
          <button
            type="button"
            onClick={() => setShowFullAnalysis(!showFullAnalysis)}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#00A859] hover:underline cursor-pointer py-2"
          >
            <span>{showFullAnalysis ? "Hide detailed analysis" : "View full analysis →"}</span>
            {showFullAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFullAnalysis && (
            <div className="w-full pt-4 space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-background space-y-1">
                  <span className="text-[11px] text-gray-500 font-semibold block">Liquid Reserves After</span>
                  <span className="text-base font-bold text-gray-900 dark:text-foreground">
                    {format(Math.max(0, activeBaseline.liquidSavings - (isRecurring ? 0 : extractedAmount)), { fromCurrency: "KES" })}
                  </span>
                </div>

                <div className="p-4 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-background space-y-1">
                  <span className="text-[11px] text-gray-500 font-semibold block">Primary Goal Impact</span>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                    +{simulation.delta.delayInDays || 45} days delay
                  </span>
                </div>

                <div className="p-4 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-background space-y-1">
                  <span className="text-[11px] text-gray-500 font-semibold block">Monthly Recovery Needed</span>
                  <span className="text-base font-bold text-[#00A859]">
                    {format(1875, { fromCurrency: "KES" })} / month
                  </span>
                </div>
              </div>

              <div className="text-center pt-2">
                <Link
                  href={`/app/decide?q=${encodeURIComponent(queryInput)}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-foreground hover:text-[#00A859] transition-colors border border-gray-200 dark:border-border rounded-xl px-5 py-2.5 bg-gray-50 dark:bg-secondary/40"
                >
                  <span>Open Interactive Decision Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
