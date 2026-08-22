"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyCode } from "@/lib/types/finance";
import { InvestmentAsset, AssetClass, PortfolioSummary } from "@/lib/types/investments";
import {
  fetchInvestmentAssets,
  saveInvestmentAsset,
  deleteInvestmentAsset,
  computePortfolioSummary,
} from "@/lib/investments/investments-service";
import {
  PieChart as PieIcon,
  TrendingUp,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Building2,
  Coins,
  Landmark,
  CircleDollarSign,
  X,
  ArrowUpRight,
  BarChart3,
  Layers,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#FF5533", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899"];

export function InvestmentPortfolioCard({
  currency = "KES",
  goalTitle = "Start my business",
}: {
  currency?: CurrencyCode;
  goalTitle?: string;
}) {
  const [assets, setAssets] = useState<InvestmentAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [assetName, setAssetName] = useState("");
  const [assetClass, setAssetClass] = useState<AssetClass>("MMF");
  const [initialInvested, setInitialInvested] = useState<number>(100000);
  const [currentMarketValue, setCurrentMarketValue] = useState<number>(115000);
  const [annualYieldPercent, setAnnualYieldPercent] = useState<number>(11.5);
  const [institutionName, setInstitutionName] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      const data = await fetchInvestmentAssets();
      setAssets(data);
      setLoading(false);
    }
    load();
  }, []);

  const summary = computePortfolioSummary(assets);

  // Calculate Goal Acceleration from passive yield (monthly contribution = 45,000)
  const goalAccelerationDays = Math.round((summary.totalMonthlyPassiveIncome / 45000) * 30 * 12);

  async function handleAddAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!assetName.trim() || currentMarketValue <= 0) return;

    const created = await saveInvestmentAsset({
      asset_name: assetName.trim(),
      asset_class: assetClass,
      initial_invested: initialInvested,
      current_market_value: currentMarketValue,
      annual_yield_percent: annualYieldPercent,
      institution_name: institutionName.trim(),
      notes: notes.trim(),
    });

    setAssets((prev) => [created, ...prev]);
    setShowAddModal(false);
    setAssetName("");
  }

  async function handleDelete(id: string) {
    await deleteInvestmentAsset(id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }

  const chartData = summary.assetClassDistribution.map((item, idx) => ({
    name: item.label,
    value: item.value,
    color: COLORS[idx % COLORS.length],
  }));

  return (
    <div className="rounded-3xl border border-primary/30 bg-card p-6 sm:p-8 space-y-6 shadow-sm font-sans animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              Wealth &amp; Investment Portfolio Command Center
            </h2>
            <span className="rounded-full bg-gradient-to-r from-emerald-500/20 to-primary/20 text-emerald-500 text-[10px] font-extrabold px-2.5 py-0.5 border border-emerald-500/30 uppercase tracking-wider">
              Asset Monitor
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Track all your stocks, MMFs, Saccos, crypto, real estate, and treasury bonds in one goal-aware cockpit.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:opacity-95 flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Investment Asset</span>
        </button>
      </div>

      {/* Hero Scorecard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className="p-4 rounded-2xl border border-border/80 bg-secondary/30 space-y-1">
          <span className="text-[11px] font-mono text-muted-foreground font-bold uppercase tracking-wider block">
            Total Portfolio Value
          </span>
          <div className="text-2xl font-extrabold font-mono text-foreground">
            {formatCurrency(summary.totalMarketValue, currency)}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono block">
            Invested: {formatCurrency(summary.totalInvested, currency)}
          </span>
        </div>

        {/* Total Unrealized Gain */}
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
          <span className="text-[11px] font-mono text-emerald-500 font-bold uppercase tracking-wider block">
            Net Unrealized Return
          </span>
          <div className="text-2xl font-extrabold font-mono text-emerald-500">
            +{formatCurrency(summary.unrealizedGainAmount, currency)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold block">
            +{summary.unrealizedGainPercent}% Total Portfolio Growth
          </span>
        </div>

        {/* Monthly Passive Yield */}
        <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-1">
          <span className="text-[11px] font-mono text-primary font-bold uppercase tracking-wider block">
            Monthly Passive Yield
          </span>
          <div className="text-2xl font-extrabold font-mono text-primary">
            +{formatCurrency(summary.totalMonthlyPassiveIncome, currency)} / mo
          </div>
          <span className="text-[10px] text-primary/80 font-mono block">
            {formatCurrency(summary.totalAnnualPassiveIncome, currency)} / year
          </span>
        </div>

        {/* Portfolio Health & Diversification */}
        <div className="p-4 rounded-2xl border border-border/80 bg-secondary/30 space-y-1">
          <span className="text-[11px] font-mono text-muted-foreground font-bold uppercase tracking-wider block">
            Health &amp; Diversification
          </span>
          <div className="text-2xl font-extrabold font-mono text-foreground">
            {summary.portfolioHealthScore} / 100
          </div>
          <span className="text-[10px] text-muted-foreground font-mono block">
            Across {summary.assetClassDistribution.length} asset classes
          </span>
        </div>
      </div>

      {/* Goal Acceleration Multiplier Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-primary/10 to-card border border-emerald-500/30 text-xs text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-foreground">Goal Acceleration Yield Engine</h4>
            <p className="text-muted-foreground">
              Your passive portfolio yield of <strong>+{formatCurrency(summary.totalMonthlyPassiveIncome, currency)}/mo</strong> accelerates your arrival date for &ldquo;<strong>{goalTitle}</strong>&rdquo;!
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-emerald-950 text-xs font-mono font-extrabold shrink-0 self-start sm:self-auto">
          -{goalAccelerationDays} Days Faster Arrival
        </div>
      </div>

      {/* Asset Distribution Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Donut Chart */}
        <div className="p-5 rounded-2xl border border-border/80 bg-secondary/30 space-y-3 flex flex-col items-center justify-center">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground self-start">
            Asset Class Allocation
          </span>

          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => formatCurrency(val, currency)}
                  contentStyle={{ backgroundColor: "#171717", borderColor: "#333", borderRadius: "12px", color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Class Breakdown Bar List */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-border/80 bg-secondary/30 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground block">
            Asset Class Weighting
          </span>

          <div className="space-y-3">
            {summary.assetClassDistribution.map((ac, idx) => (
              <div key={ac.assetClass} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground">{ac.label}</span>
                  <span className="font-mono text-muted-foreground">
                    {formatCurrency(ac.value, currency)} ({ac.percent}%)
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden border border-border/40 p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${ac.percent}%`,
                      backgroundColor: COLORS[idx % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Asset List Grid */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
          Active Investment Assets ({assets.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const gain = asset.current_market_value - asset.initial_invested;
            const gainPct = asset.initial_invested > 0 ? Math.round((gain / asset.initial_invested) * 100 * 10) / 10 : 0;

            return (
              <div
                key={asset.id}
                className="p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition-all space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-mono uppercase border border-border/60">
                      {asset.asset_class}
                    </span>
                    <h5 className="text-xs font-bold text-foreground mt-1.5">{asset.asset_name}</h5>
                    {asset.institution_name && (
                      <span className="text-[10px] text-muted-foreground block">{asset.institution_name}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 pt-2 border-t border-border/50 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Market Value:</span>
                    <span className="font-bold text-foreground font-mono">
                      {formatCurrency(asset.current_market_value, currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Return:</span>
                    <span className={`font-bold font-mono ${gain >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {gain >= 0 ? `+${gainPct}%` : `${gainPct}%`} ({formatCurrency(gain, currency)})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Yield Rate:</span>
                    <span className="font-bold text-primary font-mono">{asset.annual_yield_percent}% p.a.</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl border border-border/80 bg-card p-6 space-y-5 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h4 className="text-base font-bold text-foreground">Add Investment Asset</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. CIC Money Market Fund (MMF)"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-secondary/50 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Asset Class</label>
                <select
                  value={assetClass}
                  onChange={(e) => setAssetClass(e.target.value as AssetClass)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-secondary/50 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="MMF">Money Market Fund (MMF)</option>
                  <option value="SACCO">Sacco Shares &amp; Deposits</option>
                  <option value="STOCKS">Stocks &amp; Equities (Bourse)</option>
                  <option value="BONDS">Treasury Bonds &amp; Bills</option>
                  <option value="CRYPTO">Crypto Asset</option>
                  <option value="REAL_ESTATE">Real Estate &amp; Land</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Initial Invested ({currency})</label>
                  <input
                    type="number"
                    value={initialInvested}
                    onChange={(e) => setInitialInvested(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-secondary/50 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Current Value ({currency})</label>
                  <input
                    type="number"
                    value={currentMarketValue}
                    onChange={(e) => setCurrentMarketValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-secondary/50 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Annual Yield Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={annualYieldPercent}
                  onChange={(e) => setAnnualYieldPercent(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-secondary/50 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Institution / Platform (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. CIC Group, Stima Sacco, NSE"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-secondary/50 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2.5 rounded-xl border border-border bg-secondary/50 text-xs font-semibold text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-95 shadow-xs"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
