"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { MoneyInput } from "@/components/design-system/MoneyInput";
import {
  Home,
  Briefcase,
  ShieldAlert,
  Plane,
  GraduationCap,
  Car,
  Flag,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Target,
} from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  nameFr: string;
  desc: string;
  descFr: string;
  icon: React.ReactNode;
  iconBg: string;
  defaultTarget: number;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: "cat-home",
    name: "Buy a home",
    nameFr: "Acheter une maison / immobilier",
    desc: "Down payment, closing costs, moving expenses",
    descFr: "Apport personnel, frais de notaire, aménagement",
    icon: <Home className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    iconBg: "bg-amber-500/10 border-amber-500/20",
    defaultTarget: 500000,
  },
  {
    id: "cat-business",
    name: "Start a business",
    nameFr: "Lancer une entreprise",
    desc: "Startup capital, equipment, initial inventory",
    descFr: "Capital de départ, équipements, trésorerie",
    icon: <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    defaultTarget: 300000,
  },
  {
    id: "cat-emergency",
    name: "Emergency fund",
    nameFr: "Fonds d'urgence",
    desc: "3-6 months of expenses for security",
    descFr: "3 à 6 mois de charges fixes de sécurité",
    icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
    iconBg: "bg-rose-500/10 border-rose-500/20",
    defaultTarget: 150000,
  },
  {
    id: "cat-trip",
    name: "Dream trip",
    nameFr: "Voyager / Séjour de rêve",
    desc: "Vacation, honeymoon, adventure travel",
    descFr: "Vacances, voyage à l'étranger, expédition",
    icon: <Plane className="w-5 h-5 text-blue-500" />,
    iconBg: "bg-blue-500/10 border-blue-500/20",
    defaultTarget: 100000,
  },
  {
    id: "cat-edu",
    name: "Education",
    nameFr: "Formation & Éducation",
    desc: "Degree, certification, skills training",
    descFr: "Diplôme, formation continue, compétences",
    icon: <GraduationCap className="w-5 h-5 text-purple-500" />,
    iconBg: "bg-purple-500/10 border-purple-500/20",
    defaultTarget: 200000,
  },
  {
    id: "cat-car",
    name: "Buy a car",
    nameFr: "Acheter une voiture / véhicule",
    desc: "Vehicle purchase or deposit",
    descFr: "Achat automobile ou premier versement",
    icon: <Car className="w-5 h-5 text-indigo-500" />,
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
    defaultTarget: 250000,
  },
  {
    id: "cat-other",
    name: "Other goal",
    nameFr: "Autre projet personnel",
    desc: "Custom life target or reserve",
    descFr: "Objectif sur-mesure ou réserve de vie",
    icon: <Flag className="w-5 h-5 text-emerald-600" />,
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    defaultTarget: 100000,
  },
];

interface InteractiveGoalCreationWizardProps {
  currency?: CurrencyCode;
  monthlyGrossIncome?: number;
  onClose: () => void;
  onGoalCreated: (goalData: {
    title: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    monthsToGoal: number;
  }) => void;
}

