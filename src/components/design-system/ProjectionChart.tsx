"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrajectoryPoint } from "@/lib/types/decision";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

export interface ProjectionChartProps {
  data: TrajectoryPoint[];
  targetAmount?: number;
  currency?: string;
  className?: string;
}

export function ProjectionChart({
  data,
  targetAmount,
  currency = "KES",
  className,
}: ProjectionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm font-medium">
        No trajectory projections available
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Legend & Target Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
            <span className="text-foreground font-medium">Baseline Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="text-foreground font-medium">Simulated Decision</span>
          </div>
        </div>

        {targetAmount && (
          <div className="text-muted-foreground font-mono">
            Destination:{" "}
            <span className="text-primary font-bold">
              {formatCurrency(targetAmount, currency as any, { compact: true })}
            </span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="UseaimlyBaselineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="UseaimlySimGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D97706" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              interval={5}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickFormatter={(val) => formatCurrency(val, currency as any, { compact: true })}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const baselineVal = payload.find((p) => p.dataKey === "baselineGoalProgress")?.value as number;
                  const simVal = payload.find((p) => p.dataKey === "simulatedGoalProgress")?.value as number;

                  return (
                    <div className="rounded-2xl border border-border bg-popover/95 p-3.5 shadow-elevation-3 backdrop-blur-md text-xs space-y-1.5">
                      <div className="font-editorial font-bold text-foreground">{label}</div>
                      <div className="flex items-center justify-between gap-4 text-primary">
                        <span>Baseline Goal Capital:</span>
                        <span className="font-financial font-bold">
                          {formatCurrency(baselineVal || 0, currency as any)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-amber-600 dark:text-amber-300">
                        <span>With Decision:</span>
                        <span className="font-financial font-bold">
                          {formatCurrency(simVal || 0, currency as any)}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {targetAmount && (
              <ReferenceLine
                y={targetAmount}
                stroke="hsl(var(--primary))"
                strokeDasharray="4 4"
                label={{
                  value: `Target: ${formatCurrency(targetAmount, currency as any, { compact: true })}`,
                  fill: "hsl(var(--primary))",
                  fontSize: 10,
                  position: "top",
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="baselineGoalProgress"
              name="Baseline Path"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#UseaimlyBaselineGrad)"
            />

            <Area
              type="monotone"
              dataKey="simulatedGoalProgress"
              name="Simulated Decision"
              stroke="#D97706"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#UseaimlySimGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
