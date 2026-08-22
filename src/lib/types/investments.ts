export type AssetClass = "STOCKS" | "CRYPTO" | "MMF" | "SACCO" | "REAL_ESTATE" | "BONDS";

export interface InvestmentAsset {
  id: string;
  user_id?: string;
  asset_name: string;
  asset_class: AssetClass;
  initial_invested: number;
  current_market_value: number;
  annual_yield_percent: number;
  monthly_income_generated: number;
  institution_name?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAssetPayload {
  asset_name: string;
  asset_class: AssetClass;
  initial_invested: number;
  current_market_value: number;
  annual_yield_percent?: number;
  institution_name?: string;
  notes?: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalMarketValue: number;
  unrealizedGainAmount: number;
  unrealizedGainPercent: number;
  totalMonthlyPassiveIncome: number;
  totalAnnualPassiveIncome: number;
  portfolioHealthScore: number;
  assetClassDistribution: {
    assetClass: AssetClass;
    label: string;
    value: number;
    percent: number;
  }[];
}
