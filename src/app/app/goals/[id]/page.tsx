"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { INITIAL_DESTINATIONS, DestinationItem } from "@/lib/destinations/destinations-data";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear, formatDateToISO } from "@/lib/utils/date";
import { CurrencyCode } from "@/lib/types/finance";
import { FinancialStatus } from "@/components/design-system/FinancialStatus";
import { MoneyInput } from "@/components/design-system/MoneyInput";
import {
  Compass,
  ArrowLeft,
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Pause,
  Play,
  CheckCircle2,
  Archive,
  Edit3,
  History,
  Check,
  X,
  Layers,
} from "lucide-react";

export default function SingleDestinationPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { currency } = useCurrency();

  const destinationId = params?.id as string;

  // Find destination or fallback to first
  const initialDest =
    INITIAL_DESTINATIONS.find((d) => d.id === destinationId) || INITIAL_DESTINATIONS[0];

  const [destination, setDestination] = useState<DestinationItem>(initialDest);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Edit Form State
  const [editTitle, setEditTitle] = useState(destination.name);
  const [editTargetAmount, setEditTargetAmount] = useState(destination.targetAmount);
  const [editMonthlyContribution, setEditMonthlyContribution] = useState(destination.monthlyContribution);
  const [editTargetDate, setEditTargetDate] = useState(destination.targetDate);

  const progressPercent = Math.min(
    100,
    Math.round((destination.currentAmount / destination.targetAmount) * 100)
  );

  const handleTogglePause = () => {
    const isPaused = !destination.isPaused;
    setDestination({
      ...destination,
      isPaused,
      status: isPaused ? "AT_RISK" : "ON_TRACK",
    });
    setActionNotice(isPaused ? "Monthly allocation paused." : "Monthly allocation resumed.");
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleMarkCompleted = () => {
    setDestination({
      ...destination,
      status: "COMPLETED",
      currentAmount: destination.targetAmount,
    });
    setActionNotice("Destination marked as completed! Milestone archived.");
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleArchive = () => {
    setDestination({
      ...destination,
      isArchived: true,
    });
    setActionNotice("Destination archived.");
    setTimeout(() => {
      router.push("/app/goals");
    }, 1500);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setDestination({
      ...destination,
      name: editTitle,
      targetAmount: editTargetAmount,
      monthlyContribution: editMonthlyContribution,
      targetDate: editTargetDate,
    });
    setShowEditModal(false);
    setActionNotice("Destination parameters updated.");
    setTimeout(() => setActionNotice(null), 3500);
  };

  // SVG Trajectory Chart calculation
  const totalMonths = 24;
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;
  const maxVal = destination.targetAmount * 1.15;

  const getX = (m: number) => paddingX + (m / totalMonths) * chartW;
  const getY = (v: number) => svgHeight - paddingY - (v / maxVal) * chartH;

  const points = Array.from({ length: totalMonths + 1 }, (_, m) => ({
    m,
    v: Math.min(
      destination.targetAmount * 1.1,
      destination.currentAmount + m * destination.monthlyContribution
    ),
  }));

  const pathD = points.reduce((acc, pt, idx) => {
    const x = getX(pt.m);
    const y = getY(pt.v);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, "");

  const areaD = `${pathD} L ${getX(totalMonths)} ${svgHeight - paddingY} L ${getX(0)} ${svgHeight - paddingY} Z`;

  return (
    <div className="max-w-7xl 2xl:max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* Back Link & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/goals"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Destinations</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {destination.priority === "HIGH" ? "High Priority" : destination.priority === "MEDIUM" ? "Medium Priority" : "Low Priority"}
          </span>
          <FinancialStatus status={destination.status} variant="badge" />
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header & Destination Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border/60 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Compass className="w-4 h-4" />
            <span>Destination Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
            {destination.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed font-medium">
            {destination.notes || "Financial horizon managed by UseAimly."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-all shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={handleTogglePause}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all shadow-xs ${
              destination.isPaused
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-border/80 bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {destination.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{destination.isPaused ? "Resume" : "Pause"}</span>
          </button>

          <button
            type="button"
            onClick={handleMarkCompleted}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:border-emerald-500/40 hover:text-emerald-600 transition-all shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Complete</span>
          </button>

          <button
            type="button"
            onClick={handleArchive}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:border-rose-500/40 hover:text-rose-500 transition-all shadow-xs"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive</span>
          </button>
        </div>
      </div>

      {/* CORE PROGRESS & TARGET POSITION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Accumulated Capital */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-2 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground block">
            Accumulated Capital
          </span>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(destination.currentAmount, currency)}
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium block">
            {progressPercent}% of {formatCurrency(destination.targetAmount, currency)}
          </span>
        </div>

        {/* Monthly Contribution Pace */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-2 shadow-xs">
          <span className="text-xs font-semibold text-primary block">
            Monthly Contribution
          </span>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(destination.monthlyContribution, currency)}
          </div>
          <span className="text-xs text-primary/80 font-medium block">
            Active monthly velocity
          </span>
        </div>

        {/* Projected Arrival */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-2 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground block">
            Projected Arrival
          </span>
          <div className="text-xl sm:text-2xl font-bold text-foreground">
            {formatMonthYear(destination.projectedCompletionDate)}
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
            1 month ahead of deadline
          </span>
        </div>

        {/* Target Deadline */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-2 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground block">
            Target Deadline
          </span>
          <div className="text-xl sm:text-2xl font-bold text-foreground">
            {formatMonthYear(destination.targetDate)}
          </div>
          <span className="text-xs text-muted-foreground font-medium block">
            Planned milestone horizon
          </span>
        </div>
      </div>

      {/* TRAJECTORY ACCUMULATION VISUALIZER */}
      <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-muted-foreground block">
              Trajectory Projection
            </span>
            <div className="text-sm font-bold text-foreground">
              Month-by-month accumulation curve toward {formatCurrency(destination.targetAmount, currency)}
            </div>
          </div>
          <span className="text-xs text-primary font-bold">
            +{formatCurrency(destination.monthlyContribution, currency)} / month
          </span>
        </div>

        <div className="w-full h-48 sm:h-56 relative bg-background/50 rounded-xl border border-border/80 p-2 overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="destGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Target line */}
            <line
              x1={paddingX}
              y1={getY(destination.targetAmount)}
              x2={svgWidth - paddingX}
              y2={getY(destination.targetAmount)}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.4"
            />
            <text
              x={paddingX + 8}
              y={getY(destination.targetAmount) - 6}
              fill="hsl(var(--muted-foreground))"
              fontSize="10"
              fontFamily="sans-serif"
            >
              Cap Target: {formatCurrency(destination.targetAmount, currency)}
            </text>

            <path d={areaD} fill="url(#destGrad)" />
            <path
              d={pathD}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Current Position Dot */}
            <circle
              cx={getX(0)}
              cy={getY(destination.currentAmount)}
              r="5"
              fill="hsl(var(--primary))"
            />

            {/* Arrival Dot */}
            <circle
              cx={getX(16)}
              cy={getY(destination.targetAmount)}
              r="6.5"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--card))"
              strokeWidth="2"
            />
            <text
              x={getX(16)}
              y={getY(destination.targetAmount) - 12}
              textAnchor="middle"
              fill="hsl(var(--primary))"
              fontSize="11"
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              Arrival ({formatMonthYear(destination.projectedCompletionDate)})
            </text>
          </svg>
        </div>
      </div>

      {/* TWO COLUMN LOWER SECTION: DECISIONS AFFECTING DESTINATION & UPCOMING RISKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DECISIONS AFFECTING THE DESTINATION */}
        <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-muted-foreground block">
                Historical Decision Impacts
              </span>
              <h3 className="text-base font-bold text-foreground">
                Decisions affecting this destination
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {destination.decisionsAffecting.length > 0 ? (
              destination.decisionsAffecting.map((dec) => (
                <div
                  key={dec.id}
                  className="p-4 rounded-xl border border-border/80 bg-background space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{dec.title}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        dec.impactType === "POSITIVE"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {dec.shiftDays > 0 ? `+${dec.shiftDays} Days Shift` : `${dec.shiftDays} Days Faster`}
                    </span>
                  </div>
                  <div className="text-muted-foreground leading-relaxed font-medium">
                    {dec.description}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium pt-1">
                    {dec.date} • {formatCurrency(dec.amount, currency)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground font-medium">
                No past decision has affected this destination yet.
              </p>
            )}
          </div>
        </div>

        {/* UPCOMING RISKS & STRESS FACTORS */}
        <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-muted-foreground block">
                Risk Monitoring
              </span>
              <h3 className="text-base font-bold text-foreground">
                Upcoming risks & stress factors
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {destination.upcomingRisks.map((risk, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border/80 bg-background space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>{risk.title}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      risk.severity === "HIGH"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {risk.severity === "HIGH" ? "High Severity" : "Medium Severity"}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed font-medium">{risk.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTRIBUTION HISTORY LEDGER */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-border/60 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-muted-foreground block">
              Capital Ledger
            </span>
            <h3 className="text-lg font-bold text-foreground">
              Contribution history
            </h3>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {destination.contributionHistory.length} deposits recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-secondary/30 text-xs font-semibold text-muted-foreground">
              <tr>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Funding Source</th>
                <th className="py-3 px-6">Contribution Amount</th>
                <th className="py-3 px-6 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {destination.contributionHistory.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="py-3.5 px-6 text-muted-foreground">{item.date}</td>
                  <td className="py-3.5 px-6 font-bold text-foreground">{item.source}</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(item.amount, currency)}
                  </td>
                  <td className="py-3.5 px-6 text-right font-bold text-foreground">
                    {formatCurrency(item.balanceAfter, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT DESTINATION MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-3 sm:p-4 pt-6 sm:pt-4 animate-fadeIn overflow-y-auto">
          <div className="max-w-md w-full rounded-2xl border border-border/80 bg-card p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
              <h3 className="text-xl font-bold text-foreground">
                Edit Destination Parameters
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg border border-border/80 bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Destination Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-xs sm:text-sm font-medium text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <MoneyInput
                label="Target Amount"
                value={editTargetAmount}
                onChange={(val) => setEditTargetAmount(val)}
                currency={currency}
              />

              <MoneyInput
                label="Monthly Contribution"
                value={editMonthlyContribution}
                onChange={(val) => setEditMonthlyContribution(val)}
                currency={currency}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Target Date
                </label>
                <input
                  type="date"
                  required
                  value={editTargetDate}
                  onChange={(e) => setEditTargetDate(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-xl border border-border/80 bg-secondary/50 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 shadow-xs transition-opacity"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
