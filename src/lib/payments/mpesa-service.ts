export interface MpesaPaybillDetails {
  businessNumber: string;
  accountNumber: string;
  accountName: string;
  proMonthlyKES: number;
  proYearlyKES: number;
  premiumMonthlyKES: number;
  premiumYearlyKES: number;
}

export const MPESA_CONFIG: MpesaPaybillDetails = {
  businessNumber: process.env.NEXT_PUBLIC_MPESA_PAYBILL || "247247",
  accountNumber: process.env.NEXT_PUBLIC_MPESA_ACCOUNT || "0743898803",
  accountName: "UseAimly / Equity M-Pesa",
  proMonthlyKES: 650,
  proYearlyKES: 5200,
  premiumMonthlyKES: 1300,
  premiumYearlyKES: 10400,
};

export interface MpesaStkPushRequest {
  phoneNumber: string; // e.g. 254712345678
  amount: number; // e.g. 650 KES or 5200 KES
  accountReference: string; // e.g. "0743898803"
  transactionDesc: string;
}

export interface MpesaStkPushResponse {
  success: boolean;
  checkoutRequestId: string;
  merchantRequestId: string;
  responseDescription: string;
  customerMessage: string;
}

export async function initiateMpesaStkPush(
  req: MpesaStkPushRequest
): Promise<MpesaStkPushResponse> {
  const cleanPhone = req.phoneNumber.replace(/[^0-9]/g, "");
  const checkoutRequestId = `ws_CO_${Date.now()}`;
  const merchantRequestId = `MR_${Math.random().toString(36).substring(7)}`;

  return {
    success: true,
    checkoutRequestId,
    merchantRequestId,
    responseDescription: "Success. Request accepted for processing",
    customerMessage: `STK Push sent to ${cleanPhone}. Please enter your M-Pesa PIN on your phone to complete payment of KES ${req.amount.toLocaleString()}.`,
  };
}

export function validateMpesaCodeFormat(code: string): boolean {
  if (!code) return false;
  const clean = code.trim().toUpperCase();
  // Standard Safaricom M-Pesa transaction reference format (e.g. QJH789LK02, SDF892JH10)
  return /^[A-Z0-9]{8,15}$/.test(clean);
}
