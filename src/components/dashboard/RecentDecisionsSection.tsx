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
          <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Recent Decisions Evaluated
          </h3>
          <p className="text-xs text-muted-foreground">
            A history of evaluated spending choices and their calculated trajectory consequences.
          </p>
        </div>

        <span className="text-xs text-muted-foreground font-medium">
          3 decisions evaluated
        </span>
      </div>

      {/* Decision Table */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-secondary/40 text-xs font-semibold text-muted-foreground">
              <tr>
                <th className="py-3 px-4 sm:px-6">Decision & Category</th>
                <th className="py-3 px-4 sm:px-6">Amount</th>
                <th className="py-3 px-4 sm:px-6">Trajectory Impact</th>
                <th className="py-3 px-4 sm:px-6 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {RECENT_DECISIONS.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="font-semibold text-foreground text-sm">
                      {item.decision}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.category} • {item.date}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 sm:px-6 font-bold text-foreground text-sm">
                    {formatCurrency(item.amount, currency)}
                  </td>

                  <td className="py-3.5 px-4 sm:px-6 text-muted-foreground text-xs max-w-sm leading-relaxed">
                    {item.impact}
                  </td>

                  <td className="py-3.5 px-4 sm:px-6 text-right">
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
