"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordSchema, ResetPasswordInput } from "@/lib/validation/auth.schema";
import { resetPasswordAction } from "@/lib/auth/actions";
import { UseaimlyLogo } from "@/components/design-system/UseaimlyLogo";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await resetPasswordAction(data);
      if (!result.success) {
        setServerError(result.message || "Failed to reset password.");
      } else if (result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6 animate-fadeIn">
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-block">
            <UseaimlyLogo size="md" showTagline={false} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Set new password
          </h1>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Create a secure password with at least 8 characters.
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-[2.5rem] border border-border/80 bg-card p-8 sm:p-10 shadow-2xl space-y-6">
          {serverError && (
            <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-foreground">New Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] font-mono text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-foreground">Confirm New Password</label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] font-mono text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white font-bold text-xs sm:text-sm px-6 py-3.5 shadow-lg shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                <span>{isPending ? "Updating password..." : "Update Password"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
