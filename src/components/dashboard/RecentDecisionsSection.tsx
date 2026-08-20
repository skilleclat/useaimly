"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { FinancialStatus } from "@/components/design-system/FinancialStatus";
import { History, ArrowUpRight } from "lucide-react";

interface DecisionItem {
  id: string;
  decision: string;
  category: string;
  amount: number;
  impact: string;
  result: "SAFE" | "MANAGEABLE" | "HIGH_IMPACT" | "OFF_TRACK";
  date: string;
}

const RECENT_DECISIONS: DecisionItem[] = [
  {
    id: "dec-1",
    decision: "Ergonomic Studio Workstation",
    category: "Equipment",
    amount: 35000,
    impact: "Shifted target arrival by +12 days; preserved 3-month living buffer.",
    result: "SAFE",
    date: "Aug 14, 2026",
  },
  {
    id: "dec-2",
    decision: "Annual Cloud Workspace License",
    category: "Software",
    amount: 18000,
    impact: "Deducted from operating liquidity; zero shift in primary destination arrival.",
    result: "SAFE",
    date: "Aug 02, 2026",
  },
  {
    id: "dec-3",
    decision: "Weekend Safari Retreat",
    category: "Leisure",
    amount: 45000,
    impact: "Shifted arrival by +28 days; required +KES 2,400/mo to restore November 2027 arrival.",
    result: "MANAGEABLE",
    date: "Jul 22, 2026",
  },
];

export function RecentDecisionsSection({ currency = "KES" }: { currency: CurrencyCode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-editorial text-foreground tracking-tight">
            Recent decisions
          </h3>
          <p className="text-xs text-muted-foreground">
            A history of evaluated spending and their deterministic consequences.
          </p>
        </div>

        <span className="text-xs font-mono text-muted-foreground">
          3 decisions simulated
        </span>
      </div>

      {/* Decision Table / Cards */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-elevation-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/80 bg-secondary/50 font-mono text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Decision & Category</th>
                <th className="py-3.5 px-4 sm:px-6">Amount</th>
                <th className="py-3.5 px-4 sm:px-6">Trajectory Impact</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {RECENT_DECISIONS.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="py-4 px-4 sm:px-6">
                    <div className="font-bold font-editorial text-foreground text-sm">
                      {item.decision}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {item.category} • {item.date}
                    </div>
                  </td>

                  <td className="py-4 px-4 sm:px-6 font-financial font-bold text-foreground text-sm">
                    {formatCurrency(item.amount, currency)}
                  </td>

                  <td className="py-4 px-4 sm:px-6 text-muted-foreground text-xs max-w-sm leading-relaxed">
                    {item.impact}
                  </td>

                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="inline-block">
                      <FinancialStatus status={item.result} variant="badge" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
