"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import {
  INITIAL_PROACTIVE_INSIGHTS,
  ProactiveInsightItem,
  InsightSeverity,
} from "@/lib/insights/insight-engine";
import {
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  Info,
  Bell,
  CheckCircle2,
  ArrowRight,
  Target,
  Check,
  X,
  Compass,
  Filter,
} from "lucide-react";

const SEVERITY_CONFIG: Record<
  InsightSeverity,
  {
    label: string;
    badgeStyle: string;
    cardBorder: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  CRITICAL: {
    label: "CRITICAL",
    badgeStyle: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    cardBorder: "border-rose-500/40 bg-rose-500/5",
    icon: AlertOctagon,
  },
  WARNING: {
    label: "WARNING",
    badgeStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    cardBorder: "border-amber-500/40 bg-amber-500/5",
    icon: AlertTriangle,
  },
  NOTICE: {
    label: "NOTICE",
    badgeStyle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    cardBorder: "border-blue-500/30 bg-blue-500/5",
    icon: Info,
  },
  INFO: {
    label: "INFO",
    badgeStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    cardBorder: "border-emerald-500/30 bg-emerald-500/5",
    icon: CheckCircle2,
  },
};

export default function InsightsPage() {
  const { profile } = useAuth();
  const [insights, setInsights] = useState<ProactiveInsightItem[]>(INITIAL_PROACTIVE_INSIGHTS);
  const [filterTab, setFilterTab] = useState<"ALL" | "UNREAD" | "WARNINGS" | "ARCHIVED">("ALL");

  const unreadCount = useMemo(() => insights.filter((i) => !i.isRead && !i.isDismissed).length, [insights]);

  const filteredInsights = useMemo(() => {
    return insights.filter((item) => {
      if (filterTab === "ARCHIVED") return item.isDismissed;
      if (item.isDismissed) return false;
      if (filterTab === "UNREAD") return !item.isRead;
      if (filterTab === "WARNINGS") return item.severity === "WARNING" || item.severity === "CRITICAL";
      return true;
    });
  }, [insights, filterTab]);

  const handleMarkRead = (id: string) => {
    setInsights(insights.map((i) => (i.id === id ? { ...i, isRead: !i.isRead } : i)));
  };

  const handleDismiss = (id: string) => {
    setInsights(insights.map((i) => (i.id === id ? { ...i, isDismissed: true } : i)));
  };

  const handleRestore = (id: string) => {
    setInsights(insights.map((i) => (i.id === id ? { ...i, isDismissed: false } : i)));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
            <Sparkles className="w-4 h-4" />
            <span>Foresight Engine</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight">
            Proactive Insights
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Useaimly continuously monitors your trajectory, obligations, and destination velocity to surface key findings before you need to ask.
          </p>
        </div>

        {unreadCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-xs font-mono font-bold text-primary self-start sm:self-auto">
            <Bell className="w-3.5 h-3.5" />
            <span>{unreadCount} Unread Insights</span>
          </div>
        )}
      </div>

      {/* FILTER TABS & SEVERITY COUNTERS */}
      <div className="flex items-center justify-between border-b border-border/70 pb-4 overflow-x-auto gap-4">
        <div className="flex items-center gap-2">
          {(
            [
              { key: "ALL", label: `All (${insights.filter((i) => !i.isDismissed).length})` },
              { key: "UNREAD", label: `Unread (${unreadCount})` },
              { key: "WARNINGS", label: `Warnings & Critical (${insights.filter((i) => !i.isDismissed && (i.severity === "WARNING" || i.severity === "CRITICAL")).length})` },
              { key: "ARCHIVED", label: `Archived (${insights.filter((i) => i.isDismissed).length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                filterTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* INSIGHTS CARDS LIST */}
      <div className="space-y-4">
        {filteredInsights.length > 0 ? (
          filteredInsights.map((insight) => {
            const config = SEVERITY_CONFIG[insight.severity];
            const SeverityIcon = config.icon;

            return (
              <div
                key={insight.id}
                className={`rounded-3xl border p-6 sm:p-7 space-y-4 shadow-elevation-1 transition-all flex flex-col justify-between ${
                  insight.isRead ? "bg-card border-border opacity-85" : `${config.cardBorder}`
                }`}
              >
                <div className="space-y-3">
                  {/* Top Row: Severity & Goal Pill */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${config.badgeStyle}`}
                      >
                        <SeverityIcon className="w-3.5 h-3.5" />
                        <span>{config.label}</span>
                      </span>

                      {insight.relatedGoalTitle && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-secondary/80 px-2.5 py-0.5 rounded-md">
                          <Target className="w-3 h-3 text-primary" />
                          <span>{insight.relatedGoalTitle}</span>
                        </span>
                      )}
                    </div>

                    {/* Secondary Actions (Mark Read / Dismiss) */}
                    <div className="flex items-center gap-2 text-xs">
                      {!insight.isDismissed ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleMarkRead(insight.id)}
                            className="text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg transition-colors flex items-center gap-1 font-mono text-[11px]"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{insight.isRead ? "Mark Unread" : "Mark Read"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDismiss(insight.id)}
                            className="text-muted-foreground hover:text-rose-500 p-1 rounded-lg transition-colors"
                            title="Dismiss insight"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRestore(insight.id)}
                          className="text-primary font-mono text-xs hover:underline"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Explanation */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-bold font-editorial text-foreground leading-snug">
                      {insight.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {insight.explanation}
                    </p>
                  </div>
                </div>

                {/* Suggested Action CTA */}
                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <Link
                    href={insight.suggestedAction.href}
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline group"
                  >
                    <span>{insight.suggestedAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <span className="text-[10px] font-mono text-muted-foreground">
                    Deterministic finding
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-3xl border border-border bg-card space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-editorial text-foreground">
              No insights in this view
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              All financial indicators are currently within optimal thresholds. Useaimly will surface new findings here as your balance sheet evolves.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
