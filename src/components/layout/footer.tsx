import React from "react";
import { Container } from "./container";
import { UseaimlyLogo } from "../design-system/UseaimlyLogo";
import { CheckCircle2, Sparkles, Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card/60 py-12 text-muted-foreground transition-colors duration-200">
      <Container className="flex flex-col md:flex-row items-center justify-between gap-6">
        <UseaimlyLogo size="sm" />

        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            <span>Deterministic TS Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
            <span>AI Narrative Layer</span>
          </div>
          <span className="font-editorial italic">
            &ldquo;Cash affordability ≠ Plan affordability&rdquo;
          </span>
        </div>
      </Container>
    </footer>
  );
}
