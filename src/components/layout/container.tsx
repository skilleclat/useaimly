import React from "react";
import { cn } from "@/lib/utils/cn";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "narrow" | "default" | "wide" | "hero" | "ultra" | "prose" | "full";
}

const sizeClasses: Record<NonNullable<ContainerProps["size"]>, string> = {
  narrow: "max-w-4xl",
  prose: "max-w-3xl",
  default: "max-w-7xl",
  wide: "max-w-[1520px]",
  hero: "max-w-[1760px]",
  ultra: "max-w-[1880px]",
  full: "max-w-full",
};

export function Container({ children, className, size = "default", ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12", sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
