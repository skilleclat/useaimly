"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { OnboardingDestination } from "@/lib/onboarding/onboarding-types";
import { DESTINATION_PRESETS, DestinationPreset } from "@/lib/onboarding/onboarding-presets";
import { CurrencyCode } from "@/lib/types/finance";
import { MoneyInput } from "@/components/design-system/MoneyInput";
import { addMonths, formatDateToISO } from "@/lib/utils/date";
import {
  Briefcase,
  Shield,
  Car,
  Home,
  GraduationCap,
  TrendingDown,
  Plane,
  PiggyBank,
  LineChart,
  Compass,
  ArrowRight,
  Sparkles,
  Calendar,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
  Car: <Car className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  TrendingDown: <TrendingDown className="w-5 h-5" />,
  Plane: <Plane className="w-5 h-5" />,
  PiggyBank: <PiggyBank className="w-5 h-5" />,
  LineChart: <LineChart className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
};

interface Step1DestinationProps {
  destination: OnboardingDestination;
  currency: CurrencyCode;
  onChange: (updated: OnboardingDestination) => void;
  onNext: () => void;
}

export function Step1Destination({ destination, currency, onChange, onNext }: Step1DestinationProps) {
  const { language } = useI18n();
  const [selectedKey, setSelectedKey] = useState<string>(destination.presetKey || "start-business");

  const handleSelectPreset = (preset: DestinationPreset) => {
    setSelectedKey(preset.key);
    const calculatedDate = formatDateToISO(addMonths(new Date(), preset.defaultMonthsAhead));
    const titleText =
      preset.key === "custom"
        ? ""
        : language === "fr"
        ? preset.titleFr
        : preset.title;

    const descText = language === "fr" ? preset.descriptionFr : preset.description;

    onChange({
      ...destination,
      presetKey: preset.key,
      title: titleText,
      description: descText,
      category: preset.category,
      targetAmount: destination.targetAmount > 0 ? destination.targetAmount : preset.defaultAmount,
      targetDate: destination.targetDate || calculatedDate,
      priority: preset.priority,
    });
  };

  const handleQuickMonths = (monthsAhead: number) => {
    const newDate = formatDateToISO(addMonths(new Date(), monthsAhead));
    onChange({ ...destination, targetDate: newDate });
  };

  const isValid = destination.title.trim().length > 0 && destination.targetAmount > 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Editorial Header */}
      <div className="space-y-2 text-left">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === "fr" ? "Étape 1 : Destination Ancre" : "Step 1: Anchor Destination"}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight leading-tight">
          {language === "fr" ? "C'est quoi votre objectif ?" : "What do you want your money to achieve?"}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
          {language === "fr"
            ? "UseAimly commence par votre destination. Chaque décision financière future est évaluée par rapport à cet objectif."
            : "UseAimly begins with your destination. Every future spending choice is evaluated against this goal."}
        </p>
      </div>

      {/* Preset Destination Grid (Tactile Touch Cards on Mobile) */}
      <div className="space-y-3">
        <label className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
          {language === "fr" ? "Sélectionnez votre objectif de vie" : "Select Your Life Goal"}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {DESTINATION_PRESETS.map((preset) => {
            const isSelected = selectedKey === preset.key;
            const icon = ICON_MAP[preset.iconName] || <Compass className="w-5 h-5" />;
            const title = language === "fr" ? preset.titleFr : preset.title;
            const tag = language === "fr" ? preset.tagFr : preset.tag;

            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 min-h-[110px] cursor-pointer ${
                  isSelected
                    ? "border-2 border-primary bg-primary/10 ring-4 ring-primary/15 text-primary shadow-lg shadow-orange-500/15"
                    : "border-border/80 bg-card hover:border-primary/40 hover:bg-secondary/40 text-foreground shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${isSelected ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                    {icon}
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-secondary/80 text-muted-foreground font-semibold">
                    {tag}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold font-editorial leading-snug line-clamp-2">
                    {title}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Destination Detail Form */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              {language === "fr" ? "Titre de l'Objectif / Nom du Projet" : "Destination Title / Goal Name"}
            </label>
            <input
              type="text"
              value={destination.title}
              onChange={(e) => onChange({ ...destination, title: e.target.value })}
              placeholder={language === "fr" ? "ex: Lancer mon entreprise / Acheter une maison / Voyager" : "e.g. Start my business / Buy a home / Travel"}
              className="w-full rounded-2xl border border-border/80 bg-background px-4 py-3 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <MoneyInput
              label={language === "fr" ? "Montant Total Requis" : "Target Capital Needed"}
              value={destination.targetAmount}
              onChange={(amt) => onChange({ ...destination, targetAmount: amt })}
              currency={currency}
              stepPresets={[250000, 500000, 1000000, 2000000]}
            />

            <MoneyInput
              label={language === "fr" ? "Épargne Déjà Dédiée à ce Projet" : "Money Already Saved Toward This"}
              value={destination.currentAmount}
              onChange={(amt) => onChange({ ...destination, currentAmount: amt })}
              currency={currency}
              stepPresets={[0, 50000, 100000, 250000]}
            />
          </div>

          {/* Target Date with Quick Timeline Helpers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>{language === "fr" ? "Date Cible d'Arrivée" : "Target Arrival Date"}</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickMonths(12)}
                  className="rounded-lg border border-border/80 bg-secondary/60 px-2.5 py-1 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer"
                >
                  +1 {language === "fr" ? "An" : "Year"}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickMonths(24)}
                  className="rounded-lg border border-border/80 bg-secondary/60 px-2.5 py-1 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer"
                >
                  +2 {language === "fr" ? "Ans" : "Years"}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickMonths(36)}
                  className="rounded-lg border border-border/80 bg-secondary/60 px-2.5 py-1 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer"
                >
                  +3 {language === "fr" ? "Ans" : "Years"}
                </button>
              </div>
            </div>
            <input
              type="date"
              value={destination.targetDate}
              onChange={(e) => onChange({ ...destination, targetDate: e.target.value })}
              className="w-full rounded-2xl border border-border/80 bg-background px-4 py-3 text-sm font-mono font-semibold text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 cursor-pointer min-h-[44px]"
            />
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={!isValid}
            onClick={onNext}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] px-7 py-3.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:opacity-95 transition-all disabled:opacity-50 min-h-[44px] cursor-pointer"
          >
            <span>{language === "fr" ? "Continuer : Vos Revenus & Charges →" : "Next: Where You Are →"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
