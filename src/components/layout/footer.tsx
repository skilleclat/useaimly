"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Container } from "./container";
import { UseaimlyLogo } from "../design-system/UseaimlyLogo";

export function Footer() {
  const pathname = usePathname();

  // Hide root footer on authenticated application pages
  if (pathname.startsWith("/app")) {
    return null;
  }

  return (
    <footer className="mt-16 border-t border-border/60 bg-card/40 py-10 text-muted-foreground transition-colors duration-200">
      <Container className="flex flex-col md:flex-row items-center justify-between gap-6">
        <UseaimlyLogo size="sm" />

        <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
          <span>Goal-Aware Financial Intelligence</span>
          <span>•</span>
          <span>Privacy-First Decision Support</span>
          <span>•</span>
          <span>Cash Affordability ≠ Plan Affordability</span>
        </div>
      </Container>
    </footer>
  );
}
