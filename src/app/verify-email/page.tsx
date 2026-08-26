"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtpAction, resendOtpAction } from "@/lib/auth/actions";
import { useI18n } from "@/lib/i18n/i18n-context";
import { KeyRound, ShieldCheck, AlertCircle, RefreshCw, ArrowRight, Mail, ArrowLeft, RotateCcw, Clock } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const { language } = useI18n();
  const isFr = language === "fr";

  const [email, setEmail] = useState(emailParam);
  // Default to 8 digits support (Supabase can send 6 or 8 digits)
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", "", "", ""]);
  const [codeLength, setCodeLength] = useState<6 | 8>(8);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(
    emailParam
      ? (isFr ? `Un code de sécurité a été envoyé à ${emailParam}` : `A security code has been sent to ${emailParam}`)
      : null
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (emailParam && emailParam !== email) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  // 60-Second Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const activeInputsCount = codeLength;

  const handleDigitChange = (index: number, val: string) => {
    const sanitized = val.replace(/\D/g, "");
    if (!sanitized && val !== "") return;

    const newDigits = [...digits];
    newDigits[index] = sanitized.slice(-1);
    setDigits(newDigits);
    setErrorMsg(null);

    // Auto-advance to next box
    if (sanitized && index < activeInputsCount - 1) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit if all digits are typed
    const fullCode = newDigits.slice(0, activeInputsCount).join("");
    if (fullCode.length === activeInputsCount) {
      submitVerification(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    if (!pasted) return;

    const detectedLen = pasted.length === 6 ? 6 : 8;
    setCodeLength(detectedLen);

    const newDigits = ["", "", "", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    setErrorMsg(null);

    if (pasted.length >= 6) {
      submitVerification(pasted);
    } else if (pasted.length > 0) {
      const nextFocus = Math.min(pasted.length, detectedLen - 1);
      inputRefs[nextFocus].current?.focus();
    }
  };

  const submitVerification = async (codeToSubmit?: string) => {
    const rawCode = (codeToSubmit || digits.slice(0, activeInputsCount).join("")).replace(/\s/g, "").trim();
    if (!email || !email.includes("@")) {
      setErrorMsg(isFr ? "Veuillez renseigner une adresse email valide." : "Please enter a valid email address.");
      return;
    }
    if (rawCode.length < 6) {
      setErrorMsg(isFr ? "Veuillez saisir le code de vérification complet." : "Please enter the complete verification code.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Verify via Server Action
      const result = await verifyOtpAction({
        email: email.trim(),
        token: rawCode,
      });

      if (!result.success) {
        // 2. Client-side fallback attempt directly against Supabase Auth
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          let clientRes = await supabase.auth.verifyOtp({
            email: email.trim(),
            token: rawCode,
            type: "signup",
          });
          if (clientRes.error) {
            clientRes = await supabase.auth.verifyOtp({
              email: email.trim(),
              token: rawCode,
              type: "email",
            });
          }

          if (!clientRes.error && clientRes.data?.user) {
            setSuccessMsg(isFr ? "Email vérifié avec succès ! Chargement de votre espace..." : "Email verified successfully! Loading workspace...");
            setTimeout(() => {
              window.location.href = "/onboarding";
            }, 300);
            return;
          }
        } catch {
          // Continue with server error message
        }

        setErrorMsg(
          result.message ||
          (isFr
            ? "Code de vérification invalide ou expiré. Assurez-vous d'utiliser le dernier code reçu."
            : "Invalid or expired verification code. Please ensure you use the newest code received.")
        );
        setIsVerifying(false);
      } else {
        setSuccessMsg(isFr ? "Email vérifié avec succès ! Chargement de votre espace..." : "Email verified successfully! Loading workspace...");
        setTimeout(() => {
          window.location.href = result.redirectTo || "/onboarding";
        }, 300);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isFr ? "Échec de la vérification. Veuillez réessayer." : "Verification failed. Please try again."));
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending || !email) return;
    setIsResending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await resendOtpAction(email.trim());
      if (result.success) {
        setSuccessMsg(
          isFr
            ? "Un nouveau code de sécurité vous a été envoyé par email."
            : "A new security verification code has been sent to your email."
        );
        setCooldown(60);
      } else {
        setErrorMsg(result.message || (isFr ? "Impossible de renvoyer le code pour le moment." : "Unable to resend verification code right now."));
      }
    } catch (err: any) {
      setErrorMsg(isFr ? "Erreur lors du renvoi du code. Veuillez patienter." : "Error while resending code. Please wait.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6 animate-fadeIn">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground font-editorial">
            {isFr ? "Vérifiez votre email" : "Verify your email"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {isFr
              ? "Pour sécuriser votre compte UseAimly, entrez le code de confirmation envoyé à votre adresse email."
              : "To secure your UseAimly account, enter the confirmation code sent to your email address."}
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-[2.5rem] border border-border/80 bg-card/90 backdrop-blur-xl p-6 sm:p-10 shadow-2xl shadow-primary/5 space-y-6">
          {/* Email Info Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary/40 border border-border/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground truncate">
                  {isFr ? "Email de destination" : "Destination Email"}
                </div>
                <div className="text-[11px] font-mono text-muted-foreground truncate">{email || (isFr ? "Email non spécifié" : "No email specified")}</div>
              </div>
            </div>
            <Link
              href="/signup"
              className="text-[11px] font-mono font-bold text-primary hover:underline shrink-0 flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>{isFr ? "Changer" : "Change"}</span>
            </Link>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-500 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Code Length Switcher (6 or 8 digits) */}
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
              {isFr ? `Code de sécurité (${activeInputsCount} caractères)` : `Security Code (${activeInputsCount} digits)`}
            </label>
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setCodeLength(6)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  codeLength === 6
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {isFr ? "6 Chiffres" : "6 Digits"}
              </button>
              <button
                type="button"
                onClick={() => setCodeLength(8)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  codeLength === 8
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {isFr ? "8 Chiffres" : "8 Digits"}
              </button>
            </div>
          </div>

          {/* Dynamic Digit Input Boxes (6 or 8) */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-2 flex-wrap">
              {digits.slice(0, activeInputsCount).map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  disabled={isVerifying}
                  className="w-9 h-12 sm:w-11 sm:h-14 text-center font-mono font-black text-lg sm:text-2xl rounded-2xl border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-inner disabled:opacity-50"
                />
              ))}
            </div>
            <p className="text-[11px] text-center text-muted-foreground font-mono">
              {isFr
                ? "Astuce : vous pouvez coller directement le code reçu par email"
                : "Tip: you can paste the code directly from your email"}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => submitVerification()}
            disabled={isVerifying || digits.slice(0, activeInputsCount).join("").length < 6}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B4A] via-[#FF5533] to-[#FF3820] text-white font-bold text-xs sm:text-sm px-6 py-3.5 shadow-lg shadow-orange-500/25 hover:opacity-95 hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isFr ? "Vérification du code..." : "Verifying Code..."}</span>
              </>
            ) : (
              <>
                <span>{isFr ? "Valider et Activer mon Compte" : "Verify & Activate Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* 60s Countdown & Resend Section */}
          <div className="pt-3 border-t border-border/70 flex flex-col items-center gap-2 text-xs">
            {cooldown > 0 ? (
              <div className="flex items-center gap-2 text-muted-foreground font-mono bg-secondary/40 px-3.5 py-1.5 rounded-full border border-border/60">
                <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span>
                  {isFr ? "Renvoyer un nouveau code dans" : "Resend a new code in"}{" "}
                  <strong className="text-foreground">{cooldown}s</strong>
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 text-primary font-bold hover:underline transition-all cursor-pointer px-3 py-1.5 rounded-full hover:bg-primary/10"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                <span>
                  {isResending
                    ? (isFr ? "Envoi du code en cours..." : "Sending code...")
                    : (isFr ? "Vous n'avez pas reçu le code ? Renvoyer un code" : "Didn't receive the code? Resend Code")}
                </span>
              </button>
            )}

            <p className="text-[10px] text-center text-muted-foreground/80 font-mono pt-1">
              {isFr
                ? "Pensez à vérifier votre dossier de Courriers indésirables (Spam) si le code tarde à apparaître."
                : "Check your spam or junk folder if the confirmation code does not appear in your inbox."}
            </p>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-muted-foreground/80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {isFr
              ? "Authentification sécurisée & déterministe certifiée Supabase Auth"
              : "Secure & deterministic authentication powered by Supabase Auth"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-xs font-mono text-muted-foreground">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
