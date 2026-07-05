"use client";

import type { HTMLAttributes } from "react";
import { styled } from "styletron-react";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error" | "processing" | "matching" | "complete";
}

const StyledBadge = styled("div", ({ $theme, $variant }: any) => {
  const styles: any = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "9999px", // {rounded.pill}
    padding: "4px 10px",
    fontSize: "11px", // {typography.caption-uppercase}
    fontWeight: "600",
    letterSpacing: "0.88px",
    textTransform: "uppercase",
    fontFamily: $theme.typography.font100?.fontFamily || "Inter, sans-serif",
    userSelect: "none",
    border: "1px solid transparent",
  };

  if ($variant === "success") {
    // Success: #1f8a65 background/10, color #1f8a65
    styles.backgroundColor = "rgba(31, 138, 101, 0.1)";
    styles.color = "#1f8a65";
    styles.borderColor = "rgba(31, 138, 101, 0.2)";
  } else if ($variant === "error") {
    // Error: #cf2d56 background/10, color #cf2d56
    styles.backgroundColor = "rgba(207, 45, 86, 0.1)";
    styles.color = "#cf2d56";
    styles.borderColor = "rgba(207, 45, 86, 0.2)";
  } else if ($variant === "processing") {
    // Peach for thinking/processing: #dfa88f
    styles.backgroundColor = "rgba(223, 168, 143, 0.2)";
    styles.color = "#26251e";
    styles.borderColor = "rgba(223, 168, 143, 0.3)";
  } else if ($variant === "matching") {
    // Lavender for matching/editing: #c0a8dd
    styles.backgroundColor = "rgba(192, 168, 221, 0.2)";
    styles.color = "#26251e";
    styles.borderColor = "rgba(192, 168, 221, 0.3)";
  } else if ($variant === "complete") {
    // Gold/Done: #c08532
    styles.backgroundColor = "rgba(192, 133, 50, 0.2)";
    styles.color = "#26251e";
    styles.borderColor = "rgba(192, 133, 50, 0.3)";
  } else {
    // Default: surface strong (#e6e5e0), text ink (#26251e)
    styles.backgroundColor = "#e6e5e0";
    styles.color = "#26251e";
  }

  return styles;
});

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <StyledBadge $variant={variant} {...props} />;
}
Badge.displayName = "Badge";
