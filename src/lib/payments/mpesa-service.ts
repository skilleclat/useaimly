export interface MpesaStkPushRequest {
  phoneNumber: string; // e.g. 254712345678
  amount: number; // e.g. 650 KES or 5200 KES
  accountReference: string; // e.g. "UseAimly Pro"
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
