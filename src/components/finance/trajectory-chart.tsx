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

interface TrajectoryChartProps {
  data: TrajectoryPoint[];
  targetAmount: number;
  currency?: string;
  goalTitle: string;
}

export function TrajectoryChart({
  data,
  targetAmount,
  currency = "KES",
  goalTitle,
}: TrajectoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No trajectory data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-300 font-medium">Baseline Plan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="text-slate-300 font-medium">Simulated Decision</span>
          </div>
        </div>
        <div className="text-slate-400 font-mono">
          Target: <span className="text-emerald-400 font-semibold">{formatCurrency(targetAmount, currency as any, { compact: true })}</span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="simulatedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              interval={5}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              tickFormatter={(val) => formatCurrency(val, currency as any, { compact: true })}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const baselineVal = payload.find((p) => p.dataKey === "baselineGoalProgress")?.value as number;
                  const simVal = payload.find((p) => p.dataKey === "simulatedGoalProgress")?.value as number;

                  return (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs">
                      <div className="font-semibold text-slate-200 mb-1.5">{label}</div>
                      <div className="flex items-center justify-between gap-4 text-emerald-400">
                        <span>Baseline Goal Capital:</span>
                        <span className="font-mono font-medium">
                          {formatCurrency(baselineVal || 0, currency as any)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-amber-300 mt-1">
                        <span>Simulated Goal Capital:</span>
                        <span className="font-mono font-medium">
                          {formatCurrency(simVal || 0, currency as any)}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Target line */}
            <ReferenceLine
              y={targetAmount}
              stroke="#059669"
              strokeDasharray="3 3"
              label={{
                value: `Target: ${formatCurrency(targetAmount, currency as any, { compact: true })}`,
                fill: "#10B981",
                fontSize: 10,
                position: "top",
              }}
            />

            {/* Baseline trajectory area */}
            <Area
              type="monotone"
              dataKey="baselineGoalProgress"
              name="Baseline Plan"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#baselineGradient)"
            />

            {/* Simulated trajectory area */}
            <Area
              type="monotone"
              dataKey="simulatedGoalProgress"
              name="Simulated Decision"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#simulatedGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
