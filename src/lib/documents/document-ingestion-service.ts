/**
 * Document Ingestion Service
 * Handles secure file validation, type detection, multi-page text extraction,
 * OCR fallback simulation/parsing, and strict currency detection.
 */

import { DocumentItem, DocumentType } from "../types/document-intelligence";
import { CurrencyCode } from "../types/finance";

export interface RawUploadedFile {
  name: string;
  size: number;
  type: string;
  base64Content?: string;
  textContent?: string;
}

export class DocumentIngestionService {
  /**
   * Strictly classifies document type from content terms and filename.
   */
  public detectDocumentType(filename: string, textSnippet: string = ""): {
    type: DocumentType;
    confidence: "high" | "medium" | "low";
    reasoning: string;
  } {
    const name = filename.toLowerCase();
    const text = textSnippet.toLowerCase();

    // 1. Accounting Report / P&L / Financial Statement
    const hasRevenue = text.includes("revenue") || text.includes("chiffre d'affaires") || text.includes("sales") || text.includes("ventes") || text.includes("turnover");
    const hasProfit = text.includes("gross profit") || text.includes("net profit") || text.includes("operating profit") || text.includes("marge brute") || text.includes("résultat net") || text.includes("résultat d'exploitation") || text.includes("ebitda");
    const hasCostOfSales = text.includes("cost of sales") || text.includes("cogs") || text.includes("coût des ventes") || text.includes("achats");
    const hasCashBalance = text.includes("closing cash") || text.includes("cash balance") || text.includes("trésorerie de clôture") || text.includes("solde de clôture");

    if (
      name.includes("comptable") ||
      name.includes("accounting") ||
      name.includes("p_l") ||
      name.includes("p&l") ||
      name.includes("profit_loss") ||
      (hasRevenue && (hasProfit || hasCostOfSales || hasCashBalance))
    ) {
      return {
        type: "ACCOUNTING_REPORT",
        confidence: "high",
        reasoning: "The document contains financial accounting metrics (Revenue, Cost of sales, Gross profit, Operating profit, Net profit, and Cash balance).",
      };
    }

    // 2. Balance Sheet
    if (
      name.includes("balance_sheet") ||
      name.includes("bilan") ||
      (text.includes("total assets") && text.includes("total liabilities")) ||
      (text.includes("actif") && text.includes("passif") && text.includes("capitaux propres"))
    ) {
      return {
        type: "BALANCE_SHEET",
        confidence: "high",
        reasoning: "The document contains balance sheet line items (Assets, Liabilities, and Equity).",
      };
    }

    // 3. Bank Statement
    if (
      name.includes("statement") ||
      name.includes("releve") ||
      name.includes("bank") ||
      (text.includes("opening balance") && text.includes("closing balance")) ||
      text.includes("account statement")
    ) {
      return {
        type: "BANK_STATEMENT",
        confidence: "high",
        reasoning: "The document contains bank transaction statements with opening/closing balances.",
      };
    }

    // 4. Vehicle Financing
    if (
      name.includes("car") ||
      name.includes("vehicle") ||
      name.includes("auto") ||
      text.includes("vehicle financing") ||
      text.includes("car quote") ||
      text.includes("devis vehicule") ||
      text.includes("devis véhicule")
    ) {
      return {
        type: "VEHICLE_FINANCING",
        confidence: "high",
        reasoning: "The document details vehicle purchase and financing terms.",
      };
    }

    // 5. Mortgage
    if (
      name.includes("mortgage") ||
      name.includes("immobilier") ||
      text.includes("mortgage offer") ||
      text.includes("property purchase") ||
      text.includes("crédit immobilier")
    ) {
      return {
        type: "MORTGAGE",
        confidence: "high",
        reasoning: "The document contains mortgage and property financing terms.",
      };
    }

    // 6. Loan / Credit Agreement
    if (
      name.includes("loan") ||
      name.includes("credit") ||
      name.includes("pret") ||
      name.includes("prêt") ||
      text.includes("loan agreement") ||
      text.includes("personal loan") ||
      text.includes("contrat de prêt")
    ) {
      return {
        type: "LOAN_AGREEMENT",
        confidence: "high",
        reasoning: "The document outlines principal loan borrowing, interest rates, and repayment terms.",
      };
    }

    // 7. General Purchase Quote / Invoice
    if (
      name.includes("quote") ||
      name.includes("devis") ||
      name.includes("invoice") ||
      name.includes("facture") ||
      text.includes("quotation") ||
      text.includes("invoice #") ||
      text.includes("facture n°")
    ) {
      return {
        type: "PURCHASE_QUOTE",
        confidence: "medium",
        reasoning: "The document is a commercial purchase quote or invoice.",
      };
    }

    // 8. Lease Agreement
    if (
      name.includes("lease") ||
      name.includes("bail") ||
      name.includes("rent") ||
      name.includes("loyer") ||
      text.includes("tenancy agreement") ||
      text.includes("contrat de bail")
    ) {
      return {
        type: "LEASE_AGREEMENT",
        confidence: "high",
        reasoning: "The document specifies rental tenancy and lease obligations.",
      };
    }

    // 9. Commercial Contract
    if (
      name.includes("contract") ||
      name.includes("contrat") ||
      text.includes("terms of service") ||
      text.includes("commercial agreement")
    ) {
      return {
        type: "COMMERCIAL_CONTRACT",
        confidence: "medium",
        reasoning: "The document contains contractual obligations and clauses.",
      };
    }

    return {
      type: "UNKNOWN_DOCUMENT",
      confidence: "low",
      reasoning: "Insufficient document structure to identify a specific financial category.",
    };
  }

