"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[14px] font-medium transition-colors duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
  {
    variants: {
      variant: {
        default: "bg-ink text-canvas hover:bg-ink/90",
        primary: "bg-primary text-on-primary hover:bg-primary-active active:bg-primary-active",
        secondary:
          "bg-surface-card text-ink border border-hairline-strong hover:border-ink hover:bg-canvas-soft active:bg-surface-strong",
        outline:
          "bg-transparent text-body border border-hairline hover:bg-surface-card hover:text-ink hover:border-hairline-strong",
        ghost: "bg-transparent text-body hover:bg-surface-strong hover:text-ink",
        destructive:
          "bg-transparent text-error border border-error/20 hover:bg-error/5",
      },
      size: {
        default: "h-10 px-[18px]",
        sm: "h-8 px-3",
        lg: "h-11 px-5",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