export function InteractiveGoalCreationWizard({
  currency = "KES",
  monthlyGrossIncome = 180000,
  onClose,
  onGoalCreated,
}: InteractiveGoalCreationWizardProps) {
  const { language } = useI18n();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>(CATEGORIES[0]);
  const [goalName, setGoalName] = useState(language === "fr" ? CATEGORIES[0].nameFr : CATEGORIES[0].name);
  const [targetAmount, setTargetAmount] = useState<number>(500000);
  const [currentAmount, setCurrentAmount] = useState<number>(50000);
  const [monthsToGoal, setMonthsToGoal] = useState<number>(42);

  // Calculations for Step 4 Summary
  const remainingNeeded = Math.max(0, targetAmount - currentAmount);
  const monthlySavingsNeeded = Math.round(remainingNeeded / (monthsToGoal || 1));
  const shareOfIncomePercent = monthlyGrossIncome > 0 ? Math.round((monthlySavingsNeeded / monthlyGrossIncome) * 100 * 10) / 10 : 0;

  function handleSelectCategory(cat: CategoryOption) {
    setSelectedCategory(cat);
    setGoalName(language === "fr" ? cat.nameFr : cat.name);
    setTargetAmount(cat.defaultTarget);
    setStep(2);
  }

  function handleSubmit() {
    onGoalCreated({
      title: goalName,
      category: selectedCategory.id,
      targetAmount,
      currentAmount,
      monthlyContribution: monthlySavingsNeeded,
      monthsToGoal,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Viewport centering wrapper - Guaranteed vertical & horizontal centering */}
      <div className="min-h-full flex items-center justify-center p-3 sm:p-6 md:p-8">
        
        {/* Modal Container: Generous 2-column width on desktop */}
        <div className="relative w-full max-w-xl md:max-w-2xl lg:max-w-3xl rounded-3xl sm:rounded-[2rem] border border-border/80 bg-card p-5 sm:p-8 md:p-9 space-y-6 shadow-2xl text-left">
          
          {/* Header & Step Progress Bar */}
          <div className="space-y-4 pb-2 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s - 1) as any)}
                    className="p-2 rounded-xl border border-border/80 bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    title="Previous Step"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h3 className="text-base sm:text-xl font-bold font-editorial text-foreground tracking-tight flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span>{language === "fr" ? "Créer un Objectif" : "Create a Goal"}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {language === "fr"
                      ? "Définissez votre projet, chiffrez vos besoins et visualisez votre trajectoire."
                      : "Define your destination, target capital, and accumulation trajectory."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl border border-border/80 bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Step Segmented Line Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-semibold text-muted-foreground">
                <span>
                  {language === "fr"
                    ? `Étape ${step} sur 4 : ${
                        step === 1
                          ? "C'est quoi ton objectif ?"
                          : step === 2
                          ? "Détails de l'Objectif"
                          : step === 3
                          ? "Échéance & Rythme"
                          : "Synthèse de l'Objectif"
                      }`
                    : `Step ${step} of 4: ${
                        step === 1
                          ? "What's your goal?"
                          : step === 2
                          ? "Goal Details"
                          : step === 3
                          ? "Timeline & Pace"
                          : "Goal Summary"
                      }`}
                </span>
                <span className="text-primary font-bold">{step * 25}%</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i <= step ? "bg-emerald-600 dark:bg-emerald-500" : "bg-secondary"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* STEP 1: CATEGORY SELECTION IN 2-COLUMN GRID (NO CRAMMING) */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-2xl font-extrabold text-foreground">
                  {language === "fr" ? "C'est quoi ton objectif ?" : "What's your goal?"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === "fr"
                    ? "Choisissez un modèle de projet ou définissez un jalon personnalisé."
                    : "Select a goal category or create a custom financial milestone."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 pt-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className="w-full p-4 rounded-2xl border border-border/80 bg-card hover:border-emerald-600 hover:bg-secondary/40 transition-all flex items-center justify-between text-left group shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-3 rounded-2xl border ${cat.iconBg} shrink-0`}>
                        {cat.icon}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {language === "fr" ? cat.nameFr : cat.name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {language === "fr" ? cat.descFr : cat.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: NAME & TARGET AMOUNT */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-2xl font-extrabold text-foreground">
                  {language === "fr" ? "Détails de l'Objectif" : "Goal Details"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === "fr"
                    ? "Précisez le nom du projet et le montant financier cible."
                    : "Specify the exact capital needed and your initial seed reserve."}
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    {language === "fr" ? "Titre de l'Objectif" : "Goal Title"}
                  </label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-secondary/30 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                    placeholder="e.g. Acheter une maison / Lancer une entreprise"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MoneyInput
                    label={language === "fr" ? "Montant Cible Requis" : "Target Amount"}
                    value={targetAmount}
                    onChange={(val) => setTargetAmount(val)}
                    currency={currency}
                  />

                  <MoneyInput
                    label={language === "fr" ? "Épargne Déjà Dédiée" : "Current Amount Saved"}
                    value={currentAmount}
                    onChange={(val) => setCurrentAmount(val)}
                    currency={currency}
                  />
                </div>

                <div className="p-3.5 rounded-2xl border border-border/80 bg-secondary/20 flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">
                    {language === "fr" ? "Capital restant à accumuler :" : "Remaining capital to accumulate:"}
                  </span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCurrency(remainingNeeded, currency)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{language === "fr" ? "Continuer vers l'Étape 3 (Échéance) →" : "Continue to Step 3 (Timeline) →"}</span>
              </button>
            </div>
          )}

          {/* STEP 3: TIMELINE & MONTHS */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-2xl font-extrabold text-foreground">
                  {language === "fr" ? "Échéance & Rythme" : "Timeline & Pace"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === "fr"
                    ? "En combien de mois souhaitez-vous concrétiser cet objectif ?"
                    : "Choose your target timeframe to calculate the required monthly savings rate."}
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-3 p-5 rounded-2xl border border-border/80 bg-secondary/20">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      {language === "fr" ? "Nombre de Mois Cibles" : "Target Months to Goal"}
                    </label>
                    <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {monthsToGoal} {language === "fr" ? "mois" : "months"} ({ (monthsToGoal / 12).toFixed(1)} {language === "fr" ? "ans" : "yrs"})
                    </span>
                  </div>

                  <input
                    type="range"
                    min="3"
                    max="120"
                    step="1"
                    value={monthsToGoal}
                    onChange={(e) => setMonthsToGoal(Number(e.target.value))}
                    className="w-full h-2.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                    <span>3 mois</span>
                    <span>1 an</span>
                    <span>3 ans</span>
                    <span>5 ans</span>
                    <span>10 ans</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-border/80 bg-card space-y-1">
                    <span className="text-[11px] font-mono text-muted-foreground font-bold uppercase tracking-wider block">
                      {language === "fr" ? "Épargne Mensuelle Requise" : "Required Monthly Savings"}
                    </span>
                    <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(monthlySavingsNeeded, currency)}
                      <span className="text-xs text-muted-foreground font-normal"> / mo</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-border/80 bg-card space-y-1">
                    <span className="text-[11px] font-mono text-muted-foreground font-bold uppercase tracking-wider block">
                      {language === "fr" ? "Part du Revenu Mensuel" : "Share of Monthly Income"}
                    </span>
                    <div className="text-xl font-black font-mono text-foreground">
                      {shareOfIncomePercent}%
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{language === "fr" ? "Voir le Récapitulatif (Étape 4) →" : "Review Goal Summary (Step 4) →"}</span>
              </button>
            </div>
          )}

          {/* STEP 4: GOAL SUMMARY & CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl border border-emerald-600/30 bg-emerald-500/5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl border ${selectedCategory.iconBg} shrink-0`}>
                    {selectedCategory.icon}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-foreground">{goalName}</h4>
                    <span className="text-xs text-muted-foreground font-mono font-bold">
                      {language === "fr" ? "Objectif :" : "Target:"} {formatCurrency(targetAmount, currency)}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] uppercase text-muted-foreground block font-bold">Échéance</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{monthsToGoal} mois</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl border border-border bg-card space-y-4 shadow-xs">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  {language === "fr" ? "Synthèse de l'Objectif" : "Goal summary"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                  <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                    <span className="text-[10px] text-muted-foreground block font-sans">
                      {language === "fr" ? "Épargne requise" : "Monthly savings needed"}
                    </span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                      {formatCurrency(monthlySavingsNeeded, currency)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                    <span className="text-[10px] text-muted-foreground block font-sans">
                      {language === "fr" ? "Mois restants" : "Months to destination"}
                    </span>
                    <span className="font-extrabold text-foreground text-base">{monthsToGoal}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                    <span className="text-[10px] text-muted-foreground block font-sans">
                      {language === "fr" ? "Part du revenu" : "Share of income"}
                    </span>
                    <span className="font-extrabold text-foreground text-base">{shareOfIncomePercent}%</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-extrabold transition-all shadow-lg shadow-emerald-800/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{language === "fr" ? "Créer l'Objectif" : "Create Goal"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
