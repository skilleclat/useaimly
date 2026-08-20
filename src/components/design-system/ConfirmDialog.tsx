"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils/cn";
import { X, AlertCircle } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  intent?: "danger" | "primary" | "warning";
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Proceed",
  cancelLabel = "Cancel",
  onConfirm,
  intent = "primary",
  children,
}: ConfirmDialogProps) {
  const intentBtnStyles = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
    warning: "bg-amber-600 text-white hover:opacity-90",
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity" />

        {/* Content Box */}
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-3xl border border-border bg-card p-6 shadow-elevation-3 duration-200 focus:outline-none"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-foreground font-bold font-editorial text-lg">
              <AlertCircle className="w-5 h-5 text-primary" />
              <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
            </div>

            <DialogPrimitive.Close className="rounded-xl p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <X className="w-4 h-4" />
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Description className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {description}
          </DialogPrimitive.Description>

          {children && <div className="mt-4">{children}</div>}

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="rounded-2xl border border-border bg-secondary/50 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                {cancelLabel}
              </button>
            </DialogPrimitive.Close>

            <button
              type="button"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className={cn(
                "rounded-2xl px-5 py-2 text-xs font-bold shadow-sm transition-all",
                intentBtnStyles[intent]
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