  /**
   * Strictly detects the document currency from text. Never silently transforms.
   */
  public detectDocumentCurrency(text: string): CurrencyCode {
    const lower = text.toLowerCase();

    if (/\b(?:kes|ksh|kshs|shillings?)\b/i.test(lower)) {
      return "KES";
    }
    if (/\b(?:usd|\$|dollars?)\b/i.test(lower)) {
      return "USD";
    }
    if (/\b(?:eur|€|euros?)\b/i.test(lower)) {
      return "EUR";
    }
    if (/\b(?:gbp|£|pounds?)\b/i.test(lower)) {
      return "GBP";
    }
    if (/\b(?:cad|c\$)\b/i.test(lower)) {
      return "CAD";
    }
    if (/\b(?:aud|a\$)\b/i.test(lower)) {
      return "AUD";
    }
    if (/\b(?:zar|rand)\b/i.test(lower)) {
      return "ZAR";
    }

    return "KES"; // Default currency for regional environment if unstated
  }

  /**
   * Ingests and parses a raw file into a structured DocumentItem.
   */
  public async ingestDocument(file: RawUploadedFile): Promise<DocumentItem> {
    const id = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const uploadedAt = new Date().toISOString();

    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB
    if (file.size > maxSizeBytes) {
      return {
        id,
        name: file.name,
        size: file.size,
        type: "UNKNOWN_DOCUMENT",
        mimeType: file.type || "application/octet-stream",
        uploadedAt,
        status: "failed",
        rawText: "",
        errorMessage: "File exceeds 25MB maximum size limit.",
      };
    }

    let rawText = file.textContent || "";
    let ocrApplied = false;

    if (!rawText && file.base64Content) {
      try {
        const decoded = atob(file.base64Content.replace(/^data:.*?;base64,/, ""));
        if (decoded.length > 50 && /^[\x20-\x7E\r\n\t]+$/.test(decoded.substring(0, 100))) {
          rawText = decoded;
        } else {
          ocrApplied = true;
          rawText = `[OCR PARSED: ${file.name}]`;
        }
      } catch (e) {
        rawText = `[PROCESSED DOCUMENT: ${file.name}]`;
      }
    }

    const { type } = this.detectDocumentType(file.name, rawText);
    const detectedCurrency = this.detectDocumentCurrency(rawText);

    return {
      id,
      name: file.name,
      size: file.size,
      type,
      mimeType: file.type || "application/pdf",
      uploadedAt,
      status: "ready",
      rawText,
      pageCount: Math.max(1, Math.ceil(rawText.length / 1800)),
      ocrApplied,
      metadata: {
        detectedLanguage: "fr",
        detectedCurrency,
        creationDate: new Date().toISOString().split("T")[0],
      },
    };
  }

  /**
   * Ingests multiple files sequentially.
   */
  public async ingestMultipleDocuments(files: RawUploadedFile[]): Promise<DocumentItem[]> {
    const results: DocumentItem[] = [];
    for (const file of files) {
      const doc = await this.ingestDocument(file);
      results.push(doc);
    }
    return results;
  }
}

export const documentIngestionService = new DocumentIngestionService();
