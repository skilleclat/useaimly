"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { signupAction, signInWithGoogleAction } from "@/lib/auth/actions";
import { UseaimlyLogo } from "@/components/design-system/UseaimlyLogo";
import { useRouter } from "next/navigation";
import { User, Mail, Globe, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck, RefreshCw } from "lucide-react";
import { CurrencyCode } from "@/lib/types/finance";

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

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, setIsGooglePending] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>("KES");
  const [password, setPassword] = useState("");

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const formFullName = (formData.get("fullName") as string) || fullName;
    const formEmail = (formData.get("email") as string) || email;
    const formCurrency = ((formData.get("preferredCurrency") as string) || preferredCurrency) as CurrencyCode;
    const formPassword = (formData.get("password") as string) || password;

    const nameVal = (formFullName || "").trim();
    const emailVal = (formEmail || "").trim();
    const passVal = (formPassword || "").trim();

    if (!nameVal || nameVal.length < 2) {
      setServerError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!emailVal || !emailVal.includes("@")) {
      setServerError("Please enter a valid email address.");
      return;
    }
    if (!passVal || passVal.length < 6) {
      setServerError("Password must be at least 6 characters.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await signupAction({
          fullName: nameVal,
          email: emailVal,
          preferredCurrency: formCurrency || preferredCurrency,
          password: passVal,
        });

        if (!result.success) {
          setServerError(result.message || "Failed to create account.");
        } else if (result.redirectTo) {
          window.location.href = result.redirectTo;
        }
      } catch (err: any) {
        setServerError(err?.message || "An unexpected error occurred during signup.");
      }
    });
  };

  const handleGoogleSignIn = async () => {
    setServerError(null);
    setSuccessMessage(null);
    setIsGooglePending(true);
    try {
      const result = await signInWithGoogleAction();
      if (result.success && result.redirectTo) {
        window.location.href = result.redirectTo;
      } else {
        setServerError(result.message || "Failed to connect with Google.");
        setIsGooglePending(false);
      }
    } catch {
      setServerError("An unexpected error occurred with Google signup.");
      setIsGooglePending(false);
    }
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
            Start with your destination
          </h1>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Create your account to simulate financial decisions and see tomorrow before deciding today.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="rounded-[2.5rem] border border-border/80 bg-card p-8 sm:p-10 shadow-2xl space-y-6">
          {serverError && (
            <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-500 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Google / Gmail Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGooglePending || isPending}
            className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-border bg-background hover:bg-secondary/70 px-4 py-3.5 text-xs sm:text-sm font-bold text-foreground transition-all hover:border-primary/40 shadow-xs active:scale-[0.99] disabled:opacity-50"
          >
            {isGooglePending ? (
              <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <GoogleIcon className="w-4 h-4" />
            )}
            <span>{isGooglePending ? "Connexion Google..." : "Continuer avec Google / Gmail"}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border/70" />
            <span className="absolute bg-card px-3 text-[11px] font-mono text-muted-foreground">
              ou par email
            </span>
          </div>

          {/* 2. Email & Password Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-foreground">Full Name</label>
              <div className="relative">
                <input
                  name="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  autoComplete="name"
                  required
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                />
                <User className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-foreground">Email Address</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                />
                <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Preferred Currency */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-foreground">Preferred Currency</label>
              <div className="relative">
                <select
                  name="preferredCurrency"
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value as CurrencyCode)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer transition-colors"
                >
                  <option value="KES">KES — Kenyan Shilling (KES)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="EUR">EUR — Euro (€)</option>
                  <option value="GBP">GBP — British Pound (£)</option>
                </select>
                <Globe className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-foreground">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  required
                  minLength={6}
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
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending || isGooglePending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white font-bold text-xs sm:text-sm px-6 py-3.5 shadow-lg shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer link */}
          <div className="pt-2 border-t border-border/70 flex flex-col items-center gap-3 text-xs text-muted-foreground">
            <div>
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign in
              </Link>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Banking Logins Required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
