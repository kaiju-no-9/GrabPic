import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "inline-block select-none text-sm font-medium leading-[1.4] text-ink",
        className,
      )}
      {...props}
    />
  );
}

Label.displayName = "Label";
