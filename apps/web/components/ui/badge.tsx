import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex select-none items-center rounded-pill border border-transparent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.88px]",
  {
    variants: {
      variant: {
        default: "bg-surface-strong text-ink",
        success: "bg-success/10 text-success border-success/20",
        error: "bg-error/10 text-error border-error/20",
        processing: "bg-pill-processing/20 text-ink border-pill-processing/30",
        matching: "bg-pill-matching/20 text-ink border-pill-matching/30",
        complete: "bg-pill-complete/20 text-ink border-pill-complete/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

Badge.displayName = "Badge";
