import React from "react";
import { Compass, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-dashed border-border bg-card/50 p-8 sm:p-12 text-center text-card-foreground flex flex-col items-center justify-center space-y-4 max-w-md mx-auto",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary border border-border">
        {icon || <Compass className="w-6 h-6" />}
      </div>

      <div className="space-y-1">
        <h4 className="text-base font-bold font-editorial text-foreground">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-95 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
