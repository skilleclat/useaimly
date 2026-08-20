/**
 * Deterministic Net Worth & Liquidity Engine
 */

import { FinancialAccount, NetWorthSummary } from "../../types/finance";
import { roundTo } from "../../utils/math";

export function calculateNetWorth(
  accounts: FinancialAccount[],
  monthlyTotalExpenses: number = 0
): NetWorthSummary {
  let liquidCash = 0;
  let accessibleLiquidCash = 0;
  let emergencyReserves = 0;
  let investableAssets = 0;
  let lockedAssets = 0;
  let totalLiabilities = 0;

  for (const acc of accounts) {
    switch (acc.category) {
      case "LIQUID_CASH":
        liquidCash += acc.balance;
        if (acc.isAccessibleForGoals !== false) {
          accessibleLiquidCash += acc.balance;
        } else {
          emergencyReserves += acc.balance;
        }
        break;
      case "SAVINGS":
      case "INVESTMENT":
        investableAssets += acc.balance;
        break;
      case "LOCKED_RETIREMENT":
        lockedAssets += acc.balance;
        break;
      case "DEBT":
        totalLiabilities += Math.abs(acc.balance);
        break;
    }
  }

  const totalAssets = liquidCash + investableAssets + lockedAssets;
  const netWorth = totalAssets - totalLiabilities;
  const liquidRunwayMonths = monthlyTotalExpenses > 0 
    ? roundTo(liquidCash / monthlyTotalExpenses, 1) 
    : 99;

  return {
    totalAssets: roundTo(totalAssets),
    liquidCash: roundTo(liquidCash),
    accessibleLiquidCash: roundTo(accessibleLiquidCash),
    emergencyReserves: roundTo(emergencyReserves),
    investableAssets: roundTo(investableAssets),
    lockedAssets: roundTo(lockedAssets),
    totalLiabilities: roundTo(totalLiabilities),
    netWorth: roundTo(netWorth),
    liquidRunwayMonths,
  };
}
