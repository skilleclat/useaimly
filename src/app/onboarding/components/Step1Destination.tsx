"use client";

import React, { useState } from "react";
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
  const [selectedKey, setSelectedKey] = useState<string>(destination.presetKey || "start-business");

  const handleSelectPreset = (preset: DestinationPreset) => {
    setSelectedKey(preset.key);
    const calculatedDate = formatDateToISO(addMonths(new Date(), preset.defaultMonthsAhead));
    onChange({
      ...destination,
      presetKey: preset.key,
      title: preset.key === "custom" ? "" : preset.title,
      description: preset.description,
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
    <div className="space-y-8 animate-fadeIn">
      {/* Editorial Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1: Your Anchor Destination</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-foreground tracking-tight leading-tight">
          What do you want your money to achieve?
        </h2>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Before looking at budgets or income, Useaimly begins with your destination. Every future spending decision is evaluated against this goal.
        </p>
      </div>

      {/* Preset Destination Grid */}
      <div className="space-y-3">
        <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider block">
          Choose a Destination or Custom Goal
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {DESTINATION_PRESETS.map((preset) => {
            const isSelected = selectedKey === preset.key;
            const icon = ICON_MAP[preset.iconName] || <Compass className="w-5 h-5" />;

            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 h-28 ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-primary shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:bg-secondary/40 text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={isSelected ? "text-primary" : "text-muted-foreground"}>
                    {icon}
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground">
                    {preset.tag}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold font-editorial leading-tight line-clamp-1">
                    {preset.title}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Destination Detail Form */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-elevation-1">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block">
              Destination Title / Name
            </label>
            <input
              type="text"
              value={destination.title}
              onChange={(e) => onChange({ ...destination, title: e.target.value })}
              placeholder="e.g. Start my consultancy & digital studio"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MoneyInput
              label="Target Capital Needed"
              value={destination.targetAmount}
              onChange={(amt) => onChange({ ...destination, targetAmount: amt })}
              currency={currency}
              stepPresets={[250000, 500000, 1000000, 2000000]}
            />

            <MoneyInput
              label="Money Already Saved Toward This"
              value={destination.currentAmount}
              onChange={(amt) => onChange({ ...destination, currentAmount: amt })}
              currency={currency}
              stepPresets={[0, 50000, 100000, 250000]}
            />
          </div>

          {/* Target Date with Quick Timeline Helpers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground block">
                Target Destination Date
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickMonths(12)}
                  className="rounded-lg border border-border bg-secondary/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:text-foreground"
                >
                  +1 Year
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickMonths(24)}
                  className="rounded-lg border border-border bg-secondary/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:text-foreground"
                >
                  +2 Years
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickMonths(36)}
                  className="rounded-lg border border-border bg-secondary/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:text-foreground"
                >
                  +3 Years
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="date"
                value={destination.targetDate}
                onChange={(e) => onChange({ ...destination, targetDate: e.target.value })}
                className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={!isValid}
            onClick={onNext}
            className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-bold text-primary-foreground hover:opacity-95 shadow-sm transition-all disabled:opacity-50"
          >
            <span>Next: Where You Are</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
