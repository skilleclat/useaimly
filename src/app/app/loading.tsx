import React from "react";
import { RefreshCw } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-secondary rounded-md" />
        <div className="h-10 w-72 bg-secondary rounded-2xl" />
        <div className="h-4 w-96 bg-secondary rounded-md" />
      </div>

      {/* Hero Card Skeleton */}
      <div className="rounded-3xl border border-border bg-card p-8 h-64 space-y-4 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="h-6 w-48 bg-secondary rounded-xl" />
          <div className="h-6 w-24 bg-secondary rounded-full" />
        </div>
        <div className="h-24 w-full bg-secondary/50 rounded-2xl" />
        <div className="h-4 w-64 bg-secondary rounded-md" />
      </div>

      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-3xl border border-border bg-card p-6 h-36 space-y-3">
            <div className="h-4 w-28 bg-secondary rounded-md" />
            <div className="h-8 w-36 bg-secondary rounded-xl" />
            <div className="h-3 w-20 bg-secondary rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
