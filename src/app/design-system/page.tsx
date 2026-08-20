"use client";

import React, { useState } from "react";
import { Container } from "@/components/layout/container";
import {
  UseaimlyLogo,
  MoneyAmount,
  FinancialStatus,
  GoalProgress,
  DestinationCard,
  TrajectoryCard,
  DecisionImpactCard,
  GoalTimeline,
  ProjectionChart,
  InsightCard,
  DecisionCard,
  FinancialMetric,
  MoneyInput,
  CurrencyInput,
  EmptyState,
  LoadingState,
  ErrorState,
  ConfirmDialog,
  TrajectoryState,
} from "@/components/design-system";
import { INITIAL_DEMO_GOALS, INITIAL_DEMO_DECISION } from "@/lib/finance/demo-data";
import { generateTrajectoryPoints } from "@/lib/finance/projections/trajectory-engine";
import { CurrencyCode } from "@/lib/types/finance";
import { Layers, Palette, Compass, Zap, CheckCircle2, Shield } from "lucide-react";

export default function DesignSystemPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("KES");
  const [demoAmount, setDemoAmount] = useState<number>(30000);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedTrajectory, setSelectedTrajectory] = useState<TrajectoryState>("ON_TRACK");

  const sampleGoal = INITIAL_DEMO_GOALS[0];

  const sampleTrajectoryPoints = generateTrajectoryPoints({
    startDate: new Date("2026-08-01"),
    horizonMonths: 24,
    initialCash: 85000,
    initialInvestments: 140000,
    monthlyFreeCashFlow: 55000,
    primaryGoal: sampleGoal,
    monthlyGoalAllocation: 20000,
    oneOffCashImpact: -30000,
    effectiveMonthIndex: 0,
  });

  const timelineSteps = [
    {
      id: "1",
      title: "Today: Baseline Financial Position",
      date: "2026-08-01",
      amount: "KES 180,000 Saved",
      status: "completed" as const,
      description: "Monthly free cash flow: KES 55,000 / mo.",
    },
    {
      id: "2",
      title: "Simulated Decision: New Work Phone",
      date: "2026-08-15",
      amount: "-KES 30,000",
      status: "current" as const,
      description: "One-off purchase drawing from checking buffer.",
    },
    {
      id: "3",
      title: "Midway Venture Milestone",
      date: "2027-04-01",
      amount: "KES 350,000 Target",
      status: "upcoming" as const,
      description: "Equipment & studio down payment reservation.",
    },
    {
      id: "4",
      title: "Original Goal Target",
      date: "2027-12-31",
      amount: "KES 500,000 Full Reserve",
      status: "shifted" as const,
      description: "Shifted to February 2028 (+2 months) unless recovered.",
    },
  ];

  return (
    <div className="py-10 sm:py-16 space-y-16">
      <Container className="space-y-16">
        {/* Header & Brand Philosophy */}
        <div className="space-y-4 max-w-3xl border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3.5 py-1 text-xs font-mono font-bold text-primary">
            <Layers className="w-3.5 h-3.5" />
            <span>Useaimly Visual Identity & Design System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-editorial text-foreground tracking-tight">
            Design for Direction, Trajectory & Time
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Useaimly provides calm, intelligent, and trustworthy decision intelligence. The visual language bridges editorial clarity, precision financial mathematics, and African-inspired organic textures.
          </p>

          <div className="flex flex-wrap gap-2 pt-2 text-xs font-mono">
            <span className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-1 text-primary font-semibold">
              African-Inspired Nuance
            </span>
            <span className="rounded-xl border border-border bg-secondary px-3 py-1 text-foreground font-semibold">
              Editorial Typography
            </span>
            <span className="rounded-xl border border-border bg-secondary px-3 py-1 text-foreground font-semibold">
              Light & Dark Native
            </span>
          </div>
        </div>

        {/* SECTION 1: Brand Mark & Logo Variations */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>01 / Brand Mark & Typography</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between space-y-4">
              <span className="text-xs font-mono text-muted-foreground">Large Editorial Logo</span>
              <UseaimlyLogo size="lg" />
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between space-y-4">
              <span className="text-xs font-mono text-muted-foreground">Medium Standard Logo</span>
              <UseaimlyLogo size="md" />
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between space-y-4">
              <span className="text-xs font-mono text-muted-foreground">Compact Brand Mark</span>
              <UseaimlyLogo size="sm" showTagline={false} />
            </div>
          </div>
        </section>

        {/* SECTION 2: Trajectory Language */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>02 / The Trajectory Language</span>
          </div>

          <p className="text-xs text-muted-foreground">
            Four foundational trajectory states that communicate destiny without robotic jargon.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FinancialStatus status="ON_TRACK" variant="card" />
            <FinancialStatus status="AT_RISK" variant="card" />
            <FinancialStatus status="OFF_TRACK" variant="card" />
            <FinancialStatus status="AHEAD" variant="card" />
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-mono text-muted-foreground block">
              Banner Variants:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FinancialStatus status="ON_TRACK" variant="banner" />
              <FinancialStatus
                status="AT_RISK"
                variant="banner"
                customMessage="This KES 30,000 expense moves your business goal by +2 months."
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: Precision Financial Numerals & MoneyAmount */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
            <Palette className="w-4 h-4" />
            <span>03 / Money & Precision Numerals</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
              <span className="text-[11px] text-muted-foreground block">Neutral</span>
              <MoneyAmount amount={500000} currency="KES" size="md" />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
              <span className="text-[11px] text-muted-foreground block">Income</span>
              <MoneyAmount amount={180000} currency="KES" size="md" intent="income" showSign />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
              <span className="text-[11px] text-muted-foreground block">Expense</span>
              <MoneyAmount amount={30000} currency="KES" size="md" intent="expense" showSign />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
              <span className="text-[11px] text-muted-foreground block">Savings</span>
              <MoneyAmount amount={140000} currency="KES" size="md" intent="savings" />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
              <span className="text-[11px] text-muted-foreground block">Goal Destination</span>
              <MoneyAmount amount={500000} currency="KES" size="md" intent="goal" />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
              <span className="text-[11px] text-muted-foreground block">Compact Format</span>
              <MoneyAmount amount={2500000} currency="KES" size="md" compact />
            </div>
          </div>
        </section>

        {/* SECTION 4: Reusable Domain Cards */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>04 / Destination, Trajectory & Impact Cards</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* DestinationCard */}
            <DestinationCard
              goal={sampleGoal}
              trajectoryState="AT_RISK"
              monthlyAllocation={20000}
            />

            {/* TrajectoryCard */}
            <TrajectoryCard
              goalTitle={sampleGoal.title}
              originalTargetDate={sampleGoal.targetDate}
              projectedDate="2028-02-28"
              delayMonths={2}
              trajectoryState="AT_RISK"
              additionalMonthlyRequired={1875}
            />

            {/* DecisionImpactCard */}
            <DecisionImpactCard
              decisionTitle="New Smartphone Upgrade"
              decisionAmount={30000}
              cashAffordable={true}
              liquidCashBefore={85000}
              liquidCashAfter={55000}
              goalTitle={sampleGoal.title}
              targetDate={sampleGoal.targetDate}
              delayMonths={2}
              recoveryMonthlyAmount={1875}
            />
          </div>
        </section>

        {/* SECTION 5: Interactive Chart & Timeline */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>05 / Projection Chart & Milestone Timeline</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 rounded-3xl border border-border bg-card p-6 shadow-elevation-1">
              <div className="mb-4">
                <h3 className="text-base font-bold font-editorial text-foreground">
                  36-Month Capital Trajectory Curve
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Light and dark adaptive visual curves with destination reference targets.
                </p>
              </div>

              <ProjectionChart
                data={sampleTrajectoryPoints}
                targetAmount={sampleGoal.targetAmount}
                currency="KES"
              />
            </div>

            <div className="lg:col-span-4 rounded-3xl border border-border bg-card p-6 shadow-elevation-1 space-y-4">
              <div>
                <h3 className="text-base font-bold font-editorial text-foreground">
                  Decision Timeline Roadmap
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Chronological milestones connecting today to tomorrow.
                </p>
              </div>

              <GoalTimeline steps={timelineSteps} />
            </div>
          </div>
        </section>

        {/* SECTION 6: Insight, Decision & Metric Cards */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>06 / Insight & Decision Primitives</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InsightCard
              title="Cash Affordable, but Shifts Business Target by 2 Months"
              directVerdict="You have sufficient cash (KES 85,000 available) to purchase this phone."
              planExplanation="However, this expenditure draws from capital meant for your business fund, moving completion from Dec 2027 to Feb 2028."
              tradeoffNarrative="Every shilling deferred represents a 2-month opportunity cost on launch timing."
              recoveryAction="Increase monthly savings by +KES 1,875/mo to restore your original Dec 2027 launch date."
              source="ai-synthesis"
            />

            <DecisionCard
              decision={INITIAL_DEMO_DECISION}
              onSimulate={() => {}}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FinancialMetric
              label="Liquid Buffer"
              value="KES 85,000"
              subValue="M-Pesa / Checking"
              delta="-KES 30,000"
              deltaType="negative"
            />
            <FinancialMetric
              label="Free Cash Flow"
              value="KES 55,000"
              subValue="Monthly Rate"
              delta="+12% YoY"
              deltaType="positive"
            />
            <FinancialMetric
              label="Goal Timeline"
              value="Feb 2028"
              subValue="Original: Dec 2027"
              delta="+2 Mo Shift"
              deltaType="warning"
            />
            <FinancialMetric
              label="Recovery Pace"
              value="+KES 1,875"
              subValue="Per month"
              delta="Feasible"
              deltaType="positive"
            />
          </div>
        </section>

        {/* SECTION 7: Inputs & Interactive Controls */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
            <Palette className="w-4 h-4" />
            <span>07 / Inputs, Feedback States & Modals</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
              <span className="text-xs font-mono text-muted-foreground block">Tactile Money Input</span>
              <MoneyInput
                value={demoAmount}
                onChange={setDemoAmount}
                currency="KES"
                label="Custom Purchase Amount"
              />
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
              <span className="text-xs font-mono text-muted-foreground block">Multi-Currency Input</span>
              <CurrencyInput
                amount={demoAmount}
                currency={selectedCurrency}
                onAmountChange={setDemoAmount}
                onCurrencyChange={setSelectedCurrency}
                label="International / FX Support"
              />
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-muted-foreground block">Confirmation Dialog</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Accessible modal dialog for verifying critical plan shifts.
                </p>
              </div>

              <button
                onClick={() => setIsDialogOpen(true)}
                className="w-full rounded-2xl bg-secondary border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-secondary/80 transition-all"
              >
                Open Confirmation Dialog
              </button>

              <ConfirmDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title="Execute KES 30,000 Purchase?"
                description="This decision will shift your 'Start my business' milestone from December 2027 to February 2028. Are you sure you want to log this decision?"
                confirmLabel="Confirm & Adjust Plan"
                onConfirm={() => setIsDialogOpen(false)}
              />
            </div>
          </div>

          {/* Feedback States Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <EmptyState
              title="No Past Decisions Logged"
              description="Ask Useaimly what happens before you spend, invest, or adjust subscriptions."
              actionLabel="Simulate First Decision"
              onAction={() => {}}
            />

            <LoadingState
              message="Calculating 36-month trajectory..."
              variant="pulse"
            />

            <ErrorState
              title="Connection Paused"
              message="Unable to reach the trajectory simulation engine. Check your connection or retry."
              onRetry={() => {}}
            />
          </div>
        </section>
      </Container>
    </div>
  );
}
