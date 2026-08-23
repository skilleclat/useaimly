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
    iconBg: "bg-amber-500/10",
    defaultTarget: 500000,
  },
  {
    id: "cat-business",
    name: "Start a business",
    nameFr: "Lancer une entreprise",
    desc: "Startup capital, equipment, initial inventory",
    descFr: "Capital de départ, équipements, trésorerie",
    icon: <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    iconBg: "bg-emerald-500/10",
    defaultTarget: 300000,
  },
  {
    id: "cat-emergency",
    name: "Emergency fund",
    nameFr: "Fonds d'urgence",
    desc: "3-6 months of expenses for security",
    descFr: "3 à 6 mois de charges fixes de sécurité",
    icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
    iconBg: "bg-rose-500/10",
    defaultTarget: 150000,
  },
  {
    id: "cat-trip",
    name: "Dream trip",
    nameFr: "Voyager / Séjour de rêve",
    desc: "Vacation, honeymoon, adventure travel",
    descFr: "Vacances, voyage à l'étranger, expédition",
    icon: <Plane className="w-5 h-5 text-blue-500" />,
    iconBg: "bg-blue-500/10",
    defaultTarget: 100000,
  },
  {
    id: "cat-edu",
    name: "Education",
    nameFr: "Formation & Éducation",
    desc: "Degree, certification, skills training",
    descFr: "Diplôme, formation continue, compétences",
    icon: <GraduationCap className="w-5 h-5 text-purple-500" />,
    iconBg: "bg-purple-500/10",
    defaultTarget: 200000,
  },
  {
    id: "cat-car",
    name: "Buy a car",
    nameFr: "Acheter une voiture / véhicule",
    desc: "Vehicle purchase or deposit",
    descFr: "Achat automobile ou premier versement",
    icon: <Car className="w-5 h-5 text-indigo-500" />,
    iconBg: "bg-indigo-500/10",
    defaultTarget: 250000,
  },
  {
    id: "cat-other",
    name: "Other goal",
    nameFr: "Autre projet personnel",
    desc: "Custom life target or reserve",
    descFr: "Objectif sur-mesure ou réserve de vie",
    icon: <Flag className="w-5 h-5 text-emerald-600" />,
    iconBg: "bg-emerald-500/10",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      {/* Centered Classic Modal Box */}
      <div className="relative w-full max-w-lg mx-auto rounded-3xl sm:rounded-[2.5rem] border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Header & Step Progress Line Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => (step > 1 ? setStep((s) => (s - 1) as any) : onClose())}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-foreground">
              {language === "fr" ? "Créer un Objectif" : "Create a Goal"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="w-5 h-4" />
            </button>
          </div>

          {/* 4 Step Segmented Bar */}
          <div className="space-y-1">
            <div className="text-xs font-mono font-semibold text-muted-foreground">
              {language === "fr" ? `Étape ${step} sur 4` : `Step ${step} of 4`}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i <= step ? "bg-emerald-700 dark:bg-emerald-500" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-extrabold text-foreground">
              {language === "fr" ? "C'est quoi ton objectif ?" : "What's your goal?"}
            </h2>

            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className="w-full p-4 rounded-2xl border border-border/70 bg-card hover:border-emerald-600/50 hover:bg-secondary/30 transition-all flex items-center justify-between text-left group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-3 rounded-2xl ${cat.iconBg} shrink-0`}>
                      {cat.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {language === "fr" ? cat.nameFr : cat.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {language === "fr" ? cat.descFr : cat.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: NAME & TARGET AMOUNT */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-extrabold text-foreground">
              {language === "fr" ? "Détails de l'Objectif" : "Goal Details"}
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">
                  {language === "fr" ? "Titre de l'Objectif" : "Goal Title"}
                </label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-secondary/40 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  required
                />
              </div>

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

            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer"
            >
              {language === "fr" ? "Continuer vers l'Étape 3 →" : "Continue to Step 3"}
            </button>
          </div>
        )}

        {/* STEP 3: TIMELINE & MONTHS */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <h2 className="text-xl font-extrabold text-foreground">
              {language === "fr" ? "Échéance & Rythme" : "Timeline & Pace"}
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">
                  {language === "fr" ? "Nombre de Mois Cibles" : "Target Months to Goal"}
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={monthsToGoal}
                  onChange={(e) => setMonthsToGoal(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-secondary/40 text-sm font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  required
                />
                <span className="text-[11px] text-muted-foreground block font-mono">
                  {language === "fr"
                    ? `Environ ${(monthsToGoal / 12).toFixed(1)} an(s) d'horizon`
                    : `Approx. ${(monthsToGoal / 12).toFixed(1)} years timeline`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer"
            >
              {language === "fr" ? "Voir le Récapitulatif →" : "Review Goal Summary"}
            </button>
          </div>
        )}

        {/* STEP 4: GOAL SUMMARY & CONFIRMATION */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Goal Preview Header */}
            <div className="p-4 rounded-2xl border border-border/80 bg-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${selectedCategory.iconBg} shrink-0`}>
                  {selectedCategory.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{goalName}</h4>
                  <span className="text-xs text-muted-foreground font-mono font-bold">
                    {formatCurrency(targetAmount, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Goal Summary Metrics Card */}
            <div className="p-5 rounded-3xl border border-border bg-card space-y-4 shadow-xs">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                {language === "fr" ? "Synthèse de l'objectif" : "Goal summary"}
              </h3>

              <div className="space-y-3 font-mono">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-sans">
                    {language === "fr" ? "Épargne mensuelle requise" : "Monthly savings needed"}
                  </span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-base">
                    {formatCurrency(monthlySavingsNeeded, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-sans">
                    {language === "fr" ? "Mois restants" : "Months to goal"}
                  </span>
                  <span className="font-bold text-foreground">{monthsToGoal}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-sans">
                    {language === "fr" ? "Part du revenu mensuel" : "Share of monthly income"}
                  </span>
                  <span className="font-bold text-foreground">{shareOfIncomePercent}%</span>
                </div>
              </div>
            </div>

            {/* Large Forest Green Create Goal Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-extrabold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{language === "fr" ? "Créer l'Objectif" : "Create Goal"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
