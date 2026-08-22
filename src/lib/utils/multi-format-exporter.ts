import { CurrencyCode } from "../types/finance";
import { formatCurrency } from "./currency";

export interface TrajectoryExportItem {
  year: number;
  dateStr: string;
  projectedLiquidSavings: number;
  projectedGoalContributions: number;
  projectedPassiveYield: number;
  projectedTotalNetWorth: number;
}

export function generateSampleTrajectoryData(): TrajectoryExportItem[] {
  const currentYear = new Date().getFullYear();
  const baseSavings = 180000;
  const baseYield = 14188;
  const baseContribution = 35000;

  return Array.from({ length: 10 }, (_, idx) => {
    const yr = currentYear + idx;
    const multiplier = 1 + idx * 0.18;
    const liquid = Math.round(baseSavings + idx * baseContribution * 12);
    const passiveYield = Math.round(baseYield * 12 * (1 + idx * 0.15));
    const netWorth = Math.round(liquid + passiveYield * 1.5);

    return {
      year: yr,
      dateStr: `Dec 31, ${yr}`,
      projectedLiquidSavings: liquid,
      projectedGoalContributions: Math.round(baseContribution * 12 * (idx + 1)),
      projectedPassiveYield: passiveYield,
      projectedTotalNetWorth: netWorth,
    };
  });
}

/**
  * Export Trajectory as CSV
  */
export function downloadTrajectoryCSV(currency: CurrencyCode = "KES") {
  const data = generateSampleTrajectoryData();
  const headers = ["Year", "Target Date", `Liquid Savings (${currency})`, `Goal Savings (${currency})`, `Passive Yield (${currency})`, `Total Net Worth (${currency})`].join(",");
  const rows = data.map((d) => [d.year, d.dateStr, d.projectedLiquidSavings, d.projectedGoalContributions, d.projectedPassiveYield, d.projectedTotalNetWorth].join(","));
  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `UseAimly_Trajectory_Forecast_10Y_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
  * Export Trajectory as Excel TSV (.xls / .tsv)
  */
export function downloadTrajectoryExcel(currency: CurrencyCode = "KES") {
  const data = generateSampleTrajectoryData();
  const headers = ["Year\tTarget Date\tLiquid Savings\tGoal Contributions\tPassive Yield\tTotal Net Worth"].join("\t");
  const rows = data.map((d) => [
    d.year,
    d.dateStr,
    formatCurrency(d.projectedLiquidSavings, currency),
    formatCurrency(d.projectedGoalContributions, currency),
    formatCurrency(d.projectedPassiveYield, currency),
    formatCurrency(d.projectedTotalNetWorth, currency),
  ].join("\t"));

  const tsvContent = "data:text/tab-separated-values;charset=utf-8," + [headers, ...rows].join("\n");
  const encodedUri = encodeURI(tsvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `UseAimly_Trajectory_Forecast_10Y_${new Date().toISOString().split("T")[0]}.tsv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
