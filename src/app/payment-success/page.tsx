import React, { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentSuccessClient } from "./payment-success-client";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscription Confirmed",
  description: "Welcome to UseAimly Pro. Your subscription is active.",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-[#FF4D26]" />
            <span>Loading payment confirmation...</span>
          </div>
        </div>
      }
    >
      <PaymentSuccessClient />
    </Suspense>
  );
}
