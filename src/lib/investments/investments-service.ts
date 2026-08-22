import { createClient } from "@/lib/supabase/client";
import { InvestmentAsset, CreateAssetPayload, PortfolioSummary, AssetClass } from "@/lib/types/investments";
import { INITIAL_DEMO_INVESTMENTS } from "./investments-data";

const STORAGE_KEY = "useaimly_investment_assets";

export async function fetchInvestmentAssets(): Promise<InvestmentAsset[]> {
  try {
    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();

    if (session?.session?.user) {
      const { data, error } = await supabase
        .from("investment_assets")
        .select("*")
        .order("current_market_value", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as InvestmentAsset[];
      }
    }
  } catch (err) {
    console.warn("Supabase fetch failed for investment assets, using local fallback", err);
  }

  // Local Storage Fallback
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing stored investment assets", e);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_INVESTMENTS));
  }

  return INITIAL_DEMO_INVESTMENTS;
}

export async function saveInvestmentAsset(payload: CreateAssetPayload): Promise<InvestmentAsset> {
  const yieldPct = payload.annual_yield_percent || 0;
  const monthlyIncome = Math.round((payload.current_market_value * (yieldPct / 100)) / 12);

  const newAsset: InvestmentAsset = {
    id: `inv-${Date.now()}`,
    asset_name: payload.asset_name,
    asset_class: payload.asset_class,
    initial_invested: payload.initial_invested,
    current_market_value: payload.current_market_value,
    annual_yield_percent: yieldPct,
    monthly_income_generated: monthlyIncome,
    institution_name: payload.institution_name || "",
    notes: payload.notes || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();

    if (session?.session?.user) {
      const { data, error } = await supabase
        .from("investment_assets")
        .insert({
          user_id: session.session.user.id,
          asset_name: payload.asset_name,
          asset_class: payload.asset_class,
          initial_invested: payload.initial_invested,
          current_market_value: payload.current_market_value,
          annual_yield_percent: yieldPct,
          monthly_income_generated: monthlyIncome,
          institution_name: payload.institution_name,
          notes: payload.notes,
        })
        .select()
        .single();

      if (!error && data) {
        return data as InvestmentAsset;
      }
    }
  } catch (err) {
    console.warn("Supabase insert investment asset failed, fallback to local storage", err);
  }

  // Local storage fallback
  const current = await fetchInvestmentAssets();
  const updated = [newAsset, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return newAsset;
}

export async function deleteInvestmentAsset(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();

    if (session?.session?.user) {
      await supabase.from("investment_assets").delete().eq("id", id);
    }
  } catch (err) {
    console.warn("Supabase delete investment asset failed", err);
  }

  const current = await fetchInvestmentAssets();
  const updated = current.filter((a) => a.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return true;
}

export function computePortfolioSummary(assets: InvestmentAsset[]): PortfolioSummary {
  const totalInvested = assets.reduce((sum, a) => sum + a.initial_invested, 0);
  const totalMarketValue = assets.reduce((sum, a) => sum + a.current_market_value, 0);
  const unrealizedGainAmount = totalMarketValue - totalInvested;
  const unrealizedGainPercent = totalInvested > 0 ? Math.round((unrealizedGainAmount / totalInvested) * 100 * 10) / 10 : 0;
  const totalMonthlyPassiveIncome = assets.reduce((sum, a) => sum + a.monthly_income_generated, 0);
  const totalAnnualPassiveIncome = totalMonthlyPassiveIncome * 12;

  // Asset Class Distribution
  const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
    STOCKS: "Stocks & Shares",
    MMF: "Money Market Funds",
    SACCO: "Sacco Deposits",
    CRYPTO: "Crypto Assets",
    BONDS: "Treasury Bonds",
    REAL_ESTATE: "Real Estate",
  };

  const distributionMap: Record<AssetClass, number> = {
    STOCKS: 0,
    MMF: 0,
    SACCO: 0,
    CRYPTO: 0,
    BONDS: 0,
    REAL_ESTATE: 0,
  };

  assets.forEach((a) => {
    distributionMap[a.asset_class] = (distributionMap[a.asset_class] || 0) + a.current_market_value;
  });

  const assetClassDistribution = (Object.keys(distributionMap) as AssetClass[])
    .filter((ac) => distributionMap[ac] > 0)
    .map((ac) => ({
      assetClass: ac,
      label: ASSET_CLASS_LABELS[ac],
      value: distributionMap[ac],
      percent: totalMarketValue > 0 ? Math.round((distributionMap[ac] / totalMarketValue) * 100) : 0,
    }));

  // Portfolio Health Score (0-100)
  // Rewards diversification across at least 3 asset classes and positive unrealized return
  const classesCount = assetClassDistribution.length;
  let healthScore = Math.min(100, classesCount * 25 + (unrealizedGainPercent > 0 ? 25 : 10));

  return {
    totalInvested,
    totalMarketValue,
    unrealizedGainAmount,
    unrealizedGainPercent,
    totalMonthlyPassiveIncome,
    totalAnnualPassiveIncome,
    portfolioHealthScore: healthScore,
    assetClassDistribution,
  };
}
