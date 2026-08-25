"use client";

import React, { useState, useMemo } from "react";
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
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Share2,
  Bookmark,
  MessageSquare,
  Check,
  FileDown,
  Target,
} from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { parseDecisionQuery } from "@/lib/nlp/decision-query-parser";
import { BaselineFinancialProfile, saveDecisionRecord } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils/currency";
import {
  VerifiedDecisionData,
  runAimlyCoherenceCheck,
} from "@/lib/decision-engine/decision-validator";
import {
  evaluateCanonicalDecision,
  DecisionInputParameters,
} from "@/lib/decision-engine/canonical-decision-engine";
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
  const { currency } = useCurrency();
  const { language } = useI18n();
  const isFr = language === "fr";
  const isEs = language === "es";

  const fmt = (amt: number) => formatCurrency(amt, currency as any);

  // Active Journey Step: 1 to 7
  const [currentStep, setCurrentStep] = useState<number>(initialStep);

  // STEP 1: Decision Intake
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<DecisionCategory>(initialCategory);

  // STEP 2: Decision Details
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [customDownPayment, setCustomDownPayment] = useState<number | null>(null);
  const [customMonthlyPayment, setCustomMonthlyPayment] = useState<number | null>(null);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(36);
  const [interestRatePercent, setInterestRatePercent] = useState<number>(8.5);
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

  // STEP 7: UI & Report states
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
          title: isEs ? "Lanzamiento de Negocio y Proyectos" : isFr ? "Lancement Entreprise & Projets" : "Business Launch Goal",
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
      debts: overrideDebt !== null
        ? [{ id: "debt-ovr", name: "Existing Debt", totalAmount: overrideDebt * 24, monthlyPayment: overrideDebt, interestRate: 0.1, category: "OTHER" as any, isSecured: false }]
        : base.debts,
    };
  }, [baselineProfile, overrideSavings, overrideIncome, overrideExpenses, overrideDebt, isFr, isEs]);

  // Categories definitions (Mobile-friendly, no truncation)
  const CATEGORIES: { id: DecisionCategory; title: string; subtitle: string; icon: React.ReactNode; defaultPrompt: string }[] = useMemo(
    () => [
      {
        id: "BUY_SOMETHING",
        title: isEs ? "Comprar Algo" : isFr ? "Achat Matériel" : "Buy Item / Asset",
        subtitle: isEs ? "Portátil, equipo, material..." : isFr ? "Ordinateur, équipement..." : "Laptop, tools, gear...",
        icon: <ShoppingBag className="w-4 h-4 text-orange-500" />,
        defaultPrompt: isEs ? "Estoy pensando en comprar un portátil de $2,000 para mi negocio." : isFr ? "J'envisage d'acheter un ordinateur à 2 000 € pour mon activité." : "I'm thinking about buying a $2,000 laptop for my business.",
      },
      {
        id: "TAKE_A_LOAN",
        title: isEs ? "Solicitar Préstamo" : isFr ? "Crédit & Prêt" : "Take a Loan",
        subtitle: isEs ? "Financiación, préstamo..." : isFr ? "Financement, emprunt..." : "Borrowing, debt facility...",
        icon: <CreditCard className="w-4 h-4 text-purple-500" />,
        defaultPrompt: isEs ? "¿Qué ocurre si solicito un préstamo de $10,000 con $1,000 de entrada?" : isFr ? "Que se passe-t-il si je souscris un prêt de 10 000 € avec 1 000 € d'apport ?" : "What happens if I take a $10,000 loan with $1,000 down payment?",
      },
      {
        id: "BUY_A_CAR",
        title: isEs ? "Comprar Vehículo" : isFr ? "Véhicule / Auto" : "Vehicle Purchase",
        subtitle: isEs ? "Coche, moto, transporte..." : isFr ? "Voiture, moto..." : "Car, transport...",
        icon: <Car className="w-4 h-4 text-blue-500" />,
        defaultPrompt: isEs ? "¿Puedo comprar un coche de $15,000 con $3,000 de entrada?" : isFr ? "Puis-je acheter une voiture à 15 000 € avec 3 000 € d'apport ?" : "Can I buy a $15,000 car with $3,000 down payment?",
      },
      {
        id: "MOVE_HOME",
        title: isEs ? "Vivienda y Alquiler" : isFr ? "Logement & Loyer" : "Housing & Rent",
        subtitle: isEs ? "Cambio de alquiler, mudanza..." : isFr ? "Changement loyer, bail..." : "Rent adjustment, relocation...",
        icon: <Home className="w-4 h-4 text-emerald-500" />,
        defaultPrompt: isEs ? "¿Qué pasa si mi alquiler aumenta en $1,800/mes?" : isFr ? "Que se passe-t-il si mon loyer augmente de 1 800 €/mois ?" : "What happens if my rent increases by $1,800/month?",
      },
      {
        id: "INVEST",
        title: isEs ? "Invertir Capital" : isFr ? "Investissement" : "Invest Capital",
        subtitle: isEs ? "Bolsa, fondos, inmuebles..." : isFr ? "Bourse, placement..." : "Stocks, real estate...",
        icon: <TrendingUp className="w-4 h-4 text-teal-500" />,
        defaultPrompt: isEs ? "¿Puedo invertir $5,000 en un fondo indexado?" : isFr ? "Puis-je investir 5 000 € dans un fonds indiciel ?" : "Can I invest $5,000 into an index fund?",
      },
      {
        id: "BUSINESS_EXPENSE",
        title: isEs ? "Gasto de Negocio" : isFr ? "Dépense Business" : "Business Project",
        subtitle: isEs ? "Marketing, stock, desarrollo..." : isFr ? "Marketing, stock, dev..." : "Hiring, stock, growth...",
        icon: <Briefcase className="w-4 h-4 text-amber-500" />,
        defaultPrompt: isEs ? "Estoy considerando invertir $3,500 en marketing para mi empresa." : isFr ? "J'envisage de dépenser 3 500 € pour le marketing de mon entreprise." : "I'm considering spending $3,500 on marketing for my business.",
      },
      {
        id: "PAY_OFF_DEBT",
        title: isEs ? "Amortizar Deuda" : isFr ? "Rembourser Dette" : "Pay Off Debt",
        subtitle: isEs ? "Liquidación anticipada..." : isFr ? "Soldage crédit, avance..." : "Lump sum payoff...",
        icon: <Layers className="w-4 h-4 text-rose-500" />,
        defaultPrompt: isEs ? "¿Debería amortizar $4,000 de deuda por adelantado?" : isFr ? "Devrais-je rembourser 4 000 € de dette par anticipation ?" : "Should I pay off $4,000 of debt early?",
      },
      {
        id: "OTHER",
        title: isEs ? "Otra Decisión" : isFr ? "Autre Décision" : "Custom Decision",
        subtitle: isEs ? "Viaje, proyecto personal..." : isFr ? "Voyage, projet perso..." : "Travel, major life event...",
        icon: <HelpCircle className="w-4 h-4 text-gray-400" />,
        defaultPrompt: isEs ? "Estoy considerando un viaje personal de $2,500." : isFr ? "J'envisage un voyage personnel de 2 500 €." : "I'm considering a $2,500 personal trip.",
      },
    ],
    [isFr, isEs]
  );

  // NLP Parser Extraction
  const parsed = useMemo(() => parseDecisionQuery(queryInput), [queryInput]);
  const extractedAmount = customAmount ?? (parsed.amount || 2000);
  const extractedTitle = parsed.title || "Proposed Decision";
  const effectiveRecurring = isRecurringExpense || selectedCategory === "MOVE_HOME" || parsed.isRecurring;

  // CANONICAL DETERMINISTIC EVALUATION
  const canonicalAnalysis = useMemo(() => {
    const inputs: DecisionInputParameters = {
      title: extractedTitle,
      category: selectedCategory,
      totalAmount: extractedAmount,
      downPayment: customDownPayment ?? undefined,
      loanTermMonths: selectedCategory === "TAKE_A_LOAN" ? loanTermMonths : undefined,
      annualInterestRatePercent: selectedCategory === "TAKE_A_LOAN" ? interestRatePercent : undefined,
      customMonthlyPayment: customMonthlyPayment ?? undefined,
      isRecurring: effectiveRecurring,
      currency: currency as any,
      priority: selectedPriority,
    };

    return evaluateCanonicalDecision(activeBaseline, inputs);
  }, [
    activeBaseline,
    extractedTitle,
    selectedCategory,
    extractedAmount,
    customDownPayment,
    loanTermMonths,
    interestRatePercent,
    customMonthlyPayment,
    effectiveRecurring,
    currency,
    selectedPriority,
  ]);

  // Map Canonical to VerifiedDecisionData
  const verifiedReportData: VerifiedDecisionData = useMemo(() => {
    const { baseline, primaryImpact, scenarios, verdict, assumptions, isAssumedLoanTerms } = canonicalAnalysis;

    return {
      decisionId: `dec-${Date.now()}`,
      reportId: `RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
      version: 1,
      decisionTitle: canonicalAnalysis.inputs.title,
      category: canonicalAnalysis.inputs.category,
      transactionType: canonicalAnalysis.transactionType,
      amount: canonicalAnalysis.inputs.totalAmount,
      downPayment: canonicalAnalysis.inputs.downPayment || 0,
      monthlyPayment: primaryImpact.newMonthlyObligation,
      isRecurring: canonicalAnalysis.transactionType === "RECURRING_EXPENSE",
      currency: currency as any,
      timestamp: canonicalAnalysis.timestamp,
      baseline: {
        liquidSavings: baseline.liquidSavings,
        monthlyIncome: baseline.monthlyIncome,
        monthlyExpenses: baseline.monthlyLivingExpenses,
        monthlyDebtService: baseline.monthlyDebtService,
        netFreeCashFlow: baseline.netFreeCashFlow,
        emergencyRunwayMonths: baseline.emergencyRunwayMonths,
        primaryGoalTitle: baseline.primaryGoal.title,
        primaryGoalTarget: baseline.primaryGoal.targetAmount,
        primaryGoalCurrent: baseline.primaryGoal.currentAmount,
        primaryGoalTargetDate: baseline.primaryGoal.targetDate,
        monthlyGoalAllocation: baseline.primaryGoal.monthlyAllocation,
      },
      financing: canonicalAnalysis.financing,
      categorizedAssumptions: canonicalAnalysis.categorizedAssumptions,
      recommendation: canonicalAnalysis.recommendation,
      calculatedImpact: {
        immediateCashOutflow: primaryImpact.immediateCashOutflow,
        postDecisionCash: primaryImpact.postDecisionCash,
        deltaCash: primaryImpact.deltaCash,
        newMonthlyObligation: primaryImpact.newMonthlyObligation,
        postDecisionRunway: primaryImpact.postDecisionRunwayMonths,
        deltaRunway: primaryImpact.deltaRunwayMonths,
        postDecisionFreeCashFlow: primaryImpact.postDecisionFreeCashFlow,
        deltaFreeCashFlow: primaryImpact.deltaFreeCashFlow,
        fcfPercentageShift: primaryImpact.fcfPercentageShift,
        goalDelayDays: primaryImpact.goalDelayDays,
        goalDelayMonths: primaryImpact.goalDelayMonths,
        goalStatus: primaryImpact.goalStatus,
        goalExplanation: primaryImpact.goalExplanation,
        monthlyPressurePercent: primaryImpact.fcfPercentageShift,
        verdict: verdict.decision,
        verdictHeadline: verdict.headline,
        primaryReason: verdict.primaryReason,
      },
      alternatives: {
        optionA: {
          code: "OPTION_A",
          title: scenarios.optionA.title,
          badge: scenarios.optionA.badge,
          delayDays: scenarios.optionA.goalDelayDays,
          cashRemaining: scenarios.optionA.postDecisionCash,
          runway: scenarios.optionA.postDecisionRunwayMonths,
          monthlyObligation: scenarios.optionA.newMonthlyObligation,
          totalInterest: scenarios.optionA.totalInterestPaid,
          totalCost: scenarios.optionA.totalCostOverTime,
          ledger: scenarios.optionA.ledger,
          isRecommended: scenarios.optionA.isRecommended,
        },
        optionB: {
          code: "OPTION_B",
          title: scenarios.optionB.title,
          badge: scenarios.optionB.badge,
          delayDays: scenarios.optionB.goalDelayDays,
          cashRemaining: scenarios.optionB.postDecisionCash,
          runway: scenarios.optionB.postDecisionRunwayMonths,
          monthlyObligation: scenarios.optionB.newMonthlyObligation,
          totalInterest: scenarios.optionB.totalInterestPaid,
          totalCost: scenarios.optionB.totalCostOverTime,
          ledger: scenarios.optionB.ledger,
          isRecommended: scenarios.optionB.isRecommended,
        },
        optionC: {
          code: "OPTION_C",
          title: scenarios.optionC.title,
          badge: scenarios.optionC.badge,
          delayDays: scenarios.optionC.goalDelayDays,
          cashRemaining: scenarios.optionC.postDecisionCash,
          runway: scenarios.optionC.postDecisionRunwayMonths,
          monthlyObligation: scenarios.optionC.newMonthlyObligation,
          totalInterest: scenarios.optionC.totalInterestPaid,
          totalCost: scenarios.optionC.totalCostOverTime,
          ledger: scenarios.optionC.ledger,
          isRecommended: scenarios.optionC.isRecommended,
        },
      },
      narrative: {
        executiveSummary: verdict.headline,
        whyThisVerdict: verdict.primaryReason,
        recommendedPath: canonicalAnalysis.recommendation.actionPlanStep1,
        tradeoffsSummary: "Balanced comparison between immediate execution and emergency buffer preservation.",
      },
      assumptions: canonicalAnalysis.assumptions,
      isAssumedLoanTerms,
    };
  }, [canonicalAnalysis, currency]);

  // Coherence Audit
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
    { num: 1, label: isEs ? "Definir" : isFr ? "Définir" : "Define" },
    { num: 2, label: isEs ? "Detalles" : isFr ? "Détails" : "Details" },
    { num: 3, label: isEs ? "Contexto" : isFr ? "Contexte" : "Context" },
    { num: 4, label: isEs ? "Prioridades" : isFr ? "Priorités" : "Priorities" },
    { num: 5, label: isEs ? "Analizar" : isFr ? "Analyser" : "Analyze" },
    { num: 6, label: isEs ? "Verificar" : isFr ? "Vérifier" : "Verify" },
    { num: 7, label: isEs ? "Informe" : isFr ? "Rapport" : "Report" },
  ];

  const primaryImpact = canonicalAnalysis.primaryImpact;
  const verdict = canonicalAnalysis.verdict;

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto space-y-6 2xl:space-y-8 font-sans antialiased text-left animate-fadeIn">
      
      {/* ─────────────────────────────────────────────────────────────
          PROGRESS NAVIGATION BAR (MOBILE-OPTIMIZED DOCK)
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-3.5 sm:p-5 shadow-xs space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>
                {isEs
                  ? `PASO ${currentStep} / 7`
                  : isFr
                  ? `ÉTAPE ${currentStep} / 7`
                  : `STEP ${currentStep} OF 7`}
              </span>
            </span>
            <span className="text-xs font-bold text-foreground">
              {STEP_TITLES[currentStep - 1]?.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-border/80 bg-secondary/60 hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer min-h-[32px] sm:min-h-[36px]"
              >
                <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{isEs ? "Atrás" : isFr ? "Retour" : "Back"}</span>
              </button>
            )}

            <span className="text-[11px] font-mono text-muted-foreground font-bold">
              {Math.round((currentStep / 7) * 100)}%
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-secondary h-1.5 sm:h-2 rounded-full overflow-hidden flex">
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
          STEP 1 OF 7 — DEFINE THE DECISION (MOBILE-FIRST CATEGORIES)
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <section className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-xs animate-fadeIn">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-2xl font-black text-foreground tracking-tight">
              {isEs
                ? "¿Qué decisión financiera está considerando?"
                : isFr
                ? "Quelle décision financière envisagez-vous ?"
                : "What financial decision are you considering?"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {isEs
                ? "Elija una categoría rápida o escriba libremente en lenguaje natural."
                : isFr
                ? "Choisissez une catégorie rapide ou écrivez librement en langage naturel."
                : "Choose a category below or type your proposed plan in plain English."}
            </p>
          </div>

          {/* Touch-Friendly Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1">
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
                  className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer min-h-[64px] sm:min-h-[72px] ${
                    isSelected
                      ? "bg-primary/10 border-primary text-foreground ring-2 ring-primary/20 shadow-xs scale-[1.01]"
                      : "bg-secondary/40 border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="p-1.5 rounded-xl bg-background/80 border border-border/60">
                      {cat.icon}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-foreground leading-tight">{cat.title}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{cat.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Input Box (16px base font to prevent mobile iOS zoom) */}
          <div className="space-y-2 pt-1">
            <textarea
              rows={3}
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={isEs ? "Ejemplo: Estoy pensando en comprar un portátil de $2,000 para mi negocio." : isFr ? "Exemple: J'envisage d'acheter un ordinateur à 2 000 € pour mon activité." : "Example: I'm thinking about buying a $2,000 laptop for my business."}
              className="w-full rounded-2xl border border-border/90 bg-background p-3.5 sm:p-4 text-base sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs resize-none"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-muted-foreground">
              <span>{isEs ? "Monto detectado:" : isFr ? "Montant détecté :" : "Extracted amount:"} <strong className="text-foreground font-mono">{fmt(extractedAmount)}</strong></span>
              <span className="font-mono text-[11px] truncate">{extractedTitle}</span>
            </div>
          </div>

          {/* Primary Action */}
          <div className="pt-3 sm:pt-4 border-t border-border/60 flex justify-end">
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
            >
              <span>{isEs ? "Continuar hacia los Detalles" : isFr ? "Continuer vers les Détails" : "Continue to Details"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}


      {/* ─────────────────────────────────────────────────────────────
          STEP 2 OF 7 — DECISION DETAILS (CONDITIONAL & LOAN-AWARE)
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 2 && (
        <section className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-xs animate-fadeIn">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-2xl font-black text-foreground tracking-tight">
              {isEs ? "Especifique los parámetros de la decisión" : isFr ? "Précisez les paramètres de la décision" : "Tell us about the decision"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {selectedCategory === "TAKE_A_LOAN"
                ? isEs
                  ? "Indique el capital solicitado, la entrada inicial y el plazo de devolución."
                  : isFr
                  ? "Indiquez le capital emprunté, l'apport initial et la durée du prêt."
                  : "Specify the borrowed amount, down payment/fees, and loan duration."
                : isEs
                ? "Ajuste el importe total, el pago inicial y los plazos previstos."
                : isFr
                ? "Ajustez le prix total, l'acompte et les modalités de paiement."
                : "Fine-tune total outlay, down payments, and proposed execution timing."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-foreground block">
                {selectedCategory === "TAKE_A_LOAN"
                  ? isEs ? "Capital Solicitado / Total Préstamo" : isFr ? "Capital Emprunté" : "Borrowed Amount / Loan Total"
                  : isEs ? "Precio de Compra / Importe Total" : isFr ? "Prix d'Achat Total" : "Purchase Price / Total Outlay"}
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={customAmount ?? extractedAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value) || null)}
                className="w-full rounded-2xl bg-background border border-border px-4 py-3 text-base sm:text-sm font-mono font-bold text-foreground focus:outline-none focus:border-primary min-h-[46px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-foreground block">
                {selectedCategory === "TAKE_A_LOAN"
                  ? isEs ? "Entrada Inicial / Comisiones" : isFr ? "Frais Initiaux / Apport" : "Down Payment / Upfront Fees"
                  : isEs ? "Entrada / Pago Inmediato" : isFr ? "Acompte / Apport Immédiat" : "Down Payment (if financing)"}
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={customDownPayment ?? ""}
                onChange={(e) => setCustomDownPayment(Number(e.target.value) || null)}
                className="w-full rounded-2xl bg-background border border-border px-4 py-3 text-base sm:text-sm font-mono text-foreground focus:outline-none focus:border-primary min-h-[46px]"
              />
            </div>

            {selectedCategory === "TAKE_A_LOAN" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-foreground block">
                  {isEs ? "Plazo del Crédito (Meses)" : isFr ? "Durée du Prêt (Mois)" : "Loan Term (Months)"}
                </label>
                <select
                  value={loanTermMonths}
                  onChange={(e) => setLoanTermMonths(Number(e.target.value))}
                  className="w-full rounded-2xl bg-background border border-border px-4 py-3 text-base sm:text-sm font-mono text-foreground focus:outline-none focus:border-primary min-h-[46px]"
                >
                  <option value={12}>12 {isEs ? "meses (1 año)" : isFr ? "mois (1 an)" : "months (1 yr)"}</option>
                  <option value={24}>24 {isEs ? "meses (2 años)" : isFr ? "mois (2 ans)" : "months (2 yrs)"}</option>
                  <option value={36}>36 {isEs ? "meses (3 años)" : isFr ? "mois (3 ans)" : "months (3 yrs)"}</option>
                  <option value={48}>48 {isEs ? "meses (4 años)" : isFr ? "mois (4 ans)" : "months (4 yrs)"}</option>
                  <option value={60}>60 {isEs ? "meses (5 años)" : isFr ? "mois (5 ans)" : "months (5 yrs)"}</option>
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-foreground block">
                  {isEs ? "Cuota Mensual (si crédito/recurrente)" : isFr ? "Mensualité (si crédit)" : "Monthly Payment (if loan/recurring)"}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="0"
                  value={customMonthlyPayment ?? ""}
                  onChange={(e) => setCustomMonthlyPayment(Number(e.target.value) || null)}
                  className="w-full rounded-2xl bg-background border border-border px-4 py-3 text-base sm:text-sm font-mono text-foreground focus:outline-none focus:border-primary min-h-[46px]"
                />
              </div>
            )}
          </div>

          {/* Timing Selector */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/30 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="font-bold text-foreground">
              {isEs ? "Fecha prevista para la ejecución:" : isFr ? "Date envisagée pour l'engagement :" : "Proposed Execution Timing:"}
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {(["TODAY", "30_DAYS", "90_DAYS"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDecisionTiming(t)}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer min-h-[38px] ${
                    decisionTiming === t
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "TODAY" ? (isEs ? "Hoy" : isFr ? "Aujourd'hui" : "Today") : t === "30_DAYS" ? (isEs ? "+30 días" : "+30j") : (isEs ? "+90 días" : "+90j")}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring Toggle */}
          {selectedCategory !== "TAKE_A_LOAN" && (
            <label className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-secondary/30 border border-border/60 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurringExpense}
                onChange={(e) => setIsRecurringExpense(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-[#FF5533]"
              />
              <span className="text-xs font-bold text-foreground">
                {isEs
                  ? "Se trata de un gasto u obligación recurrente mensual"
                  : isFr
                  ? "Il s'agit d'une dépense ou charge récurrente mensuelle"
                  : "This is a recurring monthly obligation / expense"}
              </span>
            </label>
          )}

          {/* Actions */}
          <div className="pt-3 sm:pt-4 border-t border-border/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1 px-4 py-3 rounded-xl bg-secondary text-xs font-bold text-foreground cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEs ? "Atrás" : isFr ? "Retour" : "Back"}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
            >
              <span>{isEs ? "Confirmar y Verificar Contexto" : isFr ? "Valider le Contexte" : "Confirm & Check Context"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}


      {/* ─────────────────────────────────────────────────────────────
          STEP 3 OF 7 — FINANCIAL CONTEXT
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 3 && (
        <section className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-xs animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-2xl font-black text-foreground tracking-tight">
                {isEs ? "Verifiquemos su contexto financiero" : isFr ? "Vérifions votre contexte financier" : "Let's check your financial context"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {isEs
                  ? "Estos son los datos reales que UseAimly utilizará para modelar el impacto determinista."
                  : isFr
                  ? "Voici les données réelles qu'UseAimly utilisera pour modéliser l'impact."
                  : "Review the financial baseline data UseAimly will use for calculation."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingContext(!isEditingContext)}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-secondary/60 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isEditingContext ? (isEs ? "Finalizar edición" : isFr ? "Terminer l'édition" : "Done Editing") : (isEs ? "Modificar cifras" : isFr ? "Modifier ces chiffres" : "Edit Numbers")}</span>
            </button>
          </div>

          {/* 6 Key Baseline Indicators Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 text-xs">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isEs ? "LIQUIDEZ" : isFr ? "LIQUIDITÉS" : "AVAILABLE CASH"}
              </span>
              {isEditingContext ? (
                <input
                  type="number"
                  inputMode="decimal"
                  value={overrideSavings ?? activeBaseline.liquidSavings}
                  onChange={(e) => setOverrideSavings(Number(e.target.value) || null)}
                  className="w-full rounded-xl bg-background border px-2 py-1 font-mono font-bold text-sm"
                />
              ) : (
                <span className="text-base sm:text-lg font-black text-foreground font-mono block">
                  {fmt(activeBaseline.liquidSavings)}
                </span>
              )}
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                ✓ {isEs ? "Confirmado" : isFr ? "Confirmé" : "Confirmed"}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isEs ? "INGRESOS NETOS" : isFr ? "REVENU MENSUEL" : "MONTHLY INFLOW"}
              </span>
              {isEditingContext ? (
                <input
                  type="number"
                  inputMode="decimal"
                  value={overrideIncome ?? canonicalAnalysis.baseline.monthlyIncome}
                  onChange={(e) => setOverrideIncome(Number(e.target.value) || null)}
                  className="w-full rounded-xl bg-background border px-2 py-1 font-mono font-bold text-sm"
                />
              ) : (
                <span className="text-base sm:text-lg font-black text-foreground font-mono block">
                  +{fmt(canonicalAnalysis.baseline.monthlyIncome)}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground block truncate">
                {isEs ? "Entradas netas" : isFr ? "Entrées nettes" : "Net inflows"}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isEs ? "GASTOS FIJOS" : isFr ? "CHARGES FIXES" : "FIXED LIVING"}
              </span>
              {isEditingContext ? (
                <input
                  type="number"
                  inputMode="decimal"
                  value={overrideExpenses ?? canonicalAnalysis.baseline.monthlyLivingExpenses}
                  onChange={(e) => setOverrideExpenses(Number(e.target.value) || null)}
                  className="w-full rounded-xl bg-background border px-2 py-1 font-mono font-bold text-sm"
                />
              ) : (
                <span className="text-base sm:text-lg font-black text-foreground font-mono block">
                  {fmt(canonicalAnalysis.baseline.monthlyLivingExpenses)}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground block truncate">
                {isEs ? "Alquiler y gastos" : isFr ? "Loyer & charges" : "Rent & living"}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isEs ? "DEUDAS ACTIVAS" : isFr ? "DETTES ACTIVES" : "DEBT SERVICE"}
              </span>
              {isEditingContext ? (
                <input
                  type="number"
                  inputMode="decimal"
                  value={overrideDebt ?? canonicalAnalysis.baseline.monthlyDebtService}
                  onChange={(e) => setOverrideDebt(Number(e.target.value) || null)}
                  className="w-full rounded-xl bg-background border px-2 py-1 font-mono font-bold text-sm"
                />
              ) : (
                <span className="text-base sm:text-lg font-black text-foreground font-mono block">
                  {fmt(canonicalAnalysis.baseline.monthlyDebtService)}{isEs ? "/mes" : isFr ? "/mois" : "/mo"}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground block truncate">
                {canonicalAnalysis.baseline.monthlyDebtService > 0 ? (isEs ? "Obligaciones activas" : "Active obligations") : (isEs ? "Sin deuda" : "Zero debt")}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isEs ? "FLUJO LIBRE" : isFr ? "CASH-FLOW LIBRE" : "NET FREE CASH"}
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                +{fmt(canonicalAnalysis.baseline.netFreeCashFlow)}
              </span>
              <span className="text-[10px] text-emerald-600/80 block truncate">
                {isEs ? "Ahorro/mes" : isFr ? "Épargne/mois" : "Monthly power"}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isEs ? "COLCHÓN VITAL" : isFr ? "MATELAS SÉCURITÉ" : "EMERGENCY RUNWAY"}
              </span>
              <span className="text-base sm:text-lg font-black text-foreground font-mono block">
                {canonicalAnalysis.baseline.emergencyRunwayMonths} {isEs ? "meses" : isFr ? "mois" : "mos"}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block truncate">
                {canonicalAnalysis.baseline.emergencyRunwayMonths >= 3.0 ? (isEs ? "Colchón seguro" : "Safe buffer") : (isEs ? "< 3.0 meses" : "< 3.0 mos")}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 sm:pt-4 border-t border-border/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1 px-4 py-3 rounded-xl bg-secondary text-xs font-bold text-foreground cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEs ? "Atrás" : isFr ? "Retour" : "Back"}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
            >
              <span>{isEs ? "Confirmar y Establecer Prioridades" : isFr ? "Choisir mes Priorités" : "Confirm & Set Priorities"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}


      {/* ─────────────────────────────────────────────────────────────
          STEP 4 OF 7 — GOALS & PRIORITIES
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 4 && (
        <section className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-xs animate-fadeIn">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-2xl font-black text-foreground tracking-tight">
              {isEs ? "¿Qué busca proteger o lograr como prioridad?" : isFr ? "Que cherchez-vous à protéger en priorité ?" : "What are you trying to protect or achieve?"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {isEs
                ? "El algoritmo utilizará su prioridad para clasificar las opciones y recomendar el mejor compromiso."
                : isFr
                ? "L'algorithme utilisera votre priorité pour classer les options et recommander le meilleur compromis."
                : "Your selected priority is transparently used to rank alternatives and determine the recommended path."}
            </p>
          </div>

          {/* Goal selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase font-bold text-foreground block">
              {isEs ? "Meta de vida principal a proteger:" : isFr ? "Objectif de vie principal à protéger :" : "Primary Goal Protected:"}
            </label>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/40 border border-border/70 flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="font-bold text-foreground">{canonicalAnalysis.baseline.primaryGoal.title}</div>
                  <div className="text-muted-foreground text-[11px]">
                    {fmt(canonicalAnalysis.baseline.primaryGoal.currentAmount)} {isEs ? "ahorrado de" : isFr ? "épargné sur" : "saved of"} {fmt(canonicalAnalysis.baseline.primaryGoal.targetAmount)} ({isEs ? "Límite" : isFr ? "Échéance" : "Deadline"}: {canonicalAnalysis.baseline.primaryGoal.targetDate})
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] border border-emerald-500/20 shrink-0">
                {isEs ? "ACTIVA" : isFr ? "ACTIF" : "ACTIVE"}
              </span>
            </div>
          </div>

          {/* Priorities Selection */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="text-xs font-mono uppercase font-bold text-foreground block">
              {isEs ? "¿Qué criterio tiene más peso en esta decisión?" : isFr ? "Quel critère compte le plus pour cette décision ?" : "What matters most for this decision?"}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {[
                {
                  id: "PROTECT_CASH",
                  label: isEs ? "1. Proteger el colchón de seguridad" : isFr ? "1. Protéger le matelas de sécurité" : "1. Protecting emergency cash buffer",
                  desc: isEs ? "No descender nunca de 3.0 meses de gastos fijos." : isFr ? "Ne jamais descendre sous 3 mois de charges fixes." : "Keep at least 3.0 months of living runway locked.",
                },
                {
                  id: "REACH_GOALS",
                  label: isEs ? "2. Alcanzar mi meta a tiempo" : isFr ? "2. Atteindre mon objectif au plus vite" : "2. Reaching goals on schedule",
                  desc: isEs ? "Minimizar cualquier retraso en la fecha de llegada." : isFr ? "Minimiser tout retard sur la date d'arrivée." : "Prevent delays on major destination milestones.",
                },
                {
                  id: "LOW_MONTHLY",
                  label: isEs ? "3. Mantener gastos mensuales bajos" : isFr ? "3. Garder des charges mensuelles faibles" : "3. Keeping monthly recurring costs low",
                  desc: isEs ? "Evitar comprometer el flujo de caja libre recurrente." : isFr ? "Éviter d'engager le cash-flow libre récurrent." : "Avoid committing free cash flow to monthly debt.",
                },
                {
                  id: "BUY_SOONER",
                  label: isEs ? "4. Concretar la compra de inmediato" : isFr ? "4. Concrétiser l'achat immédiatement" : "4. Making the purchase as soon as possible",
                  desc: isEs ? "Priorizar la utilidad inmediata aunque se retrase una meta." : isFr ? "Privilégier l'utilité immédiate quitte à décaler un objectif." : "Prioritize immediate execution and offset later.",
                },
              ].map((p) => {
                const isSelected = selectedPriority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPriority(p.id as UserDecisionPriority)}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
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
          <div className="pt-3 sm:pt-4 border-t border-border/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1 px-4 py-3 rounded-xl bg-secondary text-xs font-bold text-foreground cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEs ? "Atrás" : isFr ? "Retour" : "Back"}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEs ? "Analizar mis Opciones" : isFr ? "Lancer l'Analyse" : "Analyze My Options"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}


      {/* ─────────────────────────────────────────────────────────────
          STEP 5 OF 7 — ANALYZE & COMPARE (RECONCILED HUD)
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 5 && (
        <section className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-8 space-y-5 sm:space-y-7 shadow-xl animate-fadeIn">
          
          {/* Top Verdict Header */}
          <div className="space-y-2.5 sm:space-y-3 border-b border-border/60 pb-4 sm:pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono font-extrabold text-xs tracking-wider border ${
                verdict.decision === "RECOMMENDED"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : verdict.decision === "PROCEED_WITH_CAUTION"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
              }`}>
                {verdict.decision === "RECOMMENDED" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : verdict.decision === "PROCEED_WITH_CAUTION" ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span>
                  {verdict.decision === "RECOMMENDED"
                    ? isEs ? "RECOMENDADO" : isFr ? "RECOMMANDÉ" : "RECOMMENDED"
                    : verdict.decision === "PROCEED_WITH_CAUTION"
                    ? isEs ? "CON PRECAUCIÓN" : isFr ? "AVEC PRUDENCE" : "PROCEED WITH CAUTION"
                    : isEs ? "NO RECOMENDADO" : isFr ? "NON RECOMMANDÉ" : "NOT RECOMMENDED"}
                </span>
              </span>

              <span className="text-[11px] font-mono text-muted-foreground">
                {isEs ? "Prioridad:" : isFr ? "Priorité :" : "Priority:"} <strong className="text-foreground">{selectedPriority.replace(/_/g, " ")}</strong>
              </span>
            </div>

            <h3 className="text-lg sm:text-3xl font-black text-foreground tracking-tight leading-snug">
              {verdict.headline}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {verdict.primaryReason}
            </p>
          </div>

          {/* 4 Key Reconciled Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isEs ? "CASH DESPUÉS" : isFr ? "CASH APRÈS" : "CASH AFTER"}
              </span>
              <span className="text-lg sm:text-2xl font-black text-foreground font-mono block">
                {fmt(primaryImpact.postDecisionCash)}
              </span>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block truncate">
                {primaryImpact.deltaCash === 0 ? (isEs ? "0 (Sin salida)" : "0 (No cash drop)") : `-${fmt(Math.abs(primaryImpact.deltaCash))}`}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isEs ? "COLCHÓN" : isFr ? "MATELAS" : "RUNWAY"}
              </span>
              <span className="text-lg sm:text-2xl font-black text-foreground font-mono block">
                {primaryImpact.postDecisionRunwayMonths} {isEs ? "meses" : isFr ? "mois" : "mos"}
              </span>
              <span className="text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-bold block truncate">
                {primaryImpact.postDecisionRunwayMonths < 3.0 ? (isEs ? "Bajo el umbral 3.0" : "Below 3.0 floor") : (isEs ? "Zona segura" : "Safe buffer")}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              <span className="text-[10px] font-mono uppercase text-rose-600 dark:text-rose-400 font-bold block">
                {isEs ? "IMPACTO EN META" : isFr ? "IMPACT OBJECTIF" : "GOAL IMPACT"}
              </span>
              <span className="text-lg sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono block">
                {primaryImpact.goalStatus === "GOAL_FUNDING_PAUSED" ? (isEs ? "PAUSADO" : "PAUSED") : `+${primaryImpact.goalDelayDays}d`}
              </span>
              <span className="text-[10px] sm:text-[11px] text-rose-600/80 dark:text-rose-400/80 font-medium block truncate">
                {canonicalAnalysis.baseline.primaryGoal.title}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                {isEs ? "VARIACIÓN FLUJO" : isFr ? "PRESSION FLUX" : "CASH FLOW SHIFT"}
              </span>
              <span className="text-lg sm:text-2xl font-black text-foreground font-mono block">
                {primaryImpact.deltaFreeCashFlow === 0 ? "0%" : `-${primaryImpact.fcfPercentageShift}%`}
              </span>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block truncate">
                +{fmt(primaryImpact.postDecisionFreeCashFlow)}{isEs ? "/mes" : isFr ? "/mois" : "/mo"} FCF
              </span>
            </div>
          </div>

          {/* Scenario Alternatives Comparison */}
          <div className="space-y-2.5 sm:space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold block">
              {isEs ? "COMPARACIÓN DE ESCENARIOS CALCULADOS" : isFr ? "COMPARAISON DES OPTIONS" : "AIMLY'S CALCULATED SCENARIOS"}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
              {[canonicalAnalysis.scenarios.optionA, canonicalAnalysis.scenarios.optionB, canonicalAnalysis.scenarios.optionC].map((alt) => (
                <div
                  key={alt.id}
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                    alt.isRecommended
                      ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30 shadow-xs"
                      : "bg-secondary/30 border-border/70"
                  }`}
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-background border border-border/80">
                      {alt.badge} {alt.isRecommended ? (isEs ? "★ ÓPTIMO" : "★ BEST") : ""}
                    </span>
                    <h4 className="text-sm font-bold text-foreground leading-snug">{alt.title}</h4>
                    <p className="text-xs font-bold text-primary">
                      {alt.goalDelayDays === 0 ? (isEs ? "0 días de retraso (A tiempo)" : "0 days delay (On track)") : `+${alt.goalDelayDays} ${isEs ? "días de retraso" : "days delay"}`}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>{isEs ? "Liquidez después:" : "Cash after:"}</span>
                      <strong className="text-foreground font-mono">{fmt(alt.postDecisionCash)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{isEs ? "Colchón:" : "Runway:"}</span>
                      <strong className="text-foreground font-mono">{alt.postDecisionRunwayMonths} {isEs ? "meses" : "mos"}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 sm:pt-4 border-t border-border/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1 px-4 py-3 rounded-xl bg-secondary text-xs font-bold text-foreground cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEs ? "Atrás" : isFr ? "Retour" : "Back"}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isEs ? "Verificar Coherencia del Análisis" : isFr ? "Lancer l'Audit de Cohérence" : "Verify Analysis Coherence"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}


      {/* ─────────────────────────────────────────────────────────────
          STEP 6 OF 7 — VERIFY THE ANALYSIS (AIMLY COHERENCE CHECK)
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 6 && (
        <section className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
              verification.status === "VERIFIED" || verification.status === "VERIFIED WITH ASSUMPTIONS"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
            }`}>
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  {isEs ? (verification.status === "VERIFIED" ? "VERIFICADO" : "CON SUPUESTOS") : verification.status}
                </span>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs text-muted-foreground font-mono">Score: {verification.overallScore}/100</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-foreground tracking-tight">
                {verification.status === "VERIFIED"
                  ? isEs ? "Análisis 100% Verificado" : isFr ? "Analyse 100% Vérifiée" : "Analysis 100% Verified"
                  : verification.status === "VERIFIED WITH ASSUMPTIONS"
                  ? isEs ? "Verificado con Supuestos Explícitos" : isFr ? "Vérifié avec Hypothèses Explicites" : "Verified with Explicit Assumptions"
                  : isEs ? "El análisis requiere revisión" : isFr ? "Analyse nécessitant une revue" : "Analysis Requires Review"}
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            {isEs
              ? "Todos los cálculos de amortización, impacto en metas y compensaciones entre escenarios han sido rigurosamente auditados frente a reglas matemáticas deterministas."
              : isFr
              ? "Toutes les étapes arithmétiques, les scénarios comparatifs et l'alignement temporel ont été rigoureusement certifiés conformes au modèle mathématique."
              : "All cash-flow movements, loan amortizations, goal delays, and scenario tradeoffs have been strictly validated against deterministic rules."}
          </p>

          {/* Quality Checks List */}
          <div className="space-y-2">
            {verification.checks.map((c) => (
              <div
                key={c.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-secondary/40 border border-border/70 flex items-start gap-3 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-foreground">
                    {isEs ? (c as any).nameEs || c.name : isFr ? c.nameFr : c.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {isEs ? (c as any).notesEs || c.notes : isFr ? c.notesFr : c.notes}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-3 sm:pt-4 border-t border-border/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1 px-4 py-3 rounded-xl bg-secondary text-xs font-bold text-foreground cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEs ? "Atrás" : isFr ? "Retour" : "Back"}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
            >
              <FileDown className="w-4 h-4" />
              <span>{isEs ? "Ver Informe Final" : isFr ? "Voir le Rapport Final" : "See Final Report"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}


      {/* ─────────────────────────────────────────────────────────────
          STEP 7 OF 7 — FINAL DECISION REPORT (DOWNLOAD PDF)
      ───────────────────────────────────────────────────────────── */}
      {currentStep === 7 && (
        <section className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-8 space-y-5 sm:space-y-7 shadow-xl animate-fadeIn">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border/60 pb-4 sm:pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20">
                  {isEs ? (verification.status === "VERIFIED" ? "VERIFICADO" : "CON SUPUESTOS") : verification.status}
                </span>
                <span className="text-[11px] sm:text-xs text-muted-foreground font-mono">
                  ID: {verifiedReportData.reportId} • v{verifiedReportData.version}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-foreground tracking-tight">
                {isEs ? "Su Informe Decisional Verificado está Listo" : isFr ? "Votre Rapport Décisionnel Vérifié est Prêt" : "Your Financial Decision Report is Ready"}
              </h2>
            </div>

            {/* Primary Action Button: Download PDF */}
            <button
              type="button"
              disabled={isDownloadingPDF}
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shrink-0 min-h-[48px]"
            >
              <FileDown className="w-4 h-4" />
              <span>{isDownloadingPDF ? (isEs ? "Generando PDF..." : isFr ? "Génération en cours..." : "Generating PDF...") : (isEs ? "Descargar Informe Verificado (PDF)" : isFr ? "Télécharger le Rapport PDF" : "Download Verified PDF Report")}</span>
            </button>
          </div>

          {/* Report Executive Summary Box */}
          <div className="p-4 sm:p-6 rounded-2xl bg-secondary/40 border border-border/70 space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
                {isEs ? "SÍNTESIS DEL VEREDICTO" : isFr ? "SYNTHÈSE DU VERDICT" : "VERIFIED EXECUTIVE SUMMARY"}
              </span>
              <span className="px-2.5 sm:px-3 py-0.5 rounded-full font-mono text-[10px] sm:text-[11px] font-bold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                {verdict.decision.replace(/_/g, " ")}
              </span>
            </div>

            <h3 className="text-base sm:text-xl font-black text-foreground leading-snug">
              {verdict.headline}
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {verdict.primaryReason}
            </p>
          </div>

          {/* Financial Impact Comparison Table (Reconciled) */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-muted-foreground block">
              {isEs ? "Tabla de Impacto Financiero Determinista" : isFr ? "Tableau d'Impact Financier Déterministe" : "Deterministic Financial Impact Table"}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground block">{isEs ? "RESERVAS LÍQUIDAS" : isFr ? "RÉSERVES LIQUIDES" : "LIQUID RESERVES"}</span>
                <span className="text-base sm:text-lg font-black font-mono block">{fmt(primaryImpact.postDecisionCash)}</span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {primaryImpact.deltaCash === 0 ? (isEs ? "0 (Sin salida)" : "0 (No cash outflow)") : `-${fmt(Math.abs(primaryImpact.deltaCash))}`}
                </span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground block">{isEs ? "COLCHÓN VITAL" : isFr ? "MATELAS VITAL" : "LIVING RUNWAY"}</span>
                <span className="text-base sm:text-lg font-black font-mono block">{primaryImpact.postDecisionRunwayMonths} {isEs ? "meses" : isFr ? "mois" : "mos"}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-bold truncate">
                  {primaryImpact.postDecisionRunwayMonths < 3.0 ? (isEs ? "Bajo el umbral 3.0" : "Below 3.0 floor") : (isEs ? "Zona segura" : "Safe buffer")}
                </span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground block">{isEs ? "IMPACTO EN META" : isFr ? "IMPACT OBJECTIF" : "GOAL IMPACT"}</span>
                <span className="text-base sm:text-lg font-black font-mono text-rose-500 block">
                  {primaryImpact.goalStatus === "GOAL_FUNDING_PAUSED" ? (isEs ? "PAUSADO" : "PAUSED") : `+${primaryImpact.goalDelayDays}d`}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">{canonicalAnalysis.baseline.primaryGoal.title}</span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground block">{isEs ? "FLUJO DE CAJA" : isFr ? "CASH-FLOW LIBRE" : "MONTHLY CASH FLOW"}</span>
                <span className="text-base sm:text-lg font-black font-mono block">+{fmt(primaryImpact.postDecisionFreeCashFlow)}{isEs ? "/mes" : isFr ? "/mois" : "/mo"}</span>
                <span className="text-[10px] text-emerald-600 block font-bold truncate">
                  {primaryImpact.deltaFreeCashFlow === 0 ? "0%" : `-${primaryImpact.fcfPercentageShift}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Recommended Path Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 sm:space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
              {isEs ? "PLAN DE ACCIÓN RECOMENDADO POR AIMLY" : isFr ? "PLAN D'ACTION RECOMMANDÉ PAR AIMLY" : "AIMLY'S RECOMMENDED ACTION PATH"}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-foreground">
              {canonicalAnalysis.recommendation.recommendedScenarioTitle}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {canonicalAnalysis.recommendation.actionPlanStep1}
            </p>
          </div>

          {/* Secondary Actions Bar */}
          <div className="pt-3 sm:pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
                <span>
                  {isSaved
                    ? isEs
                      ? "Decisión Guardada"
                      : isFr
                      ? "Décision Sauvegardée"
                      : "Decision Saved"
                    : isEs
                    ? "Guardar en el Cofre"
                    : isFr
                    ? "Sauvegarder dans le Coffre"
                    : "Save to Vault"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold text-foreground cursor-pointer min-h-[44px]"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>
                  {copiedLink
                    ? isEs
                      ? "Enlace Copiado"
                      : isFr
                      ? "Lien Copié"
                      : "Link Copied"
                    : isEs
                    ? "Compartir"
                    : isFr
                    ? "Partager"
                    : "Share"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold text-foreground cursor-pointer min-h-[44px]"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isEs ? "Modificar Supuestos (v2)" : isFr ? "Modifier les Hypothèses (v2)" : "Edit Assumptions (v2)"}</span>
              </button>
            </div>

            <Link
              href={`/app/ask?q=${encodeURIComponent(`I analyzed: "${extractedTitle}" for ${fmt(extractedAmount)}. Verdict was ${verdict.decision}. What are the next best tactical moves?`)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border transition-all min-h-[44px]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isEs ? "Consultar con Aimly" : isFr ? "Demander conseil à Aimly" : "Ask Aimly About Next Moves"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

    </div>
  );
}

