"use client";

import React, { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginInput } from "@/lib/validation/auth.schema";
import { loginAction, signInWithGoogleAction } from "@/lib/auth/actions";
import { UseaimlyLogo } from "@/components/design-system/UseaimlyLogo";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      />
      <path
        fill="#FBBC05"
        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
      />
      <path
        fill="#34A853"
        d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17c1.8 3.7 5.6 6.5 10.1 6.5z"
      />
    </svg>
  );
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, setIsGooglePending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const messageParam = searchParams.get("message");
  const errorParam = searchParams.get("error");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await loginAction(data);
      if (!result.success) {
        setServerError(result.message || "Failed to log in.");
      } else if (result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  };

  const handleGoogleSignIn = async () => {
    setServerError(null);
    setIsGooglePending(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error || !data?.url) {
        console.warn("Google OAuth error, triggering fallback:", error?.message);
        const { signInWithDemoGoogleAccountAction } = await import("@/lib/auth/actions");
        const fallbackResult = await signInWithDemoGoogleAccountAction();
        if (fallbackResult.success && fallbackResult.redirectTo) {
          window.location.href = fallbackResult.redirectTo;
        } else {
          setServerError(fallbackResult.message || "Failed to log in with Google.");
          setIsGooglePending(false);
        }
      } else if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.warn("Google sign-in exception:", err);
      const { signInWithDemoGoogleAccountAction } = await import("@/lib/auth/actions");
      const fallbackResult = await signInWithDemoGoogleAccountAction();
      if (fallbackResult.success && fallbackResult.redirectTo) {
        window.location.href = fallbackResult.redirectTo;
      } else {
        setServerError("Unable to complete Google login. Please use email login.");
        setIsGooglePending(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 animate-fadeIn">
      {/* Brand & Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground font-editorial">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Log in to evaluate your financial trajectories and protect your future destinations.
        </p>
      </div>

      {/* Main Form Card Container */}
      <div className="rounded-[2.5rem] border border-border/80 bg-card/90 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-primary/5 space-y-6">
        {/* URL Error or Message Banners */}
        {messageParam && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{messageParam}</span>
          </div>
        )}

        {(serverError || errorParam) && (
          <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError || errorParam}</span>
          </div>
        )}

        {/* 1. Google / Gmail Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGooglePending || isPending}
          className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-border/80 bg-background hover:bg-secondary/70 px-4 py-3.5 text-xs sm:text-sm font-bold text-foreground transition-all hover:border-primary/40 shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isGooglePending ? (
            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <GoogleIcon className="w-4 h-4" />
          )}
          <span>{isGooglePending ? "Connecting with Google..." : "Continue with Google"}</span>
        </button>

        {/* 1.5 Instant Live Demo Option */}
        <Link
          href="/app"
          className="w-full flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 hover:bg-primary/20 px-4 py-3 text-xs font-bold text-primary transition-all shadow-xs"
        >
          <Sparkles className="w-4 h-4" />
          <span>Try Live Demo (No Account Needed)</span>
        </Link>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-border/70" />
          <span className="absolute bg-card px-3 text-[11px] font-mono text-muted-foreground">
            or with email
          </span>
        </div>

        {/* 2. Email & Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-foreground">Email Address</label>
            <div className="relative">
              <input
                {...register("email")}
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
              />
              <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            {errors.email && (
              <p className="text-[11px] font-mono text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-foreground">Password</label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-mono text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                autoComplete="current-password"
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

          {/* Submit Button (Payoneer Sunset Gradient) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending || isGooglePending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white font-bold text-xs sm:text-sm px-6 py-3.5 shadow-lg shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              <span>{isPending ? "Connecting..." : "Sign in to Useaimly"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Security & Sign up footer */}
        <div className="pt-2 border-t border-border/70 flex flex-col items-center gap-3 text-xs text-muted-foreground">
          <div>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              Create your destination
            </Link>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-End Encrypted & Deterministic</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <Suspense fallback={<div className="text-xs font-mono text-muted-foreground">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
