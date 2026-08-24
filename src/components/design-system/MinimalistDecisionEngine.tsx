"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  Clock,
  Zap,
  TrendingUp,
  Link as LinkIcon,
  HelpCircle,
} from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { parseDecisionQuery } from "@/lib/nlp/decision-query-parser";
import { simulateDecision, BaselineFinancialProfile } from "@/lib/finance";
import { calculateFreedomClock } from "@/lib/finance/health/freedom-clock";
import { runCashCrashGuard } from "@/lib/finance/simulations/cash-crash-guard";
import { CashCrashGuardCard } from "@/components/finance/CashCrashGuardCard";
import { MaxSafePriceCard } from "./MaxSafePriceCard";
import { BetterAlternativesCard } from "./BetterAlternativesCard";
import { DecisionStressTestCard } from "./DecisionStressTestCard";
import { FutureCostConsequenceCard } from "./FutureCostConsequenceCard";
import { OfferDocumentModal } from "@/components/finance/OfferDocumentModal";
import { ProUpgradeModal } from "@/components/finance/ProUpgradeModal";
import { ExtractedOfferDetails } from "@/lib/nlp/document-offer-parser";
import { DocumentUploadDropzone } from "@/components/finance/DocumentUploadDropzone";
import { AimlyDecisionReport } from "@/components/finance/AimlyDecisionReport";
import { RawUploadedFile, documentIngestionService } from "@/lib/documents/document-ingestion-service";
import { decisionContextBuilder } from "@/lib/documents/decision-context-builder";
import { documentIntelligenceEngine } from "@/lib/ai/document-intelligence-engine";
import { AimlyIntelligenceReport } from "@/lib/types/document-intelligence";
import { FileSearch, UploadCloud, SlidersHorizontal, FileText } from "lucide-react";


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

        {/* 3D Floating Emerald Shield Badge */}
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
  autoExpandAnalysis = false,
  redirectOnSelect = true,
}: {
  baselineProfile?: BaselineFinancialProfile;
  initialQuery?: string;
  showQuickActions?: boolean;
  autoExpandAnalysis?: boolean;
  redirectOnSelect?: boolean;
}) {
  const router = useRouter();
  const { currency, format } = useCurrency();
  const { t, language } = useI18n();
  const isFr = language === "fr";

  const defaultDefaultQuery = isFr
    ? "Je veux acheter une voiture à 500 000 KES."
    : "I'm thinking of buying a KES 500,000 car.";

  const [queryInput, setQueryInput] = useState(initialQuery || defaultDefaultQuery);
  const [activeCardId, setActiveCardId] = useState<string | null>("car");
  const [showFullAnalysis, setShowFullAnalysis] = useState(autoExpandAnalysis);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  // AI Document & Decision Intelligence State
  const [uploadedFiles, setUploadedFiles] = useState<RawUploadedFile[]>([]);
  const [isDocDrawerOpen, setIsDocDrawerOpen] = useState(false);
  const [isContextDrawerOpen, setIsContextDrawerOpen] = useState(false);
  const [extraIncome, setExtraIncome] = useState<number | undefined>(undefined);
  const [extraExpenses, setExtraExpenses] = useState<number | undefined>(undefined);
  const [extraSavings, setExtraSavings] = useState<number | undefined>(undefined);
  const [aimlyReport, setAimlyReport] = useState<AimlyIntelligenceReport | null>(null);
  const [isAnalyzingDocs, setIsAnalyzingDocs] = useState(false);
  const [processingStep, setProcessingStep] = useState("Reading your documents...");

  const handleRunAimlyAnalysis = async () => {
    setIsAnalyzingDocs(true);
    setProcessingStep(isFr ? "Lecture de vos documents & extraction..." : "Reading your documents & extracting facts...");

    try {
      // 1. Ingest files if any
      const docs = await documentIngestionService.ingestMultipleDocuments(uploadedFiles);
      setProcessingStep(isFr ? "Calculs déterministes d'impact & décalage..." : "Calculating deterministic cash-flow impact...");

      // 2. Build decision context
      const context = decisionContextBuilder.buildContext({
        userDecisionText: queryInput,
        documents: docs,
        userContext: {
          monthlyIncome: extraIncome || activeBaseline.incomes.reduce((s, i) => s + i.amount, 0),
          monthlyExpenses: extraExpenses || activeBaseline.expenses.reduce((s, e) => s + e.amount, 0),
          liquidSavings: extraSavings || activeBaseline.liquidSavings,
          primaryGoalTarget: activeBaseline.goals[0]?.targetAmount || 500000,
          primaryGoalSaved: activeBaseline.goals[0]?.currentAmount || 180000,
        },
        currency: currency as any,
      });

      setProcessingStep(isFr ? "Analyse des risques & synthèse décisionnelle..." : "Analyzing contractual risks & synthesizing report...");

      // 3. Generate Aimly Intelligence Report
      const report = documentIntelligenceEngine.generateReport(context);
      setAimlyReport(report);

      setTimeout(() => {
        const el = document.getElementById("aimly-intelligence-report-section");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (e) {
      console.error("Aimly analysis failed:", e);
    } finally {
      setIsAnalyzingDocs(false);
    }
  };



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
        commitments: [
          {
            id: "annual-ins",
            title: "Assurance Annuelle & Taxes",
            amount: 60000,
            frequency: "ANNUALLY",
            dueMonth: 11,
          },
        ],
        goals: [
          {
            id: "main-goal",
            title: isFr ? "Liberté Financière & Entreprise" : "Financial Freedom Goal",
            targetAmount: 500000,
            currentAmount: 180000,
            targetDate: "2027-03-31",
            priority: "HIGH",
            status: "ACTIVE",
          },
        ],
      },
    [baselineProfile, isFr]
  );

  // 6 DECISION CARDS WITH ROMAIN BOUVET COPYWRITING
  const DECISION_CARDS: DecisionCardOption[] = useMemo(
    () => [
      {
        id: "car",
        title: isFr ? "Acheter une voiture" : "Buy a car",
        subtitle: isFr ? "Puis-je financer ce véhicule ?" : "Can I afford it?",
        defaultQuery: isFr
          ? "Puis-je m'offrir une voiture à 500 000 KES ?"
          : "Can I afford a KES 500,000 car?",
        bgColor: "bg-emerald-500/10",
        iconBg: "bg-[#00A859] text-white",
        icon: <Car className="w-5 h-5" />,
      },
      {
        id: "home",
        title: isFr ? "Acheter un bien immobilier" : "Buy a home",
        subtitle: isFr ? "Quel impact sur ma trésorerie ?" : "See the financial impact",
        defaultQuery: isFr
          ? "Puis-je financer un apport immobilier de 2 500 000 KES ?"
          : "Can I afford a KES 2,500,000 home deposit?",
        bgColor: "bg-emerald-500/10",
        iconBg: "bg-[#00A859] text-white",
        icon: <Home className="w-5 h-5" />,
      },
      {
        id: "loan",
        title: isFr ? "Souscrire un crédit" : "Take a loan",
        subtitle: isFr ? "Puis-je assumer les mensualités ?" : "Can I handle the payments?",
        defaultQuery: isFr
          ? "Que se passe-t-il si je prends un crédit de 200 000 KES ?"
          : "What happens if I take a KES 200,000 loan?",
        bgColor: "bg-purple-500/10",
        iconBg: "bg-purple-600 text-white",
        icon: <CreditCard className="w-5 h-5" />,
      },
      {
        id: "purchase",
        title: isFr ? "Achat coup de cœur" : "Make a big purchase",
        subtitle: isFr ? "Vérifiez avant de céder" : "Know before you spend",
        defaultQuery: isFr
          ? "Puis-je acheter un ordinateur portable à 120 000 KES ?"
          : "Can I buy a KES 120,000 laptop?",
        bgColor: "bg-amber-500/10",
        iconBg: "bg-amber-500 text-white",
        icon: <ShoppingBag className="w-5 h-5" />,
      },
      {
        id: "business",
        title: isFr ? "Lancer un business" : "Start a business",
        subtitle: isFr ? "Mes finances tiennent le choc ?" : "Can my finances support it?",
        defaultQuery: isFr
          ? "Puis-je investir 300 000 KES dans un nouveau projet ?"
          : "Can I invest KES 300,000 into a new business?",
        bgColor: "bg-blue-500/10",
        iconBg: "bg-blue-600 text-white",
        icon: <Briefcase className="w-5 h-5" />,
      },
      {
        id: "trip",
        title: isFr ? "S'offrir un voyage" : "Take a trip",
        subtitle: isFr ? "Est-ce que ça retarde mes projets ?" : "Will it affect my goals?",
        defaultQuery: isFr
          ? "Puis-je m'offrir des vacances à 150 000 KES ?"
          : "Can I afford a KES 150,000 vacation?",
        bgColor: "bg-sky-500/10",
        iconBg: "bg-sky-500 text-white",
        icon: <Plane className="w-5 h-5" />,
      },
    ],
    [isFr]
  );

  // Check if query is URL paste
  const isUrlPaste = useMemo(() => {
    return queryInput.includes("http://") || queryInput.includes("https://") || queryInput.includes("www.");
  }, [queryInput]);

  // Parse natural language intent
  const parsedIntent = useMemo(() => {
    return parseDecisionQuery(queryInput, currency);
  }, [queryInput, currency]);

  const extractedAmount = parsedIntent?.isValid && parsedIntent.extractedAmount > 0
    ? parsedIntent.extractedAmount
    : 500000;

  const extractedTitle = parsedIntent?.isValid && parsedIntent.extractedTitle
    ? parsedIntent.extractedTitle
    : isFr
    ? "Achat de Véhicule"
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

  // Elon Musk Freedom Clock Engine
  const freedomClock = useMemo(() => {
    return calculateFreedomClock(activeBaseline, extractedAmount, isFr);
  }, [activeBaseline, extractedAmount, isFr]);

  // Pre-Flight Cash Crash Guard Radar (365-Day Projection)
  const cashCrashAlert = useMemo(() => {
    return runCashCrashGuard(activeBaseline, extractedAmount, isRecurring, isFr);
  }, [activeBaseline, extractedAmount, isRecurring, isFr]);

  // Verdict Badge
  const verdict = useMemo(() => {
    const status = simulation?.status || simulation?.executiveDecision;
    if (status === "SAFE" || status === "GO") {
      return {
        type: "AFFORDABLE",
        label: isFr ? "VOUS POUVEZ L'ACHETER" : "YOU CAN AFFORD IT",
        badgeBg: "bg-emerald-500/10 text-[#00A859] border-emerald-500/30",
        cardBorder: "border-emerald-500/40",
        icon: <CheckCircle2 className="w-5 h-5 text-[#00A859]" />,
      };
    } else if (status === "MANAGEABLE" || status === "ADJUST") {
      return {
        type: "ADJUST",
        label: isFr ? "À AJUSTER" : "ADJUST",
        badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
        cardBorder: "border-amber-500/40",
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      };
    } else {
      return {
        type: "NOT_YET",
        label: isFr ? "PAS ENCORE" : "NOT YET",
        badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
        cardBorder: "border-rose-500/40",
        icon: <XCircle className="w-5 h-5 text-rose-500" />,
      };
    }
  }, [simulation, isFr]);

  const plainReasons = useMemo(() => {
    const reasons: string[] = [];
    const formattedAmt = format(extractedAmount, { fromCurrency: "KES" });
    const formattedSavings = format(activeBaseline.liquidSavings, { fromCurrency: "KES" });

    if (verdict.type === "AFFORDABLE") {
      reasons.push(
        isFr
          ? `Vos liquidités disponibles (${formattedSavings}) couvrent confortablement cette dépense de ${formattedAmt}.`
          : `Your liquid savings (${formattedSavings}) comfortably cover this ${formattedAmt} decision.`
      );
      reasons.push(
        isFr
          ? `Ce projet équivaut à ${freedomClock.lifeTimeCostDays} jours de travail — votre trésorerie reste saine.`
          : `This purchase equals ${freedomClock.lifeTimeCostDays} days of labor — your cash flow remains healthy.`
      );
      reasons.push(
        isFr
          ? `Votre Date de Liberté Financière (${freedomClock.formattedFreedomDate}) reste intacte et sécurisée.`
          : `Your Financial Freedom Date (${freedomClock.formattedFreedomDate}) remains protected.`
      );
    } else if (verdict.type === "ADJUST") {
      reasons.push(
        isFr
          ? `Exécuter cet achat équivaut à céder ${freedomClock.lifeTimeCostDays} jours de votre liberté future.`
          : `Executing this outlay equals trading ${freedomClock.lifeTimeCostDays} days of your future freedom.`
      );
      reasons.push(
        isFr
          ? `Votre Date de Liberté Financière recule du ${freedomClock.formattedFreedomDate} au ${freedomClock.formattedNewFreedomDate}.`
          : `Your Financial Freedom Date shifts from ${freedomClock.formattedFreedomDate} to ${freedomClock.formattedNewFreedomDate}.`
      );
      reasons.push(
        isFr
          ? `Nous recommandons d'étaler le paiement sur 3 mois ou d'augmenter votre épargne mensuelle.`
          : `We recommend spreading payments across 3 months or increasing your monthly savings rate.`
      );
    } else {
      reasons.push(
        isFr
          ? `Cet achat vous coûte ${freedomClock.lifeTimeCostDays} jours de travail et dépasse vos liquidités immédiates.`
          : `This spend costs ${freedomClock.lifeTimeCostDays} days of labor and exceeds immediate cash.`
      );
      reasons.push(
        isFr
          ? `Votre Date de Liberté est retardée jusqu'au ${freedomClock.formattedNewFreedomDate} (+${simulation.delta.delayInDays || 45} jours).`
          : `Your Freedom Date is delayed until ${freedomClock.formattedNewFreedomDate} (+${simulation.delta.delayInDays || 45} days).`
      );
      reasons.push(
        isFr
          ? `Épargnez pendant 4 à 6 mois supplémentaires pour valider ce projet en toute sécurité.`
          : `Save for another 4 to 6 months to validate this decision safely.`
      );
    }
    return reasons.slice(0, 3);
  }, [extractedAmount, activeBaseline, verdict, simulation, freedomClock, format, isFr]);

  const handleCardClick = (card: DecisionCardOption) => {
    setActiveCardId(card.id);
    setQueryInput(card.defaultQuery);
    if (redirectOnSelect) {
      router.push(`/onboarding?q=${encodeURIComponent(card.defaultQuery)}&preset=${card.id}`);
    }
  };

  const handleQuickAction = (text: string) => {
    setQueryInput(text);
    if (redirectOnSelect) {
      router.push(`/onboarding?q=${encodeURIComponent(text)}`);
    }
  };



  return (
    <div className="space-y-10 w-full max-w-4xl mx-auto font-sans">
      {/* ELON MUSK FREEDOM CLOCK HUD CARD */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-[#062317] via-[#0A2E20] to-[#041A11] p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00A859]/20 border border-[#00A859]/40 text-[#00A859] text-xs font-mono font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>{isFr ? "Horloge de Liberté Financière" : "Financial Freedom Clock"}</span>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {freedomClock.formattedFreedomDate}
          </div>

          <p className="text-xs text-gray-300 font-medium">
            {isFr
              ? "Date estimée de votre indépendance financière totale d'après votre rythme d'épargne"
              : "Estimated total financial independence date based on your baseline saving velocity"}
          </p>
        </div>

        {/* Dynamic Shift Indicator */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center sm:text-right shrink-0 space-y-1 min-w-[200px]">
          <span className="text-[10px] font-mono uppercase text-gray-300 font-bold block">
            {isFr ? "Impact sur votre Liberté" : "Freedom Impact"}
          </span>
          <span className="text-sm font-extrabold text-[#00A859] block">
            {freedomClock.lifeTimeCostDays} {isFr ? "jours de travail" : "days of labor"}
          </span>
          <span className="text-[11px] text-amber-300 font-bold block">
            ➔ {freedomClock.formattedNewFreedomDate}
          </span>
        </div>
      </div>

      {/* 1. DECISION CARDS ("Quels sont vos projets ?") */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-foreground">
          {t("scenariosSectionTitle")}
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
                  <div className={`p-3 rounded-2xl ${card.bgColor} shrink-0`}>
                    <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center shadow-sm`}>
                      {card.icon}
                    </div>
                  </div>

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

      {/* 2. PRIMARY ACTION INPUT BOX (WITH LINK PASTE RECOGNITION) */}
      <div className="space-y-5 rounded-3xl bg-[#062317] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {isFr ? "Quelle décision financière vous fait hésiter aujourd'hui ?" : "What money decision are you considering?"}
          </h2>

          {isUrlPaste && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A859]/20 border border-[#00A859]/40 text-[#00A859] text-xs font-mono font-bold">
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{isFr ? "Lien web détecté" : "Web Link Detected"}</span>
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-gray-400">
              {isUrlPaste ? <LinkIcon className="w-4 h-4 text-[#00A859]" /> : <Pencil className="w-4 h-4" />}
            </div>

            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={isFr ? "Collez un lien web ou décrivez : \"Acheter une voiture à 500k KES\"" : "Paste a link or describe: \"Buying a car for 500k KES\""}
              className="w-full rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 pl-11 pr-32 py-4 text-sm sm:text-base font-medium focus:outline-none focus:ring-4 focus:ring-[#00A859]/30 transition-all shadow-sm"
            />

            <button
              type="button"
              onClick={() => setIsDocDrawerOpen(!isDocDrawerOpen)}
              className="absolute right-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-secondary hover:bg-gray-200 text-gray-800 dark:text-foreground font-bold text-xs transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-[#00A859]" />
              <span className="hidden sm:inline">{isFr ? "Ajouter Document" : "Add Doc"}</span>
            </button>
          </div>

          {/* Progressive Input Enhancements Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsDocDrawerOpen(!isDocDrawerOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                isDocDrawerOpen || uploadedFiles.length > 0
                  ? "bg-[#00A859]/20 border-[#00A859]/40 text-[#00A859]"
                  : "bg-white/10 border-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{uploadedFiles.length > 0 ? `Documents (${uploadedFiles.length})` : (isFr ? "Analyser avec documents (PDF, devis, contrat)" : "Analyze with documents (PDF, quote, contract)")}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsContextDrawerOpen(!isContextDrawerOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                isContextDrawerOpen || extraIncome !== undefined
                  ? "bg-[#00A859]/20 border-[#00A859]/40 text-[#00A859]"
                  : "bg-white/10 border-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isFr ? "Ajouter contexte financier" : "Add Context (Optional)"}</span>
            </button>
          </div>

          {/* Document Ingestion Drawer */}
          {isDocDrawerOpen && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 animate-fadeIn">
              <DocumentUploadDropzone
                onFilesSelected={(files) => setUploadedFiles(files)}
                isProcessing={isAnalyzingDocs}
                processingStep={processingStep}
              />
            </div>
          )}

          {/* Progressive Financial Context Drawer */}
          {isContextDrawerOpen && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 animate-fadeIn text-xs">
              <span className="font-bold text-white block">
                {isFr ? "Ajuster vos paramètres de calcul (Optionnel) :" : "Adjust calculation inputs (Optional):"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-white/70 block mb-1">
                    {isFr ? "Revenu Mensuel" : "Monthly Income"}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 180000"
                    value={extraIncome ?? ""}
                    onChange={(e) => setExtraIncome(Number(e.target.value) || undefined)}
                    className="w-full rounded-xl bg-white/10 text-white px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#00A859]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/70 block mb-1">
                    {isFr ? "Charges Fixes" : "Living Expenses"}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 112000"
                    value={extraExpenses ?? ""}
                    onChange={(e) => setExtraExpenses(Number(e.target.value) || undefined)}
                    className="w-full rounded-xl bg-white/10 text-white px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#00A859]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/70 block mb-1">
                    {isFr ? "Réserves Liquides" : "Liquid Reserves"}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 200000"
                    value={extraSavings ?? ""}
                    onChange={(e) => setExtraSavings(Number(e.target.value) || undefined)}
                    className="w-full rounded-xl bg-white/10 text-white px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#00A859]"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={isAnalyzingDocs}
            onClick={() => {
              if (uploadedFiles.length > 0 || isDocDrawerOpen) {
                handleRunAimlyAnalysis();
              } else if (redirectOnSelect) {
                router.push(`/onboarding?q=${encodeURIComponent(queryInput)}`);
              } else {
                handleRunAimlyAnalysis();
              }
            }}
            className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-[#00A859] hover:bg-[#00964F] text-white font-bold text-base py-4 px-6 shadow-lg shadow-[#00A859]/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{isAnalyzingDocs ? processingStep : (isFr ? "Calculer l'impact sur ma Liberté" : "Analyze My Decision")}</span>
            <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

      </div>

      {/* AIMLY DECISION INTELLIGENCE REPORT EMBED */}
      {aimlyReport && (
        <div id="aimly-intelligence-report-section" className="w-full animate-fadeIn pt-4">
          <AimlyDecisionReport report={aimlyReport} />
        </div>
      )}

      {/* PRE-FLIGHT CASH CRASH GUARD RADAR (THE KILLER CONVERSION FEATURE) */}
      <div className="w-full">
        <CashCrashGuardCard alert={cashCrashAlert} />
      </div>

      {/* 3. PERSONALIZED QUICK ACTIONS */}
      {showQuickActions && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-foreground">
              {isFr ? "Selon vos finances actuelles" : "Based on your finances"}
            </h2>
            <span className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-foreground flex items-center gap-1 cursor-pointer">
              <span>{isFr ? "Tout voir" : "View all"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-3">
            {/* Prompt 1 */}
            <button
              type="button"
              onClick={() =>
                handleQuickAction(
                  isFr
                    ? "Puis-je m'offrir une voiture à 500 000 KES ?"
                    : "Can I afford a KES 500,000 car?"
                )
              }
              className="w-full text-left p-4 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border hover:border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-[#00A859] shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-foreground group-hover:text-[#00A859] transition-colors">
                    {isFr ? "Puis-je m'offrir un véhicule à 500 000 KES ?" : "Can I afford a KES 500,000 car?"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">
                    {isFr ? "Voir la faisabilité & l'impact mensuel" : "See affordability and monthly impact"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block text-[11px] font-bold text-[#00A859] bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  {isFr ? "Populaire" : "Popular"}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#00A859] transition-colors" />
              </div>
            </button>

            {/* Prompt 2 */}
            <button
              type="button"
              onClick={() =>
                handleQuickAction(
                  isFr
                    ? "Et si je contractais un crédit de 200 000 KES ?"
                    : "What happens if I take a KES 200,000 loan?"
                )
              }
              className="w-full text-left p-4 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border hover:border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-foreground group-hover:text-purple-600 transition-colors">
                    {isFr ? "Et si je contractais un prêt de 200 000 KES ?" : "What happens if I take a KES 200,000 loan?"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">
                    {isFr ? "Voir la capacité de remboursement" : "See repayment ability and total cost"}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </button>

            {/* Prompt 3 */}
            <button
              type="button"
              onClick={() =>
                handleQuickAction(
                  isFr
                    ? "Serai-je dans les temps pour mon objectif de Mars 2027 ?"
                    : "Can I reach my savings goal by March 2027?"
                )
              }
              className="w-full text-left p-4 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border hover:border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-foreground group-hover:text-amber-600 transition-colors">
                    {isFr ? "Serai-je dans les temps pour mon objectif de Mars 2027 ?" : "Can I reach my savings goal by March 2027?"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium">
                    {isFr ? "Mesurer le cap & ajuster la trajectoire" : "Check your progress and what to adjust"}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
            </button>
          </div>
        </div>
      )}

      {/* 4. 266X ROI VALUE PROOF BANNER ("Pourquoi Payer l'Abonnement?") */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
            {freedomClock.roiMultiplier}x
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-gray-900 dark:text-foreground text-sm">
              {isFr
                ? `Rendement x${freedomClock.roiMultiplier} garanti dès le 1er mois`
                : `Guaranteed ${freedomClock.roiMultiplier}x ROI from Month 1`}
            </h4>
            <p className="text-gray-600 dark:text-muted-foreground font-medium">
              {isFr
                ? `L'abonnement UseAimly Pro (9 $/mois) prévient en moyenne 2 400 $ de décisions impulsives.`
                : `UseAimly Pro ($9/mo) prevents an average of $2,400+ in impulsive decision mistakes.`}
            </p>
          </div>
        </div>

        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <span>{isFr ? "Voir l'Offre Pro" : "Unlock Pro ROI"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
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
              {isFr ? "Votre Décision" : "Your Decision"}
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
            <span>{isFr ? "Pourquoi ce verdict ?" : "Why?"}</span>
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
            {isFr ? "Quelles sont les étapes suivantes ?" : "What happens next?"}
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-secondary/50 border border-gray-100 dark:border-border">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                {isFr ? "Étape 1" : "Stage 1"}
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-foreground mt-1 block">
                {isFr ? "MAINTENANT" : "NOW"}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">
                {isFr ? "Analyse de la décision" : "Analyze decision"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-secondary/50 border border-gray-100 dark:border-border">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                {isFr ? "Étape 2" : "Stage 2"}
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-foreground mt-1 block">
                {isFr ? "MOIS 3" : "MONTH 3"}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">
                {isFr ? "Restauration du matelas" : "Buffer recovery"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-secondary/50 border border-gray-100 dark:border-border">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                {isFr ? "Étape 3" : "Stage 3"}
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-foreground mt-1 block">
                {isFr ? "MOIS 6" : "MONTH 6"}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">
                {isFr ? "Objectif atteint" : "Target reached"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-[#00A859]/30 text-[#00A859]">
              <span className="text-[10px] font-mono uppercase font-bold block">
                {isFr ? "Étape 4" : "Stage 4"}
              </span>
              <span className="text-xs font-bold mt-1 block">
                {isFr ? "ACHAT PRÊT" : "PURCHASE READY"}
              </span>
              <span className="text-[11px] opacity-90 mt-0.5 block">
                {isFr ? "Exécution sécurisée" : "Safe execution"}
              </span>
            </div>
          </div>
        </div>

        {/* LAYER 4: PROGRESSIVE DISCLOSURE */}
        <div className="pt-2 border-t border-gray-100 dark:border-border flex flex-col items-center">
          <button
            type="button"
            onClick={() => setShowFullAnalysis(!showFullAnalysis)}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#00A859] hover:underline cursor-pointer py-2"
          >
            <span>
              {showFullAnalysis
                ? isFr
                  ? "Masquer l'analyse détaillée"
                  : "Hide detailed analysis"
                : isFr
                ? "Voir l'analyse détaillée →"
                : "View full analysis →"}
            </span>
            {showFullAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFullAnalysis && (
            <div className="w-full pt-4 space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-background space-y-1">
                  <span className="text-[11px] text-gray-500 font-semibold block">
                    {isFr ? "Épargne liquide restante" : "Liquid Reserves After"}
                  </span>
                  <span className="text-base font-bold text-gray-900 dark:text-foreground">
                    {format(Math.max(0, activeBaseline.liquidSavings - (isRecurring ? 0 : extractedAmount)), { fromCurrency: "KES" })}
                  </span>
                </div>

                <div className="p-4 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-background space-y-1">
                  <span className="text-[11px] text-gray-500 font-semibold block">
                    {isFr ? "Décalage de Liberté" : "Freedom Date Shift"}
                  </span>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                    +{simulation.delta.delayInDays || 45} {isFr ? "jours" : "days"} (➔ {freedomClock.formattedNewFreedomDate})
                  </span>
                </div>

                <div className="p-4 rounded-2xl border border-gray-100 dark:border-border bg-gray-50 dark:bg-background space-y-1">
                  <span className="text-[11px] text-gray-500 font-semibold block">
                    {isFr ? "Effort mensuel complémentaire" : "Monthly Recovery Needed"}
                  </span>
                  <span className="text-base font-bold text-[#00A859]">
                    {format(1875, { fromCurrency: "KES" })} / {isFr ? "mois" : "month"}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2">
                <Link
                  href={`/app/decide?q=${encodeURIComponent(queryInput)}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-foreground hover:text-[#00A859] transition-colors border border-gray-200 dark:border-border rounded-xl px-5 py-2.5 bg-gray-50 dark:bg-secondary/40"
                >
                  <span>{isFr ? "Ouvrir le Studio Décisionnel Interactif" : "Open Interactive Decision Studio"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* LAYER 3-5 HIGH VALUE INTELLIGENCE CARDS */}
              <div className="space-y-6 pt-4">
                <FutureCostConsequenceCard
                  amount={extractedAmount}
                  monthlyPayment={isRecurring ? extractedAmount : 0}
                  termMonths={36}
                  goalDelayDays={simulation.delta.delayInDays || 45}
                  reserveMonthsAfter={simulation.affordability.obligationsPreservedMonths}
                  decisionTitle={extractedTitle}
                />

                <MaxSafePriceCard
                  baselineProfile={activeBaseline}
                  requestedPrice={extractedAmount}
                  isRecurring={isRecurring}
                  onApplyComfortablePrice={(safePrice) => {
                    setQueryInput(`${extractedTitle} for KES ${safePrice}`);
                  }}
                />

                {verdict.type !== "AFFORDABLE" && (
                  <BetterAlternativesCard
                    baselineProfile={activeBaseline}
                    requestedAmount={extractedAmount}
                    decisionTitle={extractedTitle}
                    onSelectAlternative={(alt) => {
                      setQueryInput(`${alt.title}`);
                    }}
                  />
                )}

                <DecisionStressTestCard
                  baselineProfile={activeBaseline}
                  decisionAmount={extractedAmount}
                  decisionTitle={extractedTitle}
                  isRecurring={isRecurring}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <OfferDocumentModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onConfirmOffer={(details) => {
          setQueryInput(`${details.title} - Total: ${details.totalPrice} KES, Deposit: ${details.downPayment} KES, Monthly: ${details.monthlyPayment} KES`);
          const el = document.getElementById("verdict-result-section");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />
    </div>
  );
}

