"use client";

import React, { useState } from "react";
import { MessageSquare, Check, Sparkles, ShieldCheck, Bell, Smartphone, Send } from "lucide-react";

interface WhatsAppDispatchCardProps {
  initialPhone?: string;
  destinationTitle?: string;
  targetDate?: string;
  projectedDate?: string;
  delayInDays?: number;
  monthlyGoalCapacity?: number;
  currency?: string;
}

const COUNTRY_CODES = [
  { code: "+254", country: "Kenya (KES)" },
  { code: "+33", country: "France / EU (€)" },
  { code: "+1", country: "US / Canada ($)" },
  { code: "+221", country: "Senegal (XOF)" },
  { code: "+225", country: "Ivory Coast (XOF)" },
  { code: "+237", country: "Cameroon (XAF)" },
  { code: "+250", country: "Rwanda (RWF)" },
  { code: "+256", country: "Uganda (UGX)" },
  { code: "+255", country: "Tanzania (TZS)" },
  { code: "+44", country: "UK (£)" },
];

export function WhatsAppDispatchCard({
  initialPhone = "+254 712 345 678",
  destinationTitle = "Start my business",
  targetDate = "Dec 2027",
  projectedDate = "Jan 2028",
  delayInDays = 0,
  monthlyGoalCapacity = 68000,
  currency = "KES",
}: WhatsAppDispatchCardProps) {
  const [countryCode, setCountryCode] = useState("+254");
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.replace(/^\+\d+\s*/, ""));
  const [isEnabled, setIsEnabled] = useState(true);
  const [frequency, setFrequency] = useState<"SUNDAY" | "BIWEEKLY">("SUNDAY");
  const [isSaved, setIsSaved] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSendTest = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  const fullPhone = `${countryCode} ${phoneNumber}`.trim();

  return (
    <div className="rounded-3xl border-2 border-emerald-500/30 bg-card p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
      {/* Decorative Accent Background Glow */}
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                WhatsApp Pro Weekly Intelligence
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                PRO ACTIVE
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Autonomous weekly financial coaching & trajectory alerts straight to your phone.
            </p>
          </div>
        </div>

        {/* Enable Toggle Switch */}
        <button
          type="button"
          onClick={() => setIsEnabled(!isEnabled)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
            isEnabled
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
              : "bg-secondary text-muted-foreground border border-border"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isEnabled ? "bg-white animate-pulse" : "bg-muted-foreground"}`} />
          <span>{isEnabled ? "Dispatch Active" : "Dispatch Paused"}</span>
        </button>
      </div>

      {/* Main Form & Phone Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Form Settings */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span>WhatsApp Phone Number</span>
            </label>

            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold text-foreground focus:border-emerald-500 focus:outline-hidden"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.country.split(" ")[0]})
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="712 345 678"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs sm:text-sm font-mono font-medium text-foreground placeholder:text-muted-foreground/50 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Delivery Frequency & Content Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Dispatch Schedule
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="SUNDAY">Every Sunday Evening (7:00 PM)</option>
                <option value="BIWEEKLY">Bi-Weekly (1st & 15th)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                AI Coach Tone
              </label>
              <div className="rounded-xl border border-border bg-secondary/30 px-3 py-2 text-xs font-medium text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Disciplined & Empowering</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 hover:opacity-95 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>WhatsApp Preferences Saved!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save WhatsApp Settings</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSendTest}
              className="rounded-xl border border-border/80 bg-secondary/50 text-foreground font-semibold text-xs px-4 py-2.5 hover:bg-secondary transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {testSent ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Test Sent to WhatsApp!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Send Test Message</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Phone WhatsApp Screen Simulation */}
        <div className="lg:col-span-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 dark:bg-emerald-950/40 p-4 space-y-3 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 text-[11px] font-mono text-emerald-400 font-bold">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE WHATSAPP SIMULATION</span>
            </div>
            <span>Sunday 19:00</span>
          </div>

          {/* WhatsApp Chat Bubble */}
          <div className="rounded-2xl rounded-tl-xs bg-emerald-900/40 border border-emerald-500/30 p-3.5 space-y-2 text-xs text-foreground font-sans shadow-lg">
            <div className="flex items-center gap-2 font-bold text-emerald-400 text-[11px] border-b border-emerald-500/20 pb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>UseAimly AI Intelligence Dispatch</span>
            </div>

            <p className="font-semibold text-foreground">
              👋 Hi Strategist! Here is your weekly trajectory update for <strong className="text-emerald-400 font-bold">"{destinationTitle}"</strong>:
            </p>

            <div className="rounded-xl bg-background/80 p-2.5 space-y-1 font-mono text-[11px] border border-emerald-500/20">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Date:</span>
                <span className="font-bold text-foreground">{targetDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Projected Date:</span>
                <span className="font-bold text-emerald-400">{projectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Capacity:</span>
                <span className="font-bold text-foreground">{currency} {monthlyGoalCapacity.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground italic">
              💡 <strong>AI Tip:</strong> "You are maintaining 100% pace. Your reserves protect 3.5 months of fixed living costs."
            </p>

            <div className="text-[9px] text-right font-mono text-emerald-400/80 pt-1">
              19:00 ✓✓
            </div>
          </div>

          <div className="text-[10px] text-center text-muted-foreground font-mono">
            Subscribed to {fullPhone}
          </div>
        </div>
      </div>
    </div>
  );
}
