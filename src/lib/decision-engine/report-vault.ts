import { VerifiedDecisionData, VerificationResult } from "./decision-validator";

export interface StoredDecisionReport {
  id: string;
  decisionId: string;
  decisionTitle: string;
  reportId: string;
  version: number;
  verdict: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  data: VerifiedDecisionData;
  verification: VerificationResult;
}

const REPORT_VAULT_KEY = "useaimly_decision_reports_vault";

// In-memory fallback cache for SSR and Vitest environment
let inMemoryReports: StoredDecisionReport[] = [];

export function getStoredReports(): StoredDecisionReport[] {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(REPORT_VAULT_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // fallback to memory
    }
  }
  return inMemoryReports;
}

export function saveDecisionReportToVault(
  data: VerifiedDecisionData,
  verification: VerificationResult
): StoredDecisionReport {
  const reports = getStoredReports();
  const existingVersions = reports.filter(
    (r) => r.decisionId === data.decisionId || r.decisionTitle.toLowerCase() === data.decisionTitle.toLowerCase()
  );
  const nextVersion = existingVersions.length + 1;

  const updatedData: VerifiedDecisionData = {
    ...data,
    version: nextVersion,
  };

  const newReport: StoredDecisionReport = {
    id: `rpt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    decisionId: data.decisionId || `dec-${Date.now()}`,
    decisionTitle: data.decisionTitle,
    reportId: data.reportId,
    version: nextVersion,
    verdict: data.calculatedImpact.verdict,
    amount: data.amount,
    currency: data.currency,
    status: verification.status,
    createdAt: new Date().toISOString(),
    data: updatedData,
    verification,
  };

  inMemoryReports = [newReport, ...reports];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(REPORT_VAULT_KEY, JSON.stringify(inMemoryReports));
    } catch (e) {
      console.warn("Could not write report to vault storage:", e);
    }
  }

  return newReport;
}

export function getReportsForDecision(decisionIdOrTitle: string): StoredDecisionReport[] {
  const reports = getStoredReports();
  return reports.filter(
    (r) =>
      r.decisionId === decisionIdOrTitle ||
      r.decisionTitle.toLowerCase() === decisionIdOrTitle.toLowerCase()
  );
}
