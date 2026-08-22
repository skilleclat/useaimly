"use client";

import React from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import { useCurrency } from "@/lib/currency/currency-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { ShieldAlert, Briefcase, Home, Plus, Target, ArrowRight, ChevronRight } from "lucide-react";

interface GoalItemSummary {
  id: string;
  name: string;
  category: string;
  currentAmount: number;
  targetAmount: number;
  status: "ON_TRACK" | "NEEDS_ATTENTION" | "OFF_TRACK" | "COMPLETED";
  statusLabel?: string;
  icon?: React.ReactNode;
  iconBg?: string;
}

interface GoalProgressHeroWidgetProps {
  userName?: string;
  currency?: CurrencyCode;
  goals?: GoalItemSummary[];
  onOpenCreateWizard?: () => void;
}

const DEFAULT_HERO_GOALS: GoalItemSummary[] = [
  {
    id: "hg-1",
    name: "Emergency Fund",
    category: "EMERGENCY",
    currentAmount: 18000,
    targetAmount: 20000,
    status: "ON_TRACK",
    statusLabel: "On track",
    icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
    iconBg: "bg-rose-500/10",
  },
  {
    id: "hg-2",
    name: "Start a Business",
    category: "BUSINESS",
    currentAmount: 3400,
    targetAmount: 10000,
    status: "NEEDS_ATTENTION",
    statusLabel: "Needs attention",
    icon: <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    iconBg: "bg-emerald-500/10",
  },
  {
    id: "hg-3",
    name: "Buy a Home",
    category: "HOME",
    currentAmount: 260000,
    targetAmount: 500000,
    status: "ON_TRACK",
    statusLabel: "On track",
    icon: <Home className="w-5 h-5 text-amber-500" />,
    iconBg: "bg-amber-500/10",
  },
];

export function GoalProgressHeroWidget({
  userName = "Kimberley",
  currency: propCurrency,
  goals = DEFAULT_HERO_GOALS,
  onOpenCreateWizard,
}: GoalProgressHeroWidgetProps) {
  const { currency: globalCurrency, format } = useCurrency();
  const { t } = useI18n();
  const activeCurrency = propCurrency || globalCurrency;

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallPercent = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  // Donut SVG circumference calculation
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercent / 100) * circumference;

  return (
    <div className="rounded-[2.5rem] border border-border/70 bg-card p-6 sm:p-8 space-y-6 shadow-sm font-sans animate-fadeIn">
      {/* User Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            {t("greetingPrefix")} {userName} 👋
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {t("heroSubtitle")}
          </p>
        </div>

        {onOpenCreateWizard && (
          <button
            onClick={onOpenCreateWizard}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("createGoal")}</span>
          </button>
        )}
      </div>

      {/* Progress Donut & Totals Card */}
      <div className="rounded-3xl border border-border/80 bg-secondary/30 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Circular Donut Ring */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-secondary stroke-current"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-emerald-600 dark:text-emerald-400 stroke-current transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold font-mono text-foreground">{overallPercent}%</span>
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">{t("progress")}</span>
            </div>
          </div>

          <div className="space-y-2 text-left">
            <div>
              <span className="text-[11px] font-mono text-muted-foreground font-bold uppercase tracking-wider block">
                {t("totalSaved")}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
                {format(totalSaved)}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono text-muted-foreground font-bold uppercase tracking-wider block">
                {t("totalTargetGoals")}
              </span>
              <div className="text-sm font-bold font-mono text-muted-foreground">
                {format(totalTarget)}
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/app/goals"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border/80 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
        >
          <span>View All Goals ({goals.length})</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      </div>

      {/* Active Goals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            My Active Goals ({goals.length})
          </h3>
        </div>

        <div className="space-y-3">
          {goals.map((g) => {
            const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
            const statusBadge =
              g.status === "ON_TRACK"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                : g.status === "NEEDS_ATTENTION"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20";

            return (
              <div
                key={g.id}
                className="p-4 rounded-2xl border border-border/70 bg-card hover:border-border transition-all space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${g.iconBg || "bg-secondary"} shrink-0`}>
                      {g.icon || <Flag className="w-5 h-5 text-emerald-600" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{g.name}</h4>
                      <span className="text-xs text-muted-foreground font-mono">
                        {format(g.currentAmount)} of {format(g.targetAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge}`}>
                      {g.statusLabel || (g.status === "ON_TRACK" ? t("onTrack") : t("needsAttention"))}
                    </span>
                    <span className="text-xs font-extrabold font-mono text-foreground">{pct}%</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden border border-border/40 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      g.status === "ON_TRACK" ? "bg-emerald-600" : "bg-amber-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
