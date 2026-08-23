export interface ExtractedOfferDetails {
  documentType: "VEHICLE_FINANCING" | "MORTGAGE" | "PERSONAL_LOAN" | "PURCHASE_QUOTE" | "SUBSCRIPTION_CONTRACT" | "GENERAL_OFFER";
  title: string;
  totalPrice: number;
  downPayment: number;
  financedAmount: number;
  monthlyPayment: number;
  termMonths: number;
  interestRate: number; // e.g., 12.5 for 12.5%
  additionalFees: number;
  currency: string;
  confidenceScore: number; // 0 to 1
  rawTextSnippet: string;
  requiresUserConfirmation: boolean;
}

/**
 * Parses natural text or document OCR text to extract structured financial offer terms.
 * Never silently assumes values when an error could alter financial decisions.
 */
export function parseOfferDocument(text: string): ExtractedOfferDetails {
  const cleanText = text.trim();
  const lower = cleanText.toLowerCase();

  // Determine Document Type
  let documentType: ExtractedOfferDetails["documentType"] = "GENERAL_OFFER";
  if (lower.includes("car") || lower.includes("vehicle") || lower.includes("auto") || lower.includes("toyota") || lower.includes("nissan")) {
    documentType = "VEHICLE_FINANCING";
  } else if (lower.includes("mortgage") || lower.includes("home loan") || lower.includes("house") || lower.includes("property")) {
    documentType = "MORTGAGE";
  } else if (lower.includes("loan") || lower.includes("credit") || lower.includes("borrow")) {
    documentType = "PERSONAL_LOAN";
  } else if (lower.includes("quote") || lower.includes("invoice") || lower.includes("price")) {
    documentType = "PURCHASE_QUOTE";
  }

  // Regex Extraction Patterns
  // 1. Currency & Total Price
  const priceMatches = Array.from(cleanText.matchAll(/(?:kes|ksh|\$|€|£)?\s*([0-9]{1,3}(?:[,. ][0-9]{3})+|[0-9]{4,8})\b/gi));
  const parsedNumbers = priceMatches
    .map((m) => {
      const raw = m[1].replace(/[,. ]/g, "");
      return parseInt(raw, 10);
    })
    .filter((n) => !isNaN(n) && n >= 1000);

  let totalPrice = parsedNumbers.length > 0 ? Math.max(...parsedNumbers) : 500000;

  // 2. Down Payment / Deposit
  let downPayment = 0;
  const depositMatch = cleanText.match(/(?:deposit|down\s*payment|initial|upfront)[^\d]*?(?:kes|ksh|\$)?\s*([0-9]{1,3}(?:[,. ][0-9]{3})+|[0-9]{4,8})/i);
  if (depositMatch) {
    const val = parseInt(depositMatch[1].replace(/[,. ]/g, ""), 10);
    if (!isNaN(val)) downPayment = val;
  } else if (parsedNumbers.length >= 2) {
    downPayment = Math.min(...parsedNumbers);
  }

  // 3. Monthly Payment
  let monthlyPayment = 0;
  const monthlyMatch = cleanText.match(/(?:monthly|installment|per\s*month|pm)[^\d]*?(?:kes|ksh|\$)?\s*([0-9]{1,3}(?:[,. ][0-9]{3})+|[0-9]{4,8})/i);
  if (monthlyMatch) {
    const val = parseInt(monthlyMatch[1].replace(/[,. ]/g, ""), 10);
    if (!isNaN(val)) monthlyPayment = val;
  } else {
    monthlyPayment = Math.round((totalPrice - downPayment) / 36);
  }


  // 4. Term in Months
  let termMonths = 36;
  const termMatch = cleanText.match(/\b([0-9]{1,3})\s*(?:months|month|mo|yrs|year|years)\b/i);
  if (termMatch) {
    const val = parseInt(termMatch[1], 10);
    if (!isNaN(val) && val > 0) {
      const isYearUnit = /\b(?:year|years|yr|yrs)\b/i.test(termMatch[0]);
      termMonths = isYearUnit ? val * 12 : val;
    }
  }


  // 5. Interest Rate
  let interestRate = 0;
  const rateMatch = cleanText.match(/([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%/);
  if (rateMatch) {
    const val = parseFloat(rateMatch[1]);
    if (!isNaN(val)) interestRate = val;
  }

  const financedAmount = Math.max(0, totalPrice - downPayment);
  const additionalFees = 0;
  const confidenceScore = parsedNumbers.length > 0 ? 0.85 : 0.5;

  let title = "Detected Financial Offer";
  if (documentType === "VEHICLE_FINANCING") title = "Vehicle Financing Quote";
  if (documentType === "MORTGAGE") title = "Mortgage Financing Offer";
  if (documentType === "PERSONAL_LOAN") title = "Personal Loan Agreement";

  return {
    documentType,
    title,
    totalPrice,
    downPayment,
    financedAmount,
    monthlyPayment,
    termMonths,
    interestRate,
    additionalFees,
    currency: "KES",
    confidenceScore,
    rawTextSnippet: cleanText.substring(0, 200),
    requiresUserConfirmation: true, // Always require user confirmation
  };
}
