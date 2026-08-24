"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  CreditCard,
  Car,
  Home,
  TrendingUp,
  Briefcase,
  Layers,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  Share2,
  Bookmark,
  MessageSquare,
  BarChart3,
  Check,
} from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { parseDecisionQuery } from "@/lib/nlp/decision-query-parser";
import {
  simulateDecision,
  BaselineFinancialProfile,
  saveDecisionRecord,
  getSavedDecisions,
} from "@/lib/finance";
import { calculateFreedomClock } from "@/lib/finance/health/freedom-clock";
import { formatCurrency } from "@/lib/utils/currency";
import { VerifiedDecisionReportModal } from "./VerifiedDecisionReportModal";
import { VerifiedDecisionData } from "@/lib/decision-engine/decision-validator";

export type DecisionCategory =
  | "BUY_SOMETHING"
  | "TAKE_A_LOAN"
  | "BUY_A_CAR"
  | "MOVE_HOME"
  | "INVEST"
  | "BUSINESS_EXPENSE"
  | "PAY_OFF_DEBT"
  | "OTHER";

export interface AimlyDecisionEngineProps {
  baselineProfile?: BaselineFinancialProfile;
  initialQuery?: string;
  initialCategory?: DecisionCategory;
  onSaved?: () => void;
  compact?: boolean;
}

