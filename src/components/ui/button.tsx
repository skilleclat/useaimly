import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30",
        secondary:
          "bg-slate-800/80 text-slate-100 hover:bg-slate-700 border border-slate-700/60 backdrop-blur-md",
        outline:
          "border border-slate-700 bg-transparent hover:bg-slate-800/60 text-slate-200",
        ghost:
          "hover:bg-slate-800/60 text-slate-300 hover:text-slate-100",
        destructive:
          "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30",
        Useaimly:
          "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-glow-emerald hover:brightness-110",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-13 rounded-2xl px-8 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
