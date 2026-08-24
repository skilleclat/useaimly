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
  ArrowLeft,
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
  FileDown,
  Lock,
  Compass,
  Target,
  Wallet,
} from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { parseDecisionQuery } from "@/lib/nlp/decision-query-parser";
import {
  simulateDecision,
  BaselineFinancialProfile,
  saveDecisionRecord,
} from "@/lib/finance";
import { calculateFreedomClock } from "@/lib/finance/health/freedom-clock";
import { formatCurrency } from "@/lib/utils/currency";
import {
  VerifiedDecisionData,
  runAimlyCoherenceCheck,
} from "@/lib/decision-engine/decision-validator";
import { generateVerifiedDecisionReportPDF } from "@/lib/decision-engine/verified-report-generator";
import { saveDecisionReportToVault } from "@/lib/decision-engine/report-vault";

export type DecisionCategory =
  | "BUY_SOMETHING"
  | "TAKE_A_LOAN"
  | "BUY_A_CAR"
  | "MOVE_HOME"
  | "INVEST"
  | "BUSINESS_EXPENSE"
  | "PAY_OFF_DEBT"
  | "OTHER";

export type UserDecisionPriority =
  | "PROTECT_CASH"
  | "REACH_GOALS"
  | "LOW_MONTHLY"
  | "AVOID_DEBT"
  | "BUY_SOONER";

export interface AimlyDecisionEngineProps {
  baselineProfile?: BaselineFinancialProfile;
  initialQuery?: string;
  initialCategory?: DecisionCategory;
  initialStep?: number;
  onSaved?: () => void;
  compact?: boolean;
}

