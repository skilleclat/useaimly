"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/date";
import { CurrencyCode } from "@/lib/types/finance";
import { FinancialStatus } from "@/components/design-system/FinancialStatus";
import { Sparkles, Calendar, TrendingUp, CheckCircle2, ArrowRight, Target, Clock, ShieldCheck } from "lucide-react";

interface TrajectoryHeroChartProps {
  goalTitle: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: string; // e.g. "2027-12-31"
  projectedArrivalDate: string; // e.g. "2027-11-15"
  monthlyFreeCashFlow: number;
  currency: CurrencyCode;
}

export function TrajectoryHeroChart({
  goalTitle = "Start my business",
  currentAmount = 180000,
  targetAmount = 500000,
  targetDate = "2027-12-31",
  projectedArrivalDate = "2027-11-15",
  monthlyFreeCashFlow = 68000,
  currency = "KES",
}: TrajectoryHeroChartProps) {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const progressPercentage = Math.min(100, Math.round((currentAmount / targetAmount) * 100));

  // Trajectory simulation points for 24 months
  const totalMonths = 24;
  const monthlyIncrement = (targetAmount - currentAmount) / 16; // Projected arrival at month 16 (Nov 2027)

  const points = Array.from({ length: totalMonths + 1 }, (_, i) => {
    const projectedVal = Math.min(targetAmount * 1.1, currentAmount + i * monthlyIncrement);
    return {
      month: i,
      value: projectedVal,
    };
  });

  // SVG dimensions
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const maxVal = targetAmount * 1.15;

  const getX = (month: number) => paddingX + (month / totalMonths) * chartWidth;
  const getY = (val: number) => height - paddingY - (val / maxVal) * chartHeight;

  // Build SVG path
  const pathD = points.reduce((acc, pt, idx) => {
    const x = getX(pt.month);
    const y = getY(pt.value);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, "");

  // Area path for gradient fill under the curve
  const areaD = `${pathD} L ${getX(totalMonths)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

  // Target horizontal line Y coordinate
  const targetLineY = getY(targetAmount);

  // Current Position Coordinates (Month 0)
  const currentPos = { x: getX(0), y: getY(currentAmount) };

  // Projected Arrival Coordinates (Month 16 - Nov 2027)
  const projectedPos = { x: getX(16), y: getY(targetAmount) };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-7 shadow-xs relative overflow-hidden transition-all">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header: Primary Destination & Trajectory Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground bg-secondary/50 px-2.5 py-0.5 rounded-full font-medium">
              Primary Destination
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{progressPercentage}% Capitalized</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
            {goalTitle}
          </h2>

          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-foreground">
              {formatCurrency(currentAmount, currency)}
            </span>
            <span className="text-xs text-muted-foreground">
              of {formatCurrency(targetAmount, currency)} target
            </span>
          </div>
        </div>

        {/* Status Indicators Pill */}
        <div className="flex flex-col sm:items-end gap-2">
          <FinancialStatus status="ON_TRACK" />
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>
              Target: <strong className="text-foreground">{formatMonthYear(targetDate)}</strong>
            </span>
            <span>•</span>
            <span>
              Projected: <strong className="text-primary font-semibold">{formatMonthYear(projectedArrivalDate)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Trajectory Graph */}
      <div className="relative w-full overflow-x-auto select-none pt-2 z-10">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[640px] overflow-visible">
          <defs>
            <linearGradient id="primaryTrajectoryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Target Milestone Horizontal Reference Line */}
          <line
            x1={paddingX}
            y1={targetLineY}
            x2={width - paddingX}
            y2={targetLineY}
            stroke="currentColor"
            strokeDasharray="4 4"
            className="text-muted-foreground/30"
            strokeWidth="1.5"
          />
          <text
            x={width - paddingX - 4}
            y={targetLineY - 8}
            textAnchor="end"
            className="fill-muted-foreground text-[10px] font-medium"
          >
            Target Milestone: {formatCurrency(targetAmount, currency)}
          </text>

          {/* Area Fill Under Projected Path */}
          <path d={areaD} fill="url(#primaryTrajectoryGradient)" />

          {/* Main Trajectory Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Current Position Marker (Month 0) */}
          <circle
            cx={currentPos.x}
            cy={currentPos.y}
            r="5"
            className="fill-card stroke-primary stroke-[2.5]"
          />
          <text
            x={currentPos.x}
            y={currentPos.y - 12}
            textAnchor="start"
            className="fill-foreground text-[10px] font-semibold"
          >
            Today ({formatCurrency(currentAmount, currency)})
          </text>

          {/* Projected Arrival Point Marker (Nov 2027) */}
          <circle
            cx={projectedPos.x}
            cy={projectedPos.y}
            r="6"
            className="fill-primary stroke-card stroke-[2]"
          />
          <text
            x={projectedPos.x}
            y={projectedPos.y - 14}
            textAnchor="middle"
            className="fill-primary text-[11px] font-bold"
          >
            Arrival: {formatMonthYear(projectedArrivalDate)} (1 mo ahead)
          </text>

          {/* X Axis Time Labels */}
          <text x={getX(0)} y={height - 8} className="fill-muted-foreground text-[10px]">
            Today
          </text>
          <text x={getX(6)} y={height - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
            6 Months
          </text>
          <text x={getX(12)} y={height - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
            12 Months
          </text>
          <text x={getX(16)} y={height - 8} textAnchor="middle" className="fill-primary text-[10px] font-bold">
            Nov 2027
          </text>
          <text x={getX(24)} y={height - 8} textAnchor="end" className="fill-muted-foreground text-[10px]">
            24 Months
          </text>
        </svg>
      </div>

      {/* Bottom Trajectory Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/60 text-xs">
        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 space-y-0.5">
          <span className="text-muted-foreground text-xs font-medium block">Current Savings Pace</span>
          <span className="text-sm font-bold text-foreground">{formatCurrency(45000, currency)} / mo</span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-0.5">
          <span className="text-xs font-medium block">Timeline Margin</span>
          <span className="text-sm font-bold">1 Month Ahead of Schedule</span>
        </div>

        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 space-y-0.5">
          <span className="text-muted-foreground text-xs font-medium block">Remaining Shortfall</span>
          <span className="text-sm font-bold text-foreground">{formatCurrency(targetAmount - currentAmount, currency)}</span>
        </div>
      </div>
    </div>
  );
}