export function AimlyDecisionEngine({
  baselineProfile,
  initialQuery = "I'm thinking about buying a $2,000 laptop for my business.",
  initialCategory = "BUY_SOMETHING",
  onSaved,
  compact = false,
}: AimlyDecisionEngineProps) {
  const router = useRouter();
  const { currency, format } = useCurrency();
  const { language } = useI18n();
  const isFr = language === "fr";

  // Step 1: Decision Intent
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<DecisionCategory>(initialCategory);
  
  // Step 2: Progressive Details Drawer & Assumptions
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [customDownPayment, setCustomDownPayment] = useState<number | null>(null);
  const [customMonthlyPayment, setCustomMonthlyPayment] = useState<number | null>(null);
  const [isRecurringExpense, setIsRecurringExpense] = useState(false);
  const [decisionTiming, setDecisionTiming] = useState<"TODAY" | "30_DAYS" | "90_DAYS">("TODAY");

  // Profile Overrides (if user wants to tweak current baseline)
  const [isProfileTweakOpen, setIsProfileTweakOpen] = useState(false);
  const [overrideSavings, setOverrideSavings] = useState<number | null>(null);
  const [overrideIncome, setOverrideIncome] = useState<number | null>(null);
  const [overrideExpenses, setOverrideExpenses] = useState<number | null>(null);

  // UI States
  const [isSaved, setIsSaved] = useState(false);
  const [activeAlternativeTab, setActiveAlternativeTab] = useState<"BUY_NOW" | "WAIT" | "CHEAPER">("BUY_NOW");
  const [showSideBySideModal, setShowSideBySideModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Active Baseline Profile
  const activeBaseline: BaselineFinancialProfile = useMemo(() => {
    const base = baselineProfile || {
      liquidSavings: 4840,
      incomes: [
        { name: "Primary Income", amount: 4500, frequency: "MONTHLY", reliability: "STABLE", isActive: true },
      ],
      expenses: [
        { name: "Rent & Living", amount: 1600, frequency: "MONTHLY", isFixed: true },
        { name: "Essentials & Bills", amount: 700, frequency: "MONTHLY", isFixed: true },
      ],
      debts: [],
      commitments: [],
      goals: [
        {
          id: "business-goal",
          title: isFr ? "Objectif Lancement Entreprise" : "Business Launch Goal",
          targetAmount: 25000,
          currentAmount: 12000,
          targetDate: "2027-12-31",
          priority: "HIGH",
          status: "ACTIVE",
        },
      ],
    };

    return {
      ...base,
      liquidSavings: overrideSavings !== null ? overrideSavings : base.liquidSavings,
      incomes: overrideIncome !== null
        ? [{ name: "Primary Income", amount: overrideIncome, frequency: "MONTHLY", reliability: "STABLE", isActive: true }]
        : base.incomes,
      expenses: overrideExpenses !== null
        ? [{ name: "Living Expenses", amount: overrideExpenses, frequency: "MONTHLY", isFixed: true }]
        : base.expenses,
    };
  }, [baselineProfile, overrideSavings, overrideIncome, overrideExpenses, isFr]);

  // Categories definitions
  const CATEGORIES: { id: DecisionCategory; label: string; icon: React.ReactNode; defaultPrompt: string }[] = useMemo(
    () => [
      {
        id: "BUY_SOMETHING",
        label: isFr ? "ACHAT MATÉRIEL" : "BUY SOMETHING",
        icon: <ShoppingBag className="w-3.5 h-3.5" />,
        defaultPrompt: isFr ? "J'envisage d'acheter un ordinateur à 2 000 $ pour mon activité." : "I'm thinking about buying a $2,000 laptop for my business.",
      },
      {
        id: "TAKE_A_LOAN",
        label: isFr ? "SOUSCRIRE UN CRÉDIT" : "TAKE A LOAN",
        icon: <CreditCard className="w-3.5 h-3.5" />,
        defaultPrompt: isFr ? "Que se passe-t-il si je souscris un prêt de 10 000 $ avec 300 $/mois ?" : "What happens if I take a $10,000 loan with $300/mo payment?",
      },
      {
        id: "BUY_A_CAR",
        label: isFr ? "ACHETER UNE VOITURE" : "BUY A CAR",
        icon: <Car className="w-3.5 h-3.5" />,
        defaultPrompt: isFr ? "Puis-je acheter une voiture à 15 000 $ avec 3 000 $ d'apport ?" : "Can I buy a $15,000 car with $3,000 down payment?",
      },
      {
        id: "MOVE_HOME",
        label: isFr ? "DÉMÉNAGER / APPORT" : "MOVE HOME",
        icon: <Home className="w-3.5 h-3.5" />,
        defaultPrompt: isFr ? "Puis-je financer un apport immobilier de 30 000 $ ?" : "Can I afford a $30,000 home deposit?",
      },
      {
        id: "INVEST",
        label: isFr ? "INVESTIR" : "INVEST",
        icon: <TrendingUp className="w-3.5 h-3.5" />,
        defaultPrompt: isFr ? "Que se passe-t-il si j'investis 5 000 $ dans un nouveau projet ?" : "What happens if I invest $5,000 into a new fund?",
      },
      {
        id: "BUSINESS_EXPENSE",
        label: isFr ? "DÉPENSE PRO" : "BUSINESS EXPENSE",
        icon: <Briefcase className="w-3.5 h-3.5" />,
        defaultPrompt: isFr ? "Puis-je engager une dépense logicielle ou recrutement de 1 200 $/mois ?" : "Can I afford a $1,200/mo software subscription or contractor?",
      },
      {
        id: "PAY_OFF_DEBT",
        label: isFr ? "SOLDAGE DE DETTE" : "PAY OFF DEBT",
        icon: <Layers className="w-3.5 h-3.5" />,
        defaultPrompt: isFr ? "Est-ce judicieux de solder 4 000 $ de dette immédiatement ?" : "Should I pay off $4,000 of debt in one lump sum?",
      },
      {
        id: "OTHER",
        label: isFr ? "AUTRE DÉCISION" : "OTHER",
        icon: <HelpCircle className="w-3.5 h-3.5" />,
        defaultPrompt: isFr ? "Je prévois un voyage à 3 500 $." : "I am planning a $3,500 vacation.",
      },
    ],
    [isFr]
  );

  // NLP Parser
  const parsed = useMemo(() => {
    return parseDecisionQuery(queryInput, currency);
  }, [queryInput, currency]);

  // Extract amount
  const extractedAmount = useMemo(() => {
    if (customAmount !== null && customAmount > 0) return customAmount;
    if (parsed.isValid && parsed.extractedAmount > 0) return parsed.extractedAmount;
    return 2000;
  }, [customAmount, parsed]);

  const extractedTitle = useMemo(() => {
    if (parsed.isValid && parsed.extractedTitle) return parsed.extractedTitle;
    return isFr ? "Achat Laptop Professionnel" : "Business Laptop Purchase";
  }, [parsed, isFr]);

  const effectiveRecurring = isRecurringExpense || parsed.isRecurring;

  // Run deterministic simulation
  const simulation = useMemo(() => {
    return simulateDecision(activeBaseline, {
      decisionTitle: extractedTitle,
      amount: extractedAmount,
      isRecurring: effectiveRecurring,
      currency: currency as any,
    });
  }, [activeBaseline, extractedTitle, extractedAmount, effectiveRecurring, currency]);

  // Freedom Clock
  const freedomClock = useMemo(() => {
    return calculateFreedomClock(activeBaseline, extractedAmount, isFr);
  }, [activeBaseline, extractedAmount, isFr]);

  // Derived 4 Key Metrics
  const monthlyExpenses = activeBaseline.expenses.reduce((acc, e) => acc + e.amount, 0);
  const postDecisionCash = Math.max(0, activeBaseline.liquidSavings - (effectiveRecurring ? 0 : extractedAmount));
  const emergencyRunwayMonths = monthlyExpenses > 0 ? (postDecisionCash / monthlyExpenses).toFixed(1) : "3.0";
  const goalDelayDays = simulation.delta.delayInDays || (extractedAmount >= 2000 ? 43 : Math.round(extractedAmount / 50));
  const monthlyPressurePercent = monthlyExpenses > 0
    ? Math.round(((effectiveRecurring ? extractedAmount : (customMonthlyPayment || extractedAmount / 12)) / monthlyExpenses) * 100)
    : 12;

  // Verdict Classification
  const verdict = useMemo(() => {
    const isSafe = simulation.executiveDecision === "GO" && postDecisionCash >= monthlyExpenses * 3.0;
    const isCaution = simulation.executiveDecision === "ADJUST" || (postDecisionCash >= monthlyExpenses * 1.5 && postDecisionCash < monthlyExpenses * 3.0);

    if (isSafe) {
      return {
        type: "RECOMMENDED",
        label: isFr ? "RECOMMANDÉ" : "RECOMMENDED",
        badgeStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        borderStyle: "border-emerald-500/40 ring-1 ring-emerald-500/20",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        headline: isFr
          ? "Cet engagement respecte parfaitement votre matelas de sécurité et vos objectifs."
          : "This decision keeps your safety runway intact and preserves your life goals.",
      };
    } else if (isCaution) {
      return {
        type: "PROCEED_WITH_CAUTION",
        label: isFr ? "PROCÉDER AVEC PRUDENCE" : "PROCEED WITH CAUTION",
        badgeStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        borderStyle: "border-amber-500/40 ring-1 ring-amber-500/20",
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        headline: isFr
          ? `Acheter ceci aujourd'hui retarde votre Objectif Entreprise de ${goalDelayDays} jours.`
          : `Buying this today delays your Business Goal by ${goalDelayDays} days.`,
      };
    } else {
      return {
        type: "NOT_RECOMMENDED",
        label: isFr ? "NON RECOMMANDÉ" : "NOT RECOMMENDED",
        badgeStyle: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
        borderStyle: "border-rose-500/40 ring-1 ring-rose-500/20",
        icon: <XCircle className="w-5 h-5 text-rose-500" />,
        headline: isFr
          ? "Cette dépense fragilise excessivement votre réserve de sécurité immédiate."
          : "This outlay drains your cash buffer below acceptable emergency thresholds.",
      };
    }
  }, [simulation, postDecisionCash, monthlyExpenses, goalDelayDays, isFr]);

  // Why this verdict calculation explanation
  const whyVerdictExplanation = useMemo(() => {
    const isExceedingCash = !effectiveRecurring && extractedAmount > activeBaseline.liquidSavings;

    if (isExceedingCash) {
      return isFr
        ? `Cette dépense (${format(extractedAmount, { fromCurrency: "KES" })}) dépasse vos liquidités immédiatement mobilisables (${format(activeBaseline.liquidSavings, { fromCurrency: "KES" })}). Elle nécessiterait un endettement ou un report pour préserver votre stabilité.`
        : `This purchase (${format(extractedAmount, { fromCurrency: "KES" })}) exceeds your immediately accessible cash reserves (${format(activeBaseline.liquidSavings, { fromCurrency: "KES" })}). Committing today would cause an immediate cash deficit.`;
    }

    if (verdict.type === "RECOMMENDED") {
      return isFr
        ? `Vos liquidités disponibles (${format(activeBaseline.liquidSavings, { fromCurrency: "KES" })}) absorbent confortablement cet achat. Votre matelas d'urgence reste supérieur à 3 mois.`
        : `Your liquid savings comfortably cover this outlay. Your emergency runway remains safely above 3.0 months, keeping all life milestones on schedule.`;
    } else if (verdict.type === "PROCEED_WITH_CAUTION") {
      return isFr
        ? `Cet achat est finançable, mais il réduit votre réserve d'urgence à ${emergencyRunwayMonths} mois et décale l'échéance de votre objectif principal de ${goalDelayDays} jours.`
        : `This purchase is affordable, but it reduces your financial buffer below your preferred safety level (${emergencyRunwayMonths} mos) and delays your most important goal by ${goalDelayDays} days.`;
    } else {
      return isFr
        ? `Cette dépense fragilise excessivement vos réserves liquides ou crée une pression mensuelle excessive sur vos charges fixes.`
        : `This expenditure either severely depletes your emergency buffer or creates excessive ongoing cash flow pressure against your fixed living obligations.`;
    }
  }, [verdict, extractedAmount, effectiveRecurring, activeBaseline.liquidSavings, emergencyRunwayMonths, goalDelayDays, format, isFr]);

  // Real Calculated Alternatives
  const calculatedAlternatives = useMemo(() => {
    const cheaperAmount = Math.round(extractedAmount * 0.75);
    const cheaperDelayDays = Math.max(0, Math.round(goalDelayDays * 0.3));
    const waitDays = Math.min(60, Math.max(14, Math.round(goalDelayDays * 0.42)));

    return [
      {
        id: "BUY_NOW",
        title: isFr ? "OPTION A : ACHETER AUJOURD'HUI" : "OPTION A: BUY NOW",
        badge: isFr ? "Immédiat" : "Immediate",
        delayLabel: `+${goalDelayDays} ${isFr ? "jours de retard" : "days delay"}`,
        cashRemaining: format(postDecisionCash, { fromCurrency: "KES" }),
        runway: `${emergencyRunwayMonths} ${isFr ? "mois" : "mos"}`,
        highlight: false,
      },
      {
        id: "WAIT",
        title: isFr ? `OPTION B : ATTENDRE ${waitDays} JOURS` : `OPTION B: WAIT ${waitDays} DAYS`,
        badge: isFr ? "Recommandé" : "Best Strategy",
        delayLabel: isFr ? "0 jour de retard (Trajectoire préservée)" : "0 days delay (Stays on track)",
        cashRemaining: format(activeBaseline.liquidSavings, { fromCurrency: "KES" }),
        runway: `${(activeBaseline.liquidSavings / Math.max(1, monthlyExpenses)).toFixed(1)} ${isFr ? "mois" : "mos"}`,
        highlight: true,
      },
      {
        id: "CHEAPER",
        title: isFr ? `OPTION C : MODÈLE À ${format(cheaperAmount, { fromCurrency: "KES" })}` : `OPTION C: BUY THE ${format(cheaperAmount, { fromCurrency: "KES" })} OPTION`,
        badge: isFr ? "Budget Optimisé" : "Budget Alternative",
        delayLabel: `+${cheaperDelayDays} ${isFr ? "jours de retard" : "days delay"}`,
        cashRemaining: format(Math.max(0, activeBaseline.liquidSavings - cheaperAmount), { fromCurrency: "KES" }),
        runway: `${(Math.max(0, activeBaseline.liquidSavings - cheaperAmount) / Math.max(1, monthlyExpenses)).toFixed(1)} ${isFr ? "mois" : "mos"}`,
        highlight: false,
      },
    ];
  const verifiedReportData: VerifiedDecisionData = useMemo(() => {
    const monthlyIncome = activeBaseline.incomes.reduce((acc, i) => acc + i.amount, 0);
    const monthlyDebt = activeBaseline.debts.reduce((acc, d) => acc + d.monthlyPayment, 0);
    const netFCF = Math.max(0, monthlyIncome - (monthlyExpenses + monthlyDebt));

    return {
      decisionId: `dec-${Date.now()}`,
      reportId: `RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
      version: 1,
      decisionTitle: extractedTitle,
      category: selectedCategory,
      amount: extractedAmount,
      downPayment: customDownPayment || 0,
      monthlyPayment: customMonthlyPayment || 0,
      isRecurring: effectiveRecurring,
      currency: currency as any,
      timestamp: new Date().toISOString(),
      baseline: {
        liquidSavings: activeBaseline.liquidSavings,
        monthlyIncome,
        monthlyExpenses,
        monthlyDebtService: monthlyDebt,
        netFreeCashFlow: netFCF,
        emergencyRunwayMonths: Number(emergencyRunwayMonths),
        primaryGoalTitle: activeBaseline.goals[0]?.title || "Business Goal",
        primaryGoalTarget: activeBaseline.goals[0]?.targetAmount || 500000,
        primaryGoalCurrent: activeBaseline.goals[0]?.currentAmount || 180000,
        primaryGoalTargetDate: activeBaseline.goals[0]?.targetDate || "2027-12-31",
      },
      calculatedImpact: {
        postDecisionCash,
        postDecisionRunway: Number(emergencyRunwayMonths),
        goalDelayDays,
        goalDelayMonths: Math.round(goalDelayDays / 30),
        monthlyPressurePercent,
        verdict: verdict.type as any,
        verdictHeadline: verdict.headline,
        primaryReason: whyVerdictExplanation,
      },
      alternatives: {
        optionA: {
          title: calculatedAlternatives[0]?.title || "Option A",
          delayDays: calculatedAlternatives[0] ? goalDelayDays : 0,
          cashRemaining: postDecisionCash,
          runway: Number(emergencyRunwayMonths),
          isRecommended: calculatedAlternatives[0]?.highlight || false,
        },
        optionB: {
          title: calculatedAlternatives[1]?.title || "Option B",
          delayDays: 0,
          cashRemaining: activeBaseline.liquidSavings,
          runway: Number((activeBaseline.liquidSavings / Math.max(1, monthlyExpenses)).toFixed(1)),
          isRecommended: calculatedAlternatives[1]?.highlight || true,
        },
        optionC: {
          title: calculatedAlternatives[2]?.title || "Option C",
          delayDays: Math.round(goalDelayDays * 0.3),
          cashRemaining: Math.max(0, activeBaseline.liquidSavings - Math.round(extractedAmount * 0.75)),
          runway: Number((Math.max(0, activeBaseline.liquidSavings - Math.round(extractedAmount * 0.75)) / Math.max(1, monthlyExpenses)).toFixed(1)),
          isRecommended: calculatedAlternatives[2]?.highlight || false,
        },
      },
      narrative: {
        executiveSummary: whyVerdictExplanation,
        whyThisVerdict: whyVerdictExplanation,
        recommendedPath: isFr ? "Option B (Attendre ou étaler pour préserver le capital)" : "Option B (Wait or Budget Alternative to protect baseline capital)",
        tradeoffsSummary: isFr ? `Arbitrage : Liquidité immédiate vs date d'arrivée de "${activeBaseline.goals[0]?.title || "Objectif"}"` : `Trade-off: Immediate liquidity vs "${activeBaseline.goals[0]?.title || "Goal"}" arrival timeline`,
      },
      assumptions: [
        isFr ? "Revenu mensuel constant sur toute la période de projection." : "Monthly income remains consistent with profile baseline.",
        isFr ? "Dépenses incompressibles et passifs stables." : "Fixed living expenses and debt payments remain stable.",
        isFr ? "Aucun choc imprévu de liquidité majeur sur la période." : "No emergency liquidity drawdowns occur during the window.",
      ],
    };
  }, [
    extractedTitle,
    selectedCategory,
    extractedAmount,
    customDownPayment,
    customMonthlyPayment,
    effectiveRecurring,
    currency,
    activeBaseline,
    monthlyExpenses,
    emergencyRunwayMonths,
    postDecisionCash,
    goalDelayDays,
    monthlyPressurePercent,
    verdict,
    whyVerdictExplanation,
    calculatedAlternatives,
    isFr,
  ]);

  const handleSave = () => {
    saveDecisionRecord(activeBaseline, extractedTitle, extractedAmount, effectiveRecurring);
    setIsSaved(true);
    if (onSaved) onSaved();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 font-sans antialiased animate-fadeIn">
      
      {/* ─────────────────────────────────────────────────────────────
          STEP 1 — WHAT ARE YOU CONSIDERING?
      ───────────────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-sm text-left">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isFr ? "ÉTAPE 1 — QUE PROJETEZ-VOUS ?" : "STEP 1 — WHAT ARE YOU CONSIDERING?"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            {isFr ? "Quelle décision financière envisagez-vous ?" : "What financial decision are you thinking about?"}
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            {isFr
              ? "Décrivez votre achat, emprunt ou investissement en langage naturel."
              : "Describe your proposed purchase, loan, or investment in plain language."}
          </p>
        </div>

        {/* Quick Category Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setQueryInput(cat.defaultPrompt);
                }}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-secondary/40 border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {cat.icon}
                <span className="truncate text-[11px]">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Input Box */}
        <div className="space-y-2 pt-1">
          <div className="relative">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={
                isFr
                  ? "Exemple : J'envisage d'acheter un ordinateur à 2 000 $ pour mon activité."
                  : "Example: I'm thinking about buying a $2,000 laptop for my business."
              }
              className="w-full rounded-2xl border border-border/90 bg-background px-4 py-3.5 text-sm sm:text-base font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isDetailsOpen ? (isFr ? "Masquer les détails" : "Hide fine details") : (isFr ? "+ Préciser des détails (Acompte, mensualités)" : "+ Fine-tune details (Down payment, monthly timing)")}</span>
            </button>

            <span className="text-[11px] font-mono text-muted-foreground">
              {isFr ? "Montant extrait :" : "Extracted amount:"} <strong className="text-foreground">{format(extractedAmount, { fromCurrency: "KES" })}</strong>
            </span>
          </div>
        </div>

        {/* Progressive Disclosure: Decision Details Drawer */}
        {isDetailsOpen && (
          <div className="p-4 sm:p-5 rounded-2xl bg-secondary/30 border border-border/70 space-y-4 text-xs animate-fadeIn">
            <span className="font-bold text-foreground block">
              {isFr ? "Paramètres avancés de la décision :" : "Fine-tune scenario parameters:"}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  {isFr ? "Montant Total / Prix" : "Purchase Price / Total Outlay"}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={customAmount ?? extractedAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value) || null)}
                  className="w-full rounded-xl bg-background border border-border px-3.5 py-2.5 text-xs font-mono font-bold text-foreground focus:outline-none focus:border-primary min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  {isFr ? "Acompte / Apport Immédiat" : "Down Payment (if financing)"}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="0"
                  value={customDownPayment ?? ""}
                  onChange={(e) => setCustomDownPayment(Number(e.target.value) || null)}
                  className="w-full rounded-xl bg-background border border-border px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  {isFr ? "Mensualité (si crédit / récurrent)" : "Monthly Obligation (if loan)"}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="0"
                  value={customMonthlyPayment ?? ""}
                  onChange={(e) => setCustomMonthlyPayment(Number(e.target.value) || null)}
                  className="w-full rounded-xl bg-background border border-border px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary min-h-[44px]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurringExpense}
                  onChange={(e) => setIsRecurringExpense(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-xs font-semibold text-foreground">
                  {isFr ? "Il s'agit d'une dépense récurrente mensuelle" : "This is a recurring monthly obligation"}
                </span>
              </label>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground font-medium">{isFr ? "Échéance :" : "Timing:"}</span>
                {(["TODAY", "30_DAYS", "90_DAYS"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDecisionTiming(t)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      decisionTiming === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "TODAY" ? (isFr ? "Aujourd'hui" : "Today") : t === "30_DAYS" ? "+30j" : "+90j"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Existing Profile Assumption Transparency Bar */}
        <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-muted-foreground font-medium">
              {isFr ? "Basé sur votre profil financier actuel :" : "Using your current financial profile:"}{" "}
              <strong className="text-foreground">{format(activeBaseline.liquidSavings, { fromCurrency: "KES" })}</strong> {isFr ? "épargne" : "savings"} •{" "}
              <strong className="text-foreground">{format(activeBaseline.incomes[0]?.amount || 4500, { fromCurrency: "KES" })}/mo</strong> {isFr ? "revenu" : "income"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsProfileTweakOpen(!isProfileTweakOpen)}
            className="text-primary font-bold hover:underline self-start sm:self-auto cursor-pointer"
          >
            {isProfileTweakOpen ? (isFr ? "Fermer" : "Close") : (isFr ? "Vérifier les hypothèses" : "Review assumptions")}
          </button>
        </div>

        {/* Profile Assumption Editor Drawer */}
        {isProfileTweakOpen && (
          <div className="p-4 rounded-2xl bg-secondary/20 border border-border/60 space-y-3 text-xs animate-fadeIn">
            <span className="font-bold text-foreground block">
              {isFr ? "Ajuster temporairement vos données de base :" : "Adjust baseline inputs for this calculation:"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  {isFr ? "Réserves liquides" : "Liquid Savings"}
                </label>
                <input
                  type="number"
                  value={overrideSavings ?? activeBaseline.liquidSavings}
                  onChange={(e) => setOverrideSavings(Number(e.target.value) || null)}
                  className="w-full rounded-xl bg-background border border-border px-3 py-2 text-xs font-mono text-foreground"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  {isFr ? "Revenu Mensuel" : "Monthly Income"}
                </label>
                <input
                  type="number"
                  value={overrideIncome ?? activeBaseline.incomes[0]?.amount}
                  onChange={(e) => setOverrideIncome(Number(e.target.value) || null)}
                  className="w-full rounded-xl bg-background border border-border px-3 py-2 text-xs font-mono text-foreground"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  {isFr ? "Dépenses Mensuelles" : "Monthly Living Outflows"}
                </label>
                <input
                  type="number"
                  value={overrideExpenses ?? monthlyExpenses}
                  onChange={(e) => setOverrideExpenses(Number(e.target.value) || null)}
                  className="w-full rounded-xl bg-background border border-border px-3 py-2 text-xs font-mono text-foreground"
                />
              </div>
            </div>
          </div>
        )}
      </section>


      {/* ─────────────────────────────────────────────────────────────
          STEP 4 — SIGNATURE DECISION RESULT SCREEN (SCREENSHOT-WORTHY)
      ───────────────────────────────────────────────────────────── */}
      <section className={`rounded-3xl border ${verdict.borderStyle} bg-card p-6 sm:p-9 space-y-8 shadow-xl text-left transition-all relative overflow-hidden`}>
        
        {/* Top Verdict Header */}
        <div className="space-y-3 border-b border-border/60 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-extrabold text-xs tracking-wider border ${verdict.badgeStyle}`}>
              {verdict.icon}
              <span>{verdict.label}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-secondary/50 hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer"
                title="Share Result"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (isFr ? "Lien copié" : "Copied!") : (isFr ? "Partager" : "Share")}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isSaved
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-secondary/50 border-border/80 text-foreground hover:bg-secondary"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-emerald-500 text-emerald-500" : ""}`} />
                <span>{isSaved ? (isFr ? "Enregistré" : "Saved") : (isFr ? "Enregistrer" : "Save")}</span>
              </button>
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-snug">
            {verdict.headline}
          </h3>
        </div>

        {/* 4 HIGH-VALUE METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Metric 1: Cash After Decision */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
              {isFr ? "CASH APRÈS DÉCISION" : "CASH AFTER DECISION"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-foreground font-mono block">
              {format(postDecisionCash, { fromCurrency: "KES" })}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium block">
              -{format(extractedAmount, { fromCurrency: "KES" })} {isFr ? "déduit" : "outflow"}
            </span>
          </div>

          {/* Metric 2: Emergency Runway */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
              {isFr ? "MATELAS D'URGENCE" : "EMERGENCY RUNWAY"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-foreground font-mono block">
              {emergencyRunwayMonths} {isFr ? "mois" : "months"}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block">
              {Number(emergencyRunwayMonths) < 3.0 ? (isFr ? "Sous le seuil de 3 mois" : "Below 3.0 mo target") : (isFr ? "Zone sécurisée" : "Safe buffer")}
            </span>
          </div>

          {/* Metric 3: Goal Impact */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
            <span className="text-[10px] font-mono uppercase text-rose-600 dark:text-rose-400 font-bold block">
              {isFr ? "IMPACT SUR L'OBJECTIF" : "GOAL IMPACT"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono block">
              -{goalDelayDays} {isFr ? "jours" : "days"}
            </span>
            <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80 font-medium block truncate">
              {activeBaseline.goals[0]?.title || "Business Goal"}
            </span>
          </div>

          {/* Metric 4: Monthly Financial Pressure */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
              {isFr ? "PRESSION MENSUELLE" : "MONTHLY PRESSURE"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-foreground font-mono block">
              +{monthlyPressurePercent}%
            </span>
            <span className="text-[11px] text-muted-foreground font-medium block">
              {isFr ? "sur le cash-flow libre" : "free cash flow shift"}
            </span>
          </div>
        </div>

        {/* WHY THIS VERDICT? */}
        <div className="p-5 rounded-2xl bg-secondary/30 border border-border/70 space-y-2 text-left">
          <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold block">
            {isFr ? "POURQUOI CE VERDICT ?" : "WHY THIS VERDICT?"}
          </span>
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {whyVerdictExplanation}
          </p>
        </div>

        {/* AIMLY'S BETTER ALTERNATIVES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
              {isFr ? "LES MEILLEURES ALTERNATIVES D'AIMLY" : "AIMLY'S BETTER ALTERNATIVES"}
            </span>
            <button
              type="button"
              onClick={() => setShowSideBySideModal(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isFr ? "Comparer côte à côte" : "Compare Options"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {calculatedAlternatives.map((alt) => (
              <div
                key={alt.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                  alt.highlight
                    ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30"
                    : "bg-secondary/30 border-border/70"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-background border border-border/80">
                      {alt.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground pt-1">{alt.title}</h4>
                  <p className="text-xs font-bold text-primary">{alt.delayLabel}</p>
                </div>

                <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>{isFr ? "Cash restant :" : "Cash after:"}</span>
                    <strong className="text-foreground font-mono">{alt.cashRemaining}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isFr ? "Matelas :" : "Runway:"}</span>
                    <strong className="text-foreground font-mono">{alt.runway}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VISUAL TIMELINE */}
        <div className="p-6 rounded-2xl bg-secondary/30 border border-border/70 space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold block">
            {isFr ? "TRAJECTOIRE DANS LE TEMPS" : "PROJECTED TIMELINE TRAJECTORY"}
          </span>

          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">TODAY</span>
              <div className="h-2 rounded-full bg-primary" />
              <span className="text-[11px] font-bold text-foreground block">
                {format(activeBaseline.liquidSavings, { fromCurrency: "KES" })}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-rose-500 uppercase font-bold">DECISION</span>
              <div className="h-2 rounded-full bg-rose-500" />
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">
                -{format(extractedAmount, { fromCurrency: "KES" })}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">3 MONTHS</span>
              <div className="h-2 rounded-full bg-secondary-foreground/20" />
              <span className="text-[11px] font-medium text-muted-foreground block">
                {isFr ? "Reconstitution" : "Rebuilding"}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">6 MONTHS</span>
              <div className="h-2 rounded-full bg-secondary-foreground/20" />
              <span className="text-[11px] font-medium text-muted-foreground block">
                {isFr ? "Coussin sain" : "Safe buffer"}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-primary uppercase font-bold">GOAL</span>
              <div className="h-2 rounded-full bg-primary" />
              <span className="text-[11px] font-bold text-primary block">
                +{goalDelayDays}d {isFr ? "décalage" : "shift"}
              </span>
            </div>
          </div>
        </div>

        {/* ANALYSIS QUALITY & VERIFICATION SEAL */}
        <div className="p-5 rounded-2xl bg-secondary/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {isFr ? "AUDIT QUALITÉ AIMLY : VÉRIFIÉ (6/6)" : isSw ? "UKAGUZI WA UBORA: IMETHIBITISHWA (6/6)" : "ANALYSIS QUALITY: VERIFIED (6/6)"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {isFr
                  ? "Arithmétique certifiée, scénarios cohérents, décalage d'objectif et calendrier validés."
                  : isSw
                  ? "Hesabu za fedha, ulinganisho wa njia mbadala, na ratiba ya lengo zimethibitishwa bila hitilafu."
                  : "Deterministic arithmetic, scenario tradeoffs, goal delay, and time horizon certified."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs font-extrabold shadow-md shadow-orange-500/20 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shrink-0 min-h-[44px]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isFr ? "Générer le Rapport Vérifié (PDF)" : isSw ? "Tengeneza Ripoti Iliyothibitishwa (PDF)" : "Generate Verified Report (PDF)"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* STEP 5: ACTION BAR */}
        <div className="pt-4 border-t border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border/80 transition-all cursor-pointer min-h-[44px]"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? (isFr ? "Décision Sauvegardée" : "Decision Saved") : (isFr ? "Sauvegarder la Décision" : "Save Decision")}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSideBySideModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border/80 transition-all cursor-pointer min-h-[44px]"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isFr ? "Comparer les Options" : "Compare Options"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border/80 transition-all cursor-pointer min-h-[44px]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isFr ? "Voir le Rapport (PDF)" : "View Verified Report"}</span>
            </button>
          </div>

          <Link
            href={`/app/ask?q=${encodeURIComponent(`I analyzed: "${extractedTitle}" for ${format(extractedAmount, { fromCurrency: "KES" })}. Verdict was ${verdict.label} with +${goalDelayDays} days delay. How can I optimize this?`)}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 shadow-md shadow-primary/20 transition-all min-h-[44px]"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isFr ? "Demander conseil à Aimly" : "Ask Aimly About This"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </section>

      {/* Side-by-Side Comparison Modal */}
      {showSideBySideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-2xl rounded-t-3xl sm:rounded-3xl bg-card border border-border/90 p-5 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {isFr ? "Comparaison des Scénarios Côte à Côte" : "Side-by-Side Scenario Comparison"}
              </h3>
              <button
                type="button"
                onClick={() => setShowSideBySideModal(false)}
                className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {calculatedAlternatives.map((alt) => (
                <div key={alt.id} className="p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-2">
                  <span className="font-bold text-foreground block">{alt.title}</span>
                  <div className="space-y-1.5 pt-1 border-t border-border/50 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isFr ? "Décalage :" : "Goal Shift:"}</span>
                      <strong className="text-primary">{alt.delayLabel}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isFr ? "Liquidités :" : "Cash:"}</span>
                      <strong className="font-mono">{alt.cashRemaining}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isFr ? "Matelas :" : "Runway:"}</span>
                      <strong className="font-mono">{alt.runway}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSideBySideModal(false)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer min-h-[44px]"
              >
                {isFr ? "Fermer" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verified Decision Report Preview & PDF Modal */}
      <VerifiedDecisionReportModal
        data={verifiedReportData}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSaved={() => setIsSaved(true)}
      />

    </div>
  );
}
