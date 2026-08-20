"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RefreshCw, Compass, ArrowLeft } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl border border-destructive/30 bg-card p-8 space-y-6 text-center shadow-elevation-2 animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertOctagon className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono font-bold text-destructive uppercase tracking-wider">
            System Notice
          </div>
          <h2 className="text-2xl font-bold font-editorial text-foreground">
            Financial state calculation paused
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Useaimly encountered an unexpected condition while compiling your financial trajectory. Your stored balance sheet data remains safe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground hover:opacity-95 transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate State</span>
          </button>

          <Link
            href="/app"
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-secondary py-3 text-xs font-bold text-foreground hover:bg-secondary/80 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Today</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
