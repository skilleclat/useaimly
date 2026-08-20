import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export interface UseaimlyLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showTagline?: boolean;
  markOnly?: boolean;
  href?: string;
}

export function UseaimlyMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 transition-transform duration-300 group-hover:scale-105", className)}
    >
      {/* Outer circular aperture dial */}
      <path
        d="M 86 65 A 39 39 0 1 1 89 50"
        stroke="#FF4D26"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Directional upward target chevron */}
      <path
        d="M 50 23 L 76 66 L 50 54 L 24 66 Z"
        fill="#FF4D26"
      />
    </svg>
  );
}

export function UseaimlyLogo({
  className,
  size = "md",
  showText = true,
  showTagline = false,
  markOnly = false,
  href = "/",
}: UseaimlyLogoProps) {
  const sizeConfig = {
    xs: { iconSize: 20, textClass: "text-sm tracking-tight", subTextClass: "text-[8px]" },
    sm: { iconSize: 26, textClass: "text-lg tracking-tight", subTextClass: "text-[9px]" },
    md: { iconSize: 34, textClass: "text-2xl tracking-tight", subTextClass: "text-[10px]" },
    lg: { iconSize: 44, textClass: "text-3xl tracking-tight", subTextClass: "text-xs" },
    xl: { iconSize: 58, textClass: "text-4xl sm:text-5xl tracking-tight", subTextClass: "text-sm" },
  };

  const { iconSize, textClass, subTextClass } = sizeConfig[size];

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 group cursor-pointer select-none", className)}>
      <UseaimlyMark size={iconSize} />

      {!markOnly && showText && (
        <div className="flex flex-col">
          <div className={cn("font-black leading-none flex items-baseline font-sans", textClass)}>
            <span className="text-foreground transition-colors">Use</span>
            <span className="text-[#FF4D26]">Aimly</span>
          </div>

          {showTagline && (
            <span
              className={cn(
                "text-muted-foreground font-mono font-medium tracking-wider uppercase mt-1 leading-none",
                subTextClass
              )}
            >
              See tomorrow before deciding today
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export const KesonaLogo = UseaimlyLogo;
export const KesonaMark = UseaimlyMark;
export default UseaimlyLogo;
