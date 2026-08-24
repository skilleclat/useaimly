"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckCircle2, Target, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { language } = useI18n();
  const isFr = language === "fr";
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      // Strictly mobile only (< 768px)
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // On server rendering or on desktop screens (>= 768px), DO NOT RENDER AT ALL
  if (!mounted || !isMobile) {
    return null;
  }

  const NAV_ITEMS = [
    {
      label: isFr ? "Accueil" : "Home",
      href: "/app",
      icon: <Home className="w-4 h-4" />,
      exact: true,
    },
    {
      label: isFr ? "Décisions" : "Decisions",
      href: "/app/decide",
      icon: <CheckCircle2 className="w-4 h-4" />,
      exact: false,
    },
    {
      label: isFr ? "Objectifs" : "Goals",
      href: "/app/goals",
      icon: <Target className="w-4 h-4" />,
      exact: false,
    },
    {
      label: isFr ? "Ask Aimly" : "Ask Aimly",
      href: "/app/ask",
      icon: <Sparkles className="w-4 h-4" />,
      exact: false,
    },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none md:hidden lg:hidden">
      <nav className="pointer-events-auto w-full max-w-md bg-[#062317] text-white rounded-3xl px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] border border-emerald-900/30">
        <div className="grid grid-cols-4 items-center">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === "/app"
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 transition-all duration-200 ${
                  isActive
                    ? "text-[#00A859] font-bold scale-105"
                    : "text-gray-400 hover:text-white font-medium"
                }`}
              >
                <div className={`p-1.5 rounded-full ${isActive ? "bg-white/10" : ""}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-semibold">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
