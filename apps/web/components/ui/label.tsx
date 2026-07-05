"use client";

import type { LabelHTMLAttributes } from "react";
import { styled } from "styletron-react";

const StyledLabel = styled("label", ({ $theme }: any) => ({
  fontSize: "14px",
  fontWeight: "500",
  lineHeight: "1.4",
  color: $theme.colors.contentPrimary || "#26251e",
  fontFamily: $theme.typography.font100?.fontFamily || "Inter, sans-serif",
  userSelect: "none",
  cursor: "default",
  display: "inline-block",
  marginBottom: "6px",
  ":disabled": {
    cursor: "not-allowed",
    opacity: 0.7,
  }
}));

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <StyledLabel {...props} />;
}
Label.displayName = "Label";