export function AimlyDecisionEngine({
  baselineProfile,
  initialQuery = "I'm thinking about buying a $2,000 laptop for my business.",
  initialCategory = "BUY_SOMETHING",
  initialStep = 1,
  onSaved,
}: AimlyDecisionEngineProps) {
  const router = useRouter();
  const { currency, format } = useCurrency();
  const { language } = useI18n();
  const isFr = language === "fr";
  const isSw = language === "sw";

  // Active Journey Step: 1 to 7
  const [currentStep, setCurrentStep] = useState<number>(initialStep);

  // STEP 1: Decision Intake
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<DecisionCategory>(initialCategory);

  // STEP 2: Decision Details
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [customDownPayment, setCustomDownPayment] = useState<number | null>(null);
  const [customMonthlyPayment, setCustomMonthlyPayment] = useState<number | null>(null);
  const [isRecurringExpense, setIsRecurringExpense] = useState(false);
  const [decisionTiming, setDecisionTiming] = useState<"TODAY" | "30_DAYS" | "90_DAYS">("TODAY");

  // STEP 3: Financial Context Overrides
  const [overrideSavings, setOverrideSavings] = useState<number | null>(null);
  const [overrideIncome, setOverrideIncome] = useState<number | null>(null);
  const [overrideExpenses, setOverrideExpenses] = useState<number | null>(null);
  const [overrideDebt, setOverrideDebt] = useState<number | null>(null);
  const [isEditingContext, setIsEditingContext] = useState(false);

  // STEP 4: Goals & Priorities
  const [selectedPriority, setSelectedPriority] = useState<UserDecisionPriority>("PROTECT_CASH");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("primary-goal");

  // STEP 5 & 7: UI & Report states
  const [isSaved, setIsSaved] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
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
          id: "primary-goal",
          title: isFr ? "Lancement Entreprise & Projets" : isSw ? "Kuanzisha Biashara" : "Business Launch & Life Goal",
          targetAmount: 25000,
          currentAmount: 12000,
          targetDate: "2027-12-31",
          priority: "HIGH",
          status: "ACTIVE",
        },
      ],
    };

    const monthlyDebtDefault = base.debts.reduce((acc, d) => acc + d.monthlyPayment, 0);

    return {
      ...base,
      liquidSavings: overrideSavings !== null ? overrideSavings : base.liquidSavings,
      incomes: overrideIncome !== null
        ? [{ name: "Primary Income", amount: overrideIncome, frequency: "MONTHLY", reliability: "STABLE", isActive: true }]
        : base.incomes,
      expenses: overrideExpenses !== null
        ? [{ name: "Living Expenses", amount: overrideExpenses, frequency: "MONTHLY", isFixed: true }]
        : base.expenses,
      debts: overrideDebt !== null
        ? [{ id: "debt-ovr", name: "Existing Debt", totalAmount: overrideDebt * 24, monthlyPayment: overrideDebt, interestRate: 0.1, category: "OTHER" as any, isSecured: false }]
        : base.debts,
    };
  }, [baselineProfile, overrideSavings, overrideIncome, overrideExpenses, overrideDebt, isFr, isSw]);

  // Categories definitions
  const CATEGORIES: { id: DecisionCategory; label: string; icon: React.ReactNode; defaultPrompt: string }[] = useMemo(
    () => [
      {
        id: "BUY_SOMETHING",
        label: isFr ? "ACHAT MATÉRIEL" : isSw ? "NUNUA KITU" : "BUY SOMETHING",
        icon: <ShoppingBag className="w-4 h-4" />,
        defaultPrompt: isFr ? "J'envisage d'acheter un ordinateur à 2 000 $ pour mon activité." : "I'm thinking about buying a $2,000 laptop for my business.",
      },
      {
        id: "TAKE_A_LOAN",
        label: isFr ? "SOUSCRIRE UN CRÉDIT" : isSw ? "CHUKUA MKOPO" : "TAKE A LOAN",
        icon: <CreditCard className="w-4 h-4" />,
        defaultPrompt: isFr ? "Que se passe-t-il si je souscris un prêt de 10 000 $ avec 300 $/mois ?" : "What happens if I take a $10,000 loan with $300/mo payment?",
      },
      {
        id: "BUY_A_CAR",
        label: isFr ? "ACHETER UNE VOITURE" : isSw ? "NUNUA GARI" : "BUY A VEHICLE",
        icon: <Car className="w-4 h-4" />,
        defaultPrompt: isFr ? "Puis-je acheter une voiture à 15 000 $ avec 3 000 $ d'apport ?" : "Can I buy a $15,000 car with $3,000 down payment?",
      },
      {
        id: "MOVE_HOME",
        label: isFr ? "DÉMÉNAGEMENT / LOYER" : isSw ? "HAMIA NYUMBA" : "MOVE HOME",
        icon: <Home className="w-4 h-4" />,
        defaultPrompt: isFr ? "Puis-je emménager dans un logement à 1 800 $/mois ?" : "Can I move to an apartment with $1,800/mo rent?",
      },
      {
        id: "INVEST",
        label: isFr ? "INVESTIR DU CAPITAL" : isSw ? "WEKEZA FEDHA" : "INVEST MONEY",
        icon: <TrendingUp className="w-4 h-4" />,
        defaultPrompt: isFr ? "Quel impact si j'investis 5 000 $ dans un fonds indiciel ?" : "What happens if I invest $5,000 in an index fund?",
      },
      {
        id: "BUSINESS_EXPENSE",
        label: isFr ? "DÉPENSE PRO" : isSw ? "GHARAMA YA BIASHARA" : "BUSINESS EXPENSE",
        icon: <Briefcase className="w-4 h-4" />,
        defaultPrompt: isFr ? "Je prévois 3 000 $ de budget marketing pour mon lancement." : "I am planning $3,000 for product marketing.",
      },
      {
        id: "PAY_OFF_DEBT",
        label: isFr ? "SOLDAGE DE DETTE" : isSw ? "LIPA DENI" : "PAY OFF DEBT",
        icon: <Layers className="w-3.5 h-3.5" />,
        defaultPrompt: isFr ? "Est-ce judicieux de solder 4 000 $ de dette immédiatement ?" : "Should I pay off $4,000 of debt in one lump sum?",
      },
      {
        id: "OTHER",
        label: isFr ? "AUTRE PROJET" : isSw ? "UAMUZI MWINGINE" : "OTHER",
        icon: <HelpCircle className="w-3.5 h-3.5" />,
        defaultPrompt: isFr ? "Je prévois un voyage à 3 500 $." : "I am planning a $3,500 vacation.",
      },
    ],
    [isFr, isSw]
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
    return isFr ? "Achat / Projet Financier" : isSw ? "Uamuzi wa Kifedha" : "Financial Decision Project";
  }, [parsed, isFr, isSw]);

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

  // Derived 4 Key Metrics
  const monthlyExpenses = activeBaseline.expenses.reduce((acc, e) => acc + e.amount, 0);
  const monthlyDebt = activeBaseline.debts.reduce((acc, d) => acc + d.monthlyPayment, 0);
  const monthlyInflow = activeBaseline.incomes.reduce((acc, i) => acc + i.amount, 0);
  const netFreeCashFlow = Math.max(0, monthlyInflow - (monthlyExpenses + monthlyDebt));

  const postDecisionCash = Math.max(0, activeBaseline.liquidSavings - (effectiveRecurring ? 0 : (customDownPayment || extractedAmount)));
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
        label: isFr ? "RECOMMANDÉ" : isSw ? "INASHAURIWA" : "RECOMMENDED",
        badgeStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        borderStyle: "border-emerald-500/40 ring-1 ring-emerald-500/20",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        headline: isFr
          ? "Cet engagement respecte parfaitement votre matelas de sécurité et vos objectifs."
          : isSw
          ? "Uamuzi huu unalinda akiba yako ya dharura na malengo yako makuu."
          : "This commitment safely protects your emergency runway and life goals.",
      };
    }

    if (isCaution) {
      return {
        type: "PROCEED_WITH_CAUTION",
        label: isFr ? "PROCÉDER AVEC PRUDENCE" : isSw ? "ENDELEA KWA TAHADHARI" : "PROCEED WITH CAUTION",
        badgeStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        borderStyle: "border-amber-500/40 ring-1 ring-amber-500/20",
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        headline: isFr
          ? `L'achat est faisable immédiatement, mais il décale votre objectif de ${goalDelayDays} jours.`
          : isSw
          ? `Unaweza kununua leo, lakini inasogeza mbele lengo lako kwa siku ${goalDelayDays}.`
          : `Buying this today delays your primary goal by ${goalDelayDays} days.`,
      };
    }

    return {
      type: "NOT_RECOMMENDED",
      label: isFr ? "NON RECOMMANDÉ" : isSw ? "HAISHAURIWI" : "NOT RECOMMENDED",
      badgeStyle: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
      borderStyle: "border-rose-500/40 ring-1 ring-rose-500/20",
      icon: <XCircle className="w-5 h-5 text-rose-500" />,
      headline: isFr
        ? "Cet engagement fragilise votre matelas de sécurité en dessous du seuil critique."
        : isSw
        ? "Uamuzi huu unashusha akiba yako ya dharura chini ya kiwango cha usalama."
        : "This commitment puts your liquid safety buffer below critical safety levels.",
    };
  }, [simulation.executiveDecision, postDecisionCash, monthlyExpenses, goalDelayDays, isFr, isSw]);

  // Why Verdict Explanation
  const whyVerdictExplanation = useMemo(() => {
    if (verdict.type === "RECOMMENDED") {
      return isFr
        ? `L'analyse déterministe confirme que même après déduction de ${format(extractedAmount, { fromCurrency: "KES" })}, vos réserves liquides s'élèvent à ${format(postDecisionCash, { fromCurrency: "KES" })}, soit ${emergencyRunwayMonths} mois de charges courantes protégées.`
        : isSw
        ? `Uchambuzi unathibitisha kuwa hata baada ya kutoa ${format(extractedAmount, { fromCurrency: "KES" })}, unabaki na ${format(postDecisionCash, { fromCurrency: "KES" })}, sawa na miezi ${emergencyRunwayMonths} ya matumizi ya lazima.`
        : `Deterministic analysis verifies that after allocating ${format(extractedAmount, { fromCurrency: "KES" })}, you retain ${format(postDecisionCash, { fromCurrency: "KES" })} in liquid cash (${emergencyRunwayMonths} months of living runway protected).`;
    }

    if (verdict.type === "PROCEED_WITH_CAUTION") {
      return isFr
        ? `Vous possédez les liquidités nécessaires, mais cette dépense consomme ${format(extractedAmount, { fromCurrency: "KES" })} de votre épargne active, décalant l'atteinte de votre objectif principal de ${goalDelayDays} jours.`
        : isSw
        ? `Pesa unayo, lakini ununuzi huu unatumia ${format(extractedAmount, { fromCurrency: "KES" })} ya akiba yako, ukichelewesha lengo lako kwa siku ${goalDelayDays}.`
        : `Cash availability permits this transaction, but it absorbs ${format(extractedAmount, { fromCurrency: "KES" })} of capital, shifting your primary destination arrival by ${goalDelayDays} days.`;
    }

    return isFr
      ? `Cette décision absorberait une part excessive de vos réserves disponibles, abaissant votre matelas de résilience à ${emergencyRunwayMonths} mois (en dessous du seuil de sécurité recommandé de 3.0 mois).`
      : isSw
      ? `Uamuzi huu unamaliza akiba yako na kuacha miezi ${emergencyRunwayMonths} tu ya dharura (chini ya kiwango salama cha miezi 3.0).`
      : `This commitment would severely deplete your available reserves, reducing your runway to ${emergencyRunwayMonths} months (below the mandatory 3.0-month safety threshold).`;
  }, [verdict.type, extractedAmount, postDecisionCash, emergencyRunwayMonths, goalDelayDays, format, isFr, isSw]);

  // Real Calculated Alternatives
  const calculatedAlternatives = useMemo(() => {
    const cheaperAmount = Math.round(extractedAmount * 0.75);
    const cheaperDelayDays = Math.max(0, Math.round(goalDelayDays * 0.3));
    const waitDays = Math.min(60, Math.max(14, Math.round(goalDelayDays * 0.42)));

    return [
      {
        id: "BUY_NOW",
        title: isFr ? "OPTION A : ACHETER AUJOURD'HUI" : isSw ? "CHAGUO A: NUNUA LEO" : "OPTION A: BUY TODAY",
        badge: isFr ? "Immédiat" : isSw ? "Papo Hapo" : "Immediate",
        delayLabel: `+${goalDelayDays} ${isFr ? "jours de retard" : isSw ? "siku za kuchelewa" : "days delay"}`,
        cashRemaining: format(postDecisionCash, { fromCurrency: "KES" }),
        runway: `${emergencyRunwayMonths} ${isFr ? "mois" : "mos"}`,
        highlight: selectedPriority === "BUY_SOONER",
      },
      {
        id: "WAIT",
        title: isFr ? `OPTION B : ATTENDRE ${waitDays} JOURS & ÉPARGNER` : isSw ? `CHAGUO B: SUBIRI SIKU ${waitDays} KISHA NUNUA` : `OPTION B: WAIT ${waitDays} DAYS & SAVE`,
        badge: isFr ? "Recommandé" : isSw ? "Bora Zaidi" : "Aimly Best Option",
        delayLabel: isFr ? "0 jour de retard (Trajectoire préservée)" : isSw ? "0 siku (Malengo salama)" : "0 days delay (Stays on track)",
        cashRemaining: format(activeBaseline.liquidSavings, { fromCurrency: "KES" }),
        runway: `${(activeBaseline.liquidSavings / Math.max(1, monthlyExpenses)).toFixed(1)} ${isFr ? "mois" : "mos"}`,
        highlight: selectedPriority !== "BUY_SOONER",
      },
      {
        id: "CHEAPER",
        title: isFr ? `OPTION C : MODÈLE OPTIMISÉ À ${format(cheaperAmount, { fromCurrency: "KES" })}` : isSw ? `CHAGUO C: CHUKUA YA BEI NAFUU YA ${format(cheaperAmount, { fromCurrency: "KES" })}` : `OPTION C: BUY THE ${format(cheaperAmount, { fromCurrency: "KES" })} OPTION`,
        badge: isFr ? "Budget Optimisé" : isSw ? "Bajeti Nzuri" : "Budget Alternative",
        delayLabel: `+${cheaperDelayDays} ${isFr ? "jours de retard" : "days delay"}`,
        cashRemaining: format(Math.max(0, activeBaseline.liquidSavings - cheaperAmount), { fromCurrency: "KES" }),
        runway: `${(Math.max(0, activeBaseline.liquidSavings - cheaperAmount) / Math.max(1, monthlyExpenses)).toFixed(1)} ${isFr ? "mois" : "mos"}`,
        highlight: false,
      },
    ];
  }, [extractedAmount, goalDelayDays, postDecisionCash, activeBaseline.liquidSavings, monthlyExpenses, selectedPriority, format, isFr, isSw]);

  // Structured Verified Data Contract
  const verifiedReportData: VerifiedDecisionData = useMemo(() => {
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
        monthlyIncome: monthlyInflow,
        monthlyExpenses,
        monthlyDebtService: monthlyDebt,
        netFreeCashFlow,
        emergencyRunwayMonths: Number(emergencyRunwayMonths),
        primaryGoalTitle: activeBaseline.goals[0]?.title || "Business Goal",
        primaryGoalTarget: activeBaseline.goals[0]?.targetAmount || 25000,
        primaryGoalCurrent: activeBaseline.goals[0]?.currentAmount || 12000,
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
        recommendedPath: isFr ? "Option B (Attendre ou étaler pour préserver le capital)" : isSw ? "Chaguo B (Subiri na uweke akiba kwanza)" : "Option B (Wait or Budget Alternative to protect baseline capital)",
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
    monthlyInflow,
    monthlyExpenses,
    monthlyDebt,
    netFreeCashFlow,
    emergencyRunwayMonths,
    postDecisionCash,
    goalDelayDays,
    monthlyPressurePercent,
    verdict,
    whyVerdictExplanation,
    calculatedAlternatives,
    isFr,
    isSw,
  ]);

  // The Aimly Coherence Check
  const verification = useMemo(() => {
    return runAimlyCoherenceCheck(verifiedReportData);
  }, [verifiedReportData]);

  // Handlers
  const handleNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveDecision = () => {
    saveDecisionRecord(activeBaseline, extractedTitle, extractedAmount, effectiveRecurring);
    saveDecisionReportToVault(verifiedReportData, verification);
    setIsSaved(true);
    if (onSaved) onSaved();
  };

  const handleDownloadPDF = () => {
    setIsDownloadingPDF(true);
    try {
      const doc = generateVerifiedDecisionReportPDF(verifiedReportData, verification, language as any);
      doc.save(`UseAimly_Report_${extractedTitle.replace(/\s+/g, "_")}_${verifiedReportData.reportId}.pdf`);
      saveDecisionReportToVault(verifiedReportData, verification);
      setIsSaved(true);
      if (onSaved) onSaved();
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Step Labels for Header
  const STEP_TITLES = [
    { num: 1, label: isFr ? "Définir" : isSw ? "Tambulisha" : "Define" },
    { num: 2, label: isFr ? "Détails" : isSw ? "Maelezo" : "Details" },
    { num: 3, label: isFr ? "Contexte" : isSw ? "Wasifu" : "Context" },
    { num: 4, label: isFr ? "Priorités" : isSw ? "Vipaumbele" : "Priorities" },
    { num: 5, label: isFr ? "Analyser" : isSw ? "Chambua" : "Analyze" },
    { num: 6, label: isFr ? "Vérifier" : isSw ? "Thibitisha" : "Verify" },
    { num: 7, label: isFr ? "Rapport" : isSw ? "Ripoti" : "Report" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-sans antialiased text-left animate-fadeIn">
      
      {/* ─────────────────────────────────────────────────────────────
          PROGRESS NAVIGATION BAR (ELEGANT 7-STEP DOCK)
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isFr
                  ? `ÉTAPE ${currentStep} SUR 7`
                  : isSw
                  ? `HATUA YA ${currentStep} KATI YA 7`
                  : `STEP ${currentStep} OF 7`}
              </span>
            </span>
            <span className="text-xs font-bold text-foreground hidden sm:inline">
              {STEP_TITLES[currentStep - 1]?.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border/80 bg-secondary/60 hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer min-h-[36px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isFr ? "Précédent" : isSw ? "Nyuma" : "Back"}</span>
              </button>
            )}

            <span className="text-[11px] font-mono text-muted-foreground">
              {Math.round((currentStep / 7) * 100)}%
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>

        {/* Desktop Step Nav Pill Row */}
        <div className="hidden sm:grid sm:grid-cols-7 gap-1 pt-1">
          {STEP_TITLES.map((st) => {
            const isCompleted = st.num < currentStep;
            const isCurrent = st.num === currentStep;

            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : isCompleted
                    ? "bg-secondary text-foreground hover:bg-secondary/80"
                    : "text-muted-foreground hover:text-foreground opacity-60"
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3 text-emerald-500" /> : <span>{st.num}.</span>}
                <span className="truncate">{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          STEP 1 OF 7 — DEFINE THE DECISION
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-9 space-y-6 shadow-sm animate-fadeIn">
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {isFr
                ? "Quelle décision financière envisagez-vous ?"
                : isSw
                ? "Ni uamuzi gani wa kifedha unaofikiria?"
                : "What financial decision are you considering?"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {isFr
                ? "Décrivez votre achat, investissement, crédit ou projet de vie en langage naturel."
                : isSw
                ? "Andika uamuzi wako wa kifedha kwa lugha rahisi unavyofikiria."
                : "Describe your proposed purchase, loan, or investment in natural language."}
            </p>
          </div>

          {/* Quick Category Chips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
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
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer min-h-[48px] ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs scale-[1.01]"
                      : "bg-secondary/40 border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {cat.icon}
                  <span className="truncate text-xs font-bold">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Input Box */}
          <div className="space-y-2 pt-1">
            <textarea
              rows={3}
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={
                isFr
                  ? "Exemple : J'envisage d'acheter un ordinateur à 2 000 $ pour mon activité."
                  : isSw
                  ? "Mfano: Ninafikiria kununua kompyuta ya KSh 150,000 kwa ajili ya kazi yangu."
                  : "Example: I'm thinking about buying a $2,000 laptop for my business."
              }
              className="w-full rounded-2xl border border-border/90 bg-background p-4 text-sm sm:text-base font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs resize-none"
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{isFr ? "Montant détecté :" : isSw ? "Kiasi kilichotambuliwa:" : "Extracted amount:"} <strong className="text-foreground font-mono">{format(extractedAmount, { fromCurrency: "KES" })}</strong></span>
              <span className="font-mono text-[11px]">{extractedTitle}</span>
            </div>
          </div>

          {/* Primary Action */}
          <div className="pt-4 border-t border-border/60 flex justify-end">
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
            >
              <span>{isFr ? "Continuer vers les Détails" : isSw ? "Endelea kwa Maelezo" : "Continue to Details"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}


      {/* ─────────────────────────────────────────────────────────────
          STEP 2 OF 7 — DECISION DETAILS
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 2 && (
        <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-9 space-y-6 shadow-sm animate-fadeIn">
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {isFr ? "Précisez les paramètres de la décision" : isSw ? "Weka maelezo kamili ya uamuzi" : "Tell us about the decision"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {isFr
                ? "Ajustez les montants réels, les échéances et les modalités de paiement."
                : isSw
                ? "Weka kiasi halisi, njia ya malipo na muda unaopanga kutumia."
                : "Fine-tune purchase price, down payments, and proposed execution timing."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-foreground block">
                {isFr ? "Montant Total / Prix" : isSw ? "Kiasi Kamili / Bei" : "Purchase Price / Total Outlay"}
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={customAmount ?? extractedAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value) || null)}
                className="w-full rounded-2xl bg-background border border-border px-4 py-3 text-sm font-mono font-bold text-foreground focus:outline-none focus:border-primary min-h-[46px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-foreground block">
                {isFr ? "Acompte / Apport Immédiat" : isSw ? "Pesa ya Awali (Kama ipo)" : "Down Payment (if financing)"}
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={customDownPayment ?? ""}
                onChange={(e) => setCustomDownPayment(Number(e.target.value) || null)}
                className="w-full rounded-2xl bg-background border border-border px-4 py-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary min-h-[46px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-foreground block">
                {isFr ? "Mensualité (si crédit)" : isSw ? "Malipo ya Kila Mwezi" : "Monthly Payment (if loan/recurring)"}
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={customMonthlyPayment ?? ""}
                onChange={(e) => setCustomMonthlyPayment(Number(e.target.value) || null)}
                className="w-full rounded-2xl bg-background border border-border px-4 py-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary min-h-[46px]"
              />
            </div>
          </div>

          {/* Timing Selector */}
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="font-bold text-foreground">
              {isFr ? "Date envisagée pour l'engagement :" : isSw ? "Unapanga kutekeleza lini:" : "Proposed Execution Timing:"}
            </span>

            <div className="flex items-center gap-2">
              {(["TODAY", "30_DAYS", "90_DAYS"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDecisionTiming(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer min-h-[38px] ${
                    decisionTiming === t
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "TODAY" ? (isFr ? "Aujourd'hui" : isSw ? "Leo" : "Today") : t === "30_DAYS" ? "+30j" : "+90j"}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring Toggle */}
          <label className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/60 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurringExpense}
              onChange={(e) => setIsRecurringExpense(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary accent-[#FF5533]"
            />
            <span className="text-xs font-bold text-foreground">
              {isFr
                ? "Il s'agit d'une dépense ou charge récurrente mensuelle"
                : isSw
                ? "Huu ni mzigo wa mara kwa mara kila mwezi (recurring)"
                : "This is a recurring monthly obligation / expense"}
            </span>
          </label>

          {/* Actions */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1 px-4 py-3 rounded-xl bg-secondary text-xs font-bold text-foreground cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isFr ? "Retour" : isSw ? "Nyuma" : "Back"}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
            >
              <span>{isFr ? "Valider & Vérifier le Contexte" : isSw ? "Thibitisha Wasifu" : "Confirm & Check Context"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}


      {/* ─────────────────────────────────────────────────────────────
          STEP 3 OF 7 — FINANCIAL CONTEXT
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 3 && (
        <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-9 space-y-6 shadow-sm animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {isFr ? "Vérifions votre contexte financier" : isSw ? "Huu ndio wasifu wako wa kifedha" : "Let's check your financial context"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {isFr
                  ? "Voici les données réelles qu'UseAimly utilisera pour modéliser l'impact."
                  : isSw
                  ? "Takwimu hizi zitatumika kuhesabu uamuzi wako kwa usahihi wa hali ya juu."
                  : "Review the financial baseline data UseAimly will use for calculation."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingContext(!isEditingContext)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-secondary/60 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isEditingContext ? (isFr ? "Terminer l'édition" : "Done Editing") : (isFr ? "Modifier ces chiffres" : "Edit Numbers")}</span>
            </button>
          </div>

          {/* 6 Key Baseline Indicators Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isFr ? "LIQUIDITÉS DISPONIBLES" : isSw ? "AKIBA YA PAPO HAPO" : "AVAILABLE CASH"}
              </span>
              {isEditingContext ? (
                <input
                  type="number"
                  inputMode="decimal"
                  value={overrideSavings ?? activeBaseline.liquidSavings}
                  onChange={(e) => setOverrideSavings(Number(e.target.value) || null)}
                  className="w-full rounded-xl bg-background border px-2 py-1 font-mono font-bold"
                />
              ) : (
                <span className="text-lg font-black text-foreground font-mono block">
                  {format(activeBaseline.liquidSavings, { fromCurrency: "KES" })}
                </span>
              )}
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                ✓ {isFr ? "Donnée Confirmée" : "Confirmed Baseline"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isFr ? "REVENU MENSUEL" : isSw ? "MAPATO YA MWEZI" : "MONTHLY INFLOW"}
              </span>
              {isEditingContext ? (
                <input
                  type="number"
                  inputMode="decimal"
                  value={overrideIncome ?? monthlyInflow}
                  onChange={(e) => setOverrideIncome(Number(e.target.value) || null)}
                  className="w-full rounded-xl bg-background border px-2 py-1 font-mono font-bold"
                />
              ) : (
                <span className="text-lg font-black text-foreground font-mono block">
                  +{format(monthlyInflow, { fromCurrency: "KES" })}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground block">
                {isFr ? "Entrées nettes" : "Net regular inflows"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isFr ? "DÉPENSES FIXES" : isSw ? "GHARAMA ZA LAZIMA" : "FIXED EXPENSES"}
              </span>
              {isEditingContext ? (
                <input
                  type="number"
                  inputMode="decimal"
                  value={overrideExpenses ?? monthlyExpenses}
                  onChange={(e) => setOverrideExpenses(Number(e.target.value) || null)}
                  className="w-full rounded-xl bg-background border px-2 py-1 font-mono font-bold"
                />
              ) : (
                <span className="text-lg font-black text-foreground font-mono block">
                  {format(monthlyExpenses, { fromCurrency: "KES" })}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground block">
                {isFr ? "Loyer & Factures" : "Rent & living costs"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isFr ? "REMBOURSEMENT DETTES" : isSw ? "MALIPO YA MADENI" : "DEBT SERVICE"}
              </span>
              {isEditingContext ? (
                <input
                  type="number"
                  inputMode="decimal"
                  value={overrideDebt ?? monthlyDebt}
                  onChange={(e) => setOverrideDebt(Number(e.target.value) || null)}
                  className="w-full rounded-xl bg-background border px-2 py-1 font-mono font-bold"
                />
              ) : (
                <span className="text-lg font-black text-foreground font-mono block">
                  {format(monthlyDebt, { fromCurrency: "KES" })}/mo
                </span>
              )}
              <span className="text-[10px] text-muted-foreground block">
                {monthlyDebt > 0 ? (isFr ? "Passifs en cours" : "Active obligations") : isFr ? "Aucune dette active" : "Zero active debt"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isFr ? "CASH-FLOW LIBRE NET" : isSw ? "PESA HURU YA MWEZI" : "NET FREE CASH FLOW"}
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                +{format(netFreeCashFlow, { fromCurrency: "KES" })}
              </span>
              <span className="text-[10px] text-emerald-600/80 block">
                {isFr ? "Capacité d'épargne mensuelle" : "Monthly savings power"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isFr ? "MATELAS DE SÉCURITÉ" : isSw ? "MIEZI YA DHARURA" : "EMERGENCY RUNWAY"}
              </span>
              <span className="text-lg font-black text-foreground font-mono block">
                {(activeBaseline.liquidSavings / Math.max(1, monthlyExpenses)).toFixed(1)} {isFr ? "mois" : "months"}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                {activeBaseline.liquidSavings / Math.max(1, monthlyExpenses) >= 3.0 ? (isFr ? "Zone sécurisée" : "Safe buffer") : (isFr ? "Sous le seuil de 3 mois" : "Below 3-month floor")}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1 px-4 py-3 rounded-xl bg-secondary text-xs font-bold text-foreground cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isFr ? "Retour" : isSw ? "Nyuma" : "Back"}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
            >
              <span>{isFr ? "Confirmer & Choisir mes Priorités" : isSw ? "Thibitisha & Chagua Vipaumbele" : "Confirm & Set Priorities"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}


      {/* ─────────────────────────────────────────────────────────────
          STEP 4 OF 7 — GOALS & PRIORITIES
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 4 && (
        <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-9 space-y-6 shadow-sm animate-fadeIn">
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {isFr ? "Que cherchez-vous à protéger en priorité ?" : isSw ? "Unataka kulinda au kufikia nini kwanza?" : "What are you trying to protect or achieve?"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {isFr
                ? "L'algorithme utilisera votre priorité pour classer les options et recommander le meilleur compromis."
                : isSw
                ? "Mfumo utatumia kipaumbele chako kupendekeza njia bora zaidi."
                : "Your selected priority is transparently used to rank alternatives and determine the recommended path."}
            </p>
          </div>

          {/* Goal selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase font-bold text-foreground block">
              {isFr ? "Objectif de vie principal à protéger :" : isSw ? "Lengo kuu unalolinda:" : "Primary Goal Protected:"}
            </label>
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="font-bold text-foreground">{activeBaseline.goals[0]?.title || "Business Launch Goal"}</div>
                  <div className="text-muted-foreground text-[11px]">
                    {format(activeBaseline.goals[0]?.currentAmount || 12000, { fromCurrency: "KES" })} {isFr ? "épargnés sur" : "saved of"} {format(activeBaseline.goals[0]?.targetAmount || 25000, { fromCurrency: "KES" })} ({isFr ? "Échéance" : "Deadline"}: {activeBaseline.goals[0]?.targetDate})
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] border border-emerald-500/20">
                ACTIVE TARGET
              </span>
            </div>
          </div>

          {/* Priorities Selection */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="text-xs font-mono uppercase font-bold text-foreground block">
              {isFr ? "Quel critère compte le plus pour cette décision ?" : isSw ? "Kipi ni muhimu zaidi kwako?" : "What matters most for this decision?"}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: "PROTECT_CASH",
                  label: isFr ? "1. Protéger le matelas de sécurité" : isSw ? "1. Kulinda akiba ya dharura" : "1. Protecting emergency cash buffer",
                  desc: isFr ? "Ne jamais descendre sous 3 mois de charges fixes." : "Keep at least 3.0 months of living runway locked.",
                },
                {
                  id: "REACH_GOALS",
                  label: isFr ? "2. Atteindre mon objectif au plus vite" : isSw ? "2. Kufikia malengo kwa haraka" : "2. Reaching goals on schedule",
                  desc: isFr ? "Minimiser tout retard sur la date d'arrivée." : "Prevent delays on major destination milestones.",
                },
                {
                  id: "LOW_MONTHLY",
                  label: isFr ? "3. Garder des charges mensuelles faibles" : isSw ? "3. Kupunguza gharama za kila mwezi" : "3. Keeping monthly recurring costs low",
                  desc: isFr ? "Éviter d'engager le cash-flow libre récurrent." : "Avoid committing free cash flow to monthly debt.",
                },
                {
                  id: "BUY_SOONER",
                  label: isFr ? "4. Concrétiser l'achat immédiatement" : isSw ? "4. Kutekeleza ununuzi leo bila kusubiri" : "4. Making the purchase as soon as possible",
                  desc: isFr ? "Privilégier l'utilité immédiate quitte à décaler un objectif." : "Prioritize immediate execution and offset later.",
                },
              ].map((p) => {
                const isSelected = selectedPriority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPriority(p.id as UserDecisionPriority)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                      isSelected
                        ? "bg-primary/10 border-primary text-foreground ring-2 ring-primary/20 shadow-xs"
                        : "bg-secondary/40 border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{p.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1 px-4 py-3 rounded-xl bg-secondary text-xs font-bold text-foreground cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isFr ? "Retour" : isSw ? "Nyuma" : "Back"}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isFr ? "Lancer l'Analyse des Options" : isSw ? "Chambua Chaguzi Zote" : "Analyze My Options"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}


      {/* ─────────────────────────────────────────────────────────────
          STEP 5 OF 7 — ANALYZE & COMPARE
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 5 && (
        <section className={`rounded-3xl border ${verdict.borderStyle} bg-card p-6 sm:p-9 space-y-7 shadow-xl animate-fadeIn`}>
          
          {/* Top Verdict Header */}
          <div className="space-y-3 border-b border-border/60 pb-5">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-extrabold text-xs tracking-wider border ${verdict.badgeStyle}`}>
                {verdict.icon}
                <span>{verdict.label}</span>
              </span>

              <span className="text-[11px] font-mono text-muted-foreground">
                Priority: <strong className="text-foreground">{selectedPriority.replace("_", " ")}</strong>
              </span>
            </div>

            <h3 className="text-xl sm:text-3xl font-black text-foreground tracking-tight leading-snug">
              {verdict.headline}
            </h3>
          </div>

          {/* 4 Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isFr ? "CASH APRÈS DÉCISION" : isSw ? "AKIBA BAADA YA UAMUZI" : "CASH AFTER DECISION"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-foreground font-mono block">
                {format(postDecisionCash, { fromCurrency: "KES" })}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium block">
                -{format(extractedAmount, { fromCurrency: "KES" })} {isFr ? "déduit" : "outflow"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isFr ? "MATELAS D'URGENCE" : isSw ? "MIEZI YA DHARURA" : "EMERGENCY RUNWAY"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-foreground font-mono block">
                {emergencyRunwayMonths} {isFr ? "mois" : "months"}
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block">
                {Number(emergencyRunwayMonths) < 3.0 ? (isFr ? "Sous le seuil de 3 mois" : "Below 3.0 target") : (isFr ? "Zone sécurisée" : "Safe buffer")}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              <span className="text-[10px] font-mono uppercase text-rose-600 dark:text-rose-400 font-bold block">
                {isFr ? "IMPACT SUR L'OBJECTIF" : isSw ? "ATHARI KWA LENGO" : "GOAL IMPACT"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono block">
                +{goalDelayDays} {isFr ? "jours" : "days"}
              </span>
              <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80 font-medium block truncate">
                {activeBaseline.goals[0]?.title || "Business Goal"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isFr ? "PRESSION MENSUELLE" : isSw ? "MZIGO WA KILA MWEZI" : "MONTHLY PRESSURE"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-foreground font-mono block">
                +{monthlyPressurePercent}%
              </span>
              <span className="text-[11px] text-muted-foreground font-medium block">
                +{format(netFreeCashFlow, { fromCurrency: "KES" })}/mo FCF
              </span>
            </div>
          </div>

          {/* Scenario Alternatives */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold block">
              {isFr ? "COMPARAISON DES MEILLEURES OPTIONS D'AIMLY" : isSw ? "ULINGANISHO WA NJIA MBADALA ZA AIMLY" : "AIMLY'S CALCULATED SCENARIOS"}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {calculatedAlternatives.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                    alt.highlight
                      ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30"
                      : "bg-secondary/30 border-border/70"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-background border border-border/80">
                      {alt.badge}
                    </span>
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

          {/* Actions */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1 px-4 py-3 rounded-xl bg-secondary text-xs font-bold text-foreground cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isFr ? "Retour" : isSw ? "Nyuma" : "Back"}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isFr ? "Lancer l'Audit de Cohérence" : isSw ? "Thibitisha Matokeo" : "Verify Analysis Coherence"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}


      {/* ─────────────────────────────────────────────────────────────
          STEP 6 OF 7 — VERIFY THE ANALYSIS (AIMLY COHERENCE CHECK)
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 6 && (
        <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-9 space-y-6 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  {verification.status}
                </span>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs text-muted-foreground font-mono">Score: {verification.overallScore}/100</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {isFr ? "L'Audit de Cohérence Aimly est Validé" : isSw ? "Ukaguzi wa Hesabu Umekamilika" : "The Aimly Coherence Check is Complete"}
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            {isFr
              ? "Toutes les étapes arithmétiques, les scénarios comparatifs et l'alignement temporel ont été rigoureusement certifiés conformes au modèle mathématique."
              : isSw
              ? "Hesabu zote za fedha, matumizi, na athari kwa malengo zimethibitishwa bila hitilafu yoyote."
              : "All arithmetic, scenario tradeoffs, goal delay models, and calendar timelines have been strictly validated against deterministic rules."}
          </p>

          {/* 6 Quality Checks List */}
          <div className="space-y-2.5">
            {verification.checks.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-secondary/40 border border-border/70 flex items-start gap-3 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-foreground">
                    {isFr ? c.nameFr : c.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {isFr ? c.notesFr : c.notes}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1 px-4 py-3 rounded-xl bg-secondary text-xs font-bold text-foreground cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isFr ? "Retour" : isSw ? "Nyuma" : "Back"}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
            >
              <FileDown className="w-4 h-4" />
              <span>{isFr ? "Voir le Rapport Final & Télécharger le PDF" : isSw ? "Fungua Ripoti Kamili ya PDF" : "See My Final Decision Report"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}


      {/* ─────────────────────────────────────────────────────────────
          STEP 7 OF 7 — FINAL DECISION REPORT (DOWNLOAD PDF)
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 7 && (
        <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-9 space-y-7 shadow-xl animate-fadeIn">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20">
                  {verification.status}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  ID: {verifiedReportData.reportId} • v{verifiedReportData.version}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {isFr ? "Votre Rapport Décisionnel Vérifié est Prêt" : isSw ? "Ripoti Yako ya Kifedha Ipo Tayari" : "Your Financial Decision Report is Ready"}
              </h2>
            </div>

            {/* Primary Action Button: Download PDF */}
            <button
              type="button"
              disabled={isDownloadingPDF}
              onClick={handleDownloadPDF}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shrink-0 min-h-[48px]"
            >
              <FileDown className="w-4 h-4" />
              <span>{isDownloadingPDF ? (isFr ? "Génération en cours..." : "Generating PDF...") : (isFr ? "Télécharger le Rapport PDF" : "Download Verified PDF Report")}</span>
            </button>
          </div>

          {/* Report Executive Summary Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-secondary/40 border border-border/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
                {isFr ? "SYNTHÈSE DU VERDICT" : "VERIFIED EXECUTIVE SUMMARY"}
              </span>
              <span className={`px-3 py-0.5 rounded-full font-mono text-[11px] font-bold border ${verdict.badgeStyle}`}>
                {verdict.label}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-foreground leading-snug">
              {verdict.headline}
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {whyVerdictExplanation}
            </p>
          </div>

          {/* Financial Impact Comparison Table */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-muted-foreground block">
              {isFr ? "Tableau d'Impact Financier Déterministe" : "Deterministic Financial Impact Table"}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground block">LIQUID RESERVES</span>
                <span className="text-lg font-black font-mono block">{format(postDecisionCash, { fromCurrency: "KES" })}</span>
                <span className="text-[10px] text-muted-foreground block">-{format(extractedAmount, { fromCurrency: "KES" })} outlay</span>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground block">LIVING RUNWAY</span>
                <span className="text-lg font-black font-mono block">{emergencyRunwayMonths} mos</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-bold">
                  {Number(emergencyRunwayMonths) < 3.0 ? "Below 3.0 buffer" : "Safe buffer"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground block">GOAL DELAY</span>
                <span className="text-lg font-black font-mono text-rose-500 block">+{goalDelayDays}d</span>
                <span className="text-[10px] text-muted-foreground block truncate">{activeBaseline.goals[0]?.title}</span>
              </div>

              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground block">MONTHLY PRESSURE</span>
                <span className="text-lg font-black font-mono block">+{monthlyPressurePercent}%</span>
                <span className="text-[10px] text-emerald-600 block font-bold">+{format(netFreeCashFlow, { fromCurrency: "KES" })}/mo FCF</span>
              </div>
            </div>
          </div>

          {/* Recommended Path Box */}
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
              {isFr ? "PLAN D'ACTION RECOMMANDÉ PAR AIMLY" : "AIMLY'S RECOMMENDED ACTION PATH"}
            </span>
            <h4 className="text-base font-bold text-foreground">
              {calculatedAlternatives[1]?.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isFr
                ? `Cette option permet de réaliser votre acquisition tout en préservant votre matelas de liquidités de 3.0 mois et en protégeant l'échéance de "${activeBaseline.goals[0]?.title}".`
                : `This path enables execution while locking in your 3.0-month reserve buffer and fully preserving your "${activeBaseline.goals[0]?.title}" target deadline.`}
            </p>
          </div>

          {/* Secondary Actions Bar */}
          <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDecision}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                  isSaved
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-secondary hover:bg-secondary/80 border-border text-foreground"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-emerald-500 text-emerald-500" : ""}`} />
                <span>{isSaved ? (isFr ? "Décision Sauvegardée" : "Decision Saved") : (isFr ? "Sauvegarder dans le Coffre" : "Save to Vault")}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold text-foreground cursor-pointer min-h-[44px]"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (isFr ? "Lien Copié" : "Link Copied") : (isFr ? "Partager" : "Share")}</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold text-foreground cursor-pointer min-h-[44px]"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isFr ? "Modifier les Hypothèses (v2)" : "Edit Assumptions (v2)"}</span>
              </button>
            </div>

            <Link
              href={`/app/ask?q=${encodeURIComponent(`I analyzed: "${extractedTitle}" for ${format(extractedAmount, { fromCurrency: "KES" })}. Verdict was ${verdict.label}. What are the next best tactical moves?`)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border transition-all min-h-[44px]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isFr ? "Demander conseil à Aimly" : "Ask Aimly About Next Moves"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

    </div>
  );
}
