"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Button as BaseButton, KIND, SIZE, SHAPE } from "baseui/button";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  asChild?: boolean; // Kept for compatibility, though we render BaseButton directly
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "default", size = "default", isLoading, onClick, disabled, className, ...props }, ref) => {
    // Map variant to Base Web KIND
    let kind: typeof KIND[keyof typeof KIND] = KIND.primary;
    if (variant === "secondary" || variant === "outline") {
      kind = KIND.secondary;
    } else if (variant === "ghost") {
      kind = KIND.tertiary;
    } else if (variant === "destructive") {
      kind = KIND.secondary;
    }

    // Map size to Base Web SIZE
    let baseSize: typeof SIZE[keyof typeof SIZE] = SIZE.default;
    if (size === "sm") {
      baseSize = SIZE.compact;
    } else if (size === "lg") {
      baseSize = SIZE.large;
    }

    // Map shape for icon button
    const shape = size === "icon" ? SHAPE.square : SHAPE.default;

    // Apply custom overrides based on degin.md
    const overrides = {
      BaseButton: {
        style: () => {
          const styles: any = {
            borderRadius: "8px", // {rounded.md} is 8px
            fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: "500",
            fontSize: "14px",
            height: size === "icon" || size === "default" ? "40px" : size === "sm" ? "32px" : "44px",
            width: size === "icon" ? "40px" : "auto",
            paddingLeft: size === "icon" ? "0" : size === "sm" ? "12px" : "18px",
            paddingRight: size === "icon" ? "0" : size === "sm" ? "12px" : "18px",
            transition: "all 0.2s ease-in-out",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          };

          if (variant === "primary") {
            // Cursor Orange (#f54e00)
            styles.backgroundColor = "#f54e00";
            styles.color = "#ffffff";
            styles.border = "none";
            styles[":hover"] = { backgroundColor: "#d04200" };
            styles[":active"] = { backgroundColor: "#d04200" };
          } else if (variant === "secondary") {
            // White card pill on cream canvas (#ffffff, border hairline strong #cfcdc4)
            styles.backgroundColor = "#ffffff";
            styles.color = "#26251e";
            styles.border = "1px solid #cfcdc4";
            styles[":hover"] = { borderColor: "#26251e", backgroundColor: "#fafaf7" };
            styles[":active"] = { backgroundColor: "#e6e5e0" };
          } else if (variant === "outline") {
            // Border hairline #e6e5e0
            styles.backgroundColor = "transparent";
            styles.color = "#5a5852";
            styles.border = "1px solid #e6e5e0";
            styles[":hover"] = { backgroundColor: "#ffffff", color: "#26251e", borderColor: "#cfcdc4" };
          } else if (variant === "ghost") {
            styles.backgroundColor = "transparent";
            styles.color = "#5a5852";
            styles.border = "none";
            styles[":hover"] = { backgroundColor: "#e6e5e0", color: "#26251e" };
          } else if (variant === "destructive") {
            styles.backgroundColor = "transparent";
            styles.color = "#cf2d56";
            styles.border = "1px solid rgba(207, 45, 86, 0.2)";
            styles[":hover"] = { backgroundColor: "rgba(207, 45, 86, 0.05)" };
          } else {
            // Default: "bg-[--color-ink] text-[--color-canvas] hover:bg-[--color-ink]/90"
            // Ink: #26251e, Canvas: #f7f7f4
            styles.backgroundColor = "#26251e";
            styles.color = "#f7f7f4";
            styles.border = "none";
            styles[":hover"] = { backgroundColor: "rgba(38, 37, 30, 0.9)" };
          }

          return styles;
        }
      }
    };

    return (
      <BaseButton
        ref={ref}
        kind={kind}
        size={baseSize}
        shape={shape}
        isLoading={isLoading}
        disabled={disabled}
        onClick={onClick}
        overrides={overrides}
        {...(props as any)}
      >
        {children}
      </BaseButton>
    );
  }
);

Button.displayName = "Button";
