"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { signupAction, signInWithGoogleAction, verifyOtpAction, resendOtpAction } from "@/lib/auth/actions";
import { UseaimlyLogo } from "@/components/design-system/UseaimlyLogo";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Globe, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck, RefreshCw, Sparkles, KeyRound, CheckCircle2 } from "lucide-react";
import { CurrencyCode } from "@/lib/types/finance";
import { PlanTier, PRICING_PLANS, PricingPlan } from "@/lib/types/pricing";
import { PayPalCheckoutModal } from "@/components/finance/PayPalCheckoutModal";
import { useAuth } from "@/lib/auth/auth-context";

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

function SignupFormContent() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawPlan = searchParams.get("plan");
  const selectedPlan: PlanTier = (rawPlan === "pro" || rawPlan === "premium" || rawPlan === "free") ? rawPlan : "free";

  const [checkoutModalPlan, setCheckoutModalPlan] = useState<PricingPlan | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, setIsGooglePending] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>("KES");
  const [password, setPassword] = useState("");

  // OTP Verification View State
  const [showOtpView, setShowOtpView] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Cooldown timer effect for Resend OTP button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

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
          planTier: selectedPlan,
        });

        if (!result.success) {
          const msg = typeof result.message === "string" && result.message.trim().length > 0 && result.message !== "{}"
            ? result.message.trim()
            : "Failed to create account. Please check your form details.";
          setServerError(msg);
        } else if (result.requiresOtp || result.email) {
          setOtpEmail(result.email || emailVal);
          setShowOtpView(true);
          setOtpSuccess(`Verification code sent to ${result.email || emailVal}`);
          setCooldown(30);
        } else if (result.redirectTo) {
          setSuccessMessage(result.message || "Account created successfully! Redirecting to onboarding...");
          setTimeout(() => {
            window.location.href = result.redirectTo!;
          }, 300);
        }
      } catch (err: any) {
        const msg = typeof err?.message === "string" && err.message.trim().length > 0 && err.message !== "{}"
          ? err.message.trim()
          : "An unexpected error occurred during signup. Please try again.";
        setServerError(msg);
      }
    });
  };

  const handleGoogleSignIn = async () => {
    setServerError(null);
    setSuccessMessage(null);
    setIsGooglePending(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "https://useaimly.com");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
          queryParams: {
            prompt: "select_account consent",
            access_type: "offline",
          },
        },
      });

      if (error || !data?.url) {
        setServerError("L'inscription via Google n'est pas activée sur Supabase. Veuillez créer votre compte avec votre adresse email ci-dessus.");
        setIsGooglePending(false);
      } else if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setServerError("Impossible d'initialiser Google. Veuillez utiliser l'inscription sécurisée par email.");
      setIsGooglePending(false);
    }
  };

  // OTP 6-Digit Handler
  const handleOtpChange = (index: number, val: string) => {
    const sanitized = val.replace(/\D/g, "");
    if (!sanitized && val !== "") return;

    const newDigits = [...otpDigits];
    newDigits[index] = sanitized.slice(-1);
    setOtpDigits(newDigits);
    setOtpError(null);

    // Auto-advance to next box
    if (sanitized && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }

    // Auto-submit if all 6 digits are filled
    const fullCode = newDigits.join("");
    if (fullCode.length === 6) {
      executeVerifyOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);
    setOtpError(null);

    if (pastedData.length === 6) {
      executeVerifyOtp(pastedData);
    } else if (pastedData.length > 0) {
      const nextFocus = Math.min(pastedData.length, 5);
      otpInputRefs[nextFocus].current?.focus();
    }
  };

  const executeVerifyOtp = async (code: string) => {
    if (code.length !== 6) {
      setOtpError("Please enter all 6 digits of your verification code.");
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const res = await verifyOtpAction({
        email: otpEmail,
        token: code,
      });

      if (!res.success) {
        setOtpError(res.message || "Invalid or expired verification code.");
        setIsVerifyingOtp(false);
      } else if (res.redirectTo) {
        setOtpSuccess("Verification successful! Directing to workspace...");
        setTimeout(() => {
          window.location.href = res.redirectTo!;
        }, 300);
      }
    } catch (err: any) {
      setOtpError(err?.message || "Verification failed. Please try again.");
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || isResendingOtp) return;
    setIsResendingOtp(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const res = await resendOtpAction(otpEmail);
      if (res.success) {
        setOtpSuccess(res.message || "A new 6-digit verification code has been sent!");
        setCooldown(30);
      } else {
        setOtpError(res.message || "Failed to resend verification code.");
      }
    } catch (err: any) {
      setOtpError(err?.message || "Unable to resend verification code.");
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6 animate-fadeIn">
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground font-editorial">
            {showOtpView ? "Verify your email" : "Start with your destination"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {showOtpView
              ? `Enter the 6-digit security code sent to ${otpEmail || "your email"} to activate your workspace.`
              : "Create your account to simulate financial decisions and see tomorrow before deciding today."}
          </p>

          {/* Plan Selector Pills */}
          {!showOtpView && (
            <div className="pt-3 flex flex-col items-center gap-2">
              <div className="flex items-center p-1 rounded-full border border-border/80 bg-secondary/50 text-xs font-mono font-bold shadow-xs">
                <button
                  type="button"
                  onClick={() => router.replace("/signup?plan=free")}
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    selectedPlan === "free"
                      ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => router.replace("/signup?plan=pro")}
                  className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                    selectedPlan === "pro"
                      ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Aimly Pro</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded-full">
                    14d Trial
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => router.replace("/signup?plan=premium")}
                  className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                    selectedPlan === "premium"
                      ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Aimly Premium</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded-full">
                    VIP
                  </span>
                </button>
              </div>

              {selectedPlan !== "free" && (
                <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {selectedPlan === "pro"
                      ? "Pro Plan: 14-Day Free Trial Included • Cancel anytime"
                      : "Premium Plan: 14-Day Full Access Trial • VIP Features"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Card Container */}
        <div className="rounded-[2.5rem] border border-border/80 bg-card/90 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-primary/5 space-y-6">
          {showOtpView ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Branding Badge */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary/40 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">UseAimly Security</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{otpEmail}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOtpView(false)}
                  className="text-[11px] font-mono font-bold text-primary hover:underline cursor-pointer"
                >
                  Change Email
                </button>
              </div>

              {otpError && (
                <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpSuccess && (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-500 font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{otpSuccess}</span>
                </div>
              )}

              {/* 6 Individual Digit Inputs */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-foreground text-center block">
                  Enter 6-Digit Code
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-2.5 py-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpInputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      disabled={isVerifyingOtp}
                      className="w-10 h-12 sm:w-11 sm:h-13 text-center font-mono font-black text-xl sm:text-2xl rounded-2xl border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-inner disabled:opacity-50"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-center text-muted-foreground font-mono">
                  Tip: You can paste all 6 digits directly
                </p>
              </div>

              {/* Submit Verification Button */}
              <button
                type="button"
                onClick={() => executeVerifyOtp(otpDigits.join(""))}
                disabled={isVerifyingOtp || otpDigits.join("").length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white font-bold text-xs sm:text-sm px-6 py-3.5 shadow-lg shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isVerifyingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Launch Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend & Security Help Options */}
              <div className="pt-2 border-t border-border/70 flex flex-col items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || isResendingOtp}
                  className="text-muted-foreground hover:text-foreground font-medium disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isResendingOtp
                    ? "Envoi du nouveau code..."
                    : cooldown > 0
                    ? `Renvoyer le code dans ${cooldown}s`
                    : "Vous n'avez pas reçu le code ? Renvoyer le code"}
                </button>

                <p className="text-[10px] text-center text-muted-foreground/80 font-mono">
                  Pensez à vérifier vos courriers indésirables (Spam) si le code tarde à arriver.
                </p>
              </div>
            </div>
          ) : (
            /* STANDARD SIGNUP FORM VIEW */
            <>
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
                      <option value="CAD">CAD — Canadian Dollar (C$)</option>
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
                        <span>
                          {selectedPlan === "premium"
                            ? "Create Account & Unlock Aimly Premium"
                            : selectedPlan === "pro"
                            ? "Create Account & Start 14-Day Pro Trial"
                            : "Create Free Account"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Footer link */}
              <div className="pt-2 border-t border-border/70 flex flex-col items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>Already have an account?</span>
                  <Link href="/login" className="text-primary font-bold hover:underline">
                    Sign in
                  </Link>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>14-Day Money-Back Guarantee • Zero Risk</span>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Built-in PayPal Checkout Modal for direct payments */}
      <PayPalCheckoutModal
        isOpen={Boolean(checkoutModalPlan)}
        onClose={() => setCheckoutModalPlan(null)}
        plan={checkoutModalPlan}
        isYearly={true}
      />
    </div>
  );
}

export default function SignupPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-xs font-mono text-muted-foreground">Loading signup...</div>}>
      <SignupFormContent />
    </React.Suspense>
  );
}
