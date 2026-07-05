"use client";

import type { HTMLAttributes } from "react";
import { styled } from "styletron-react";

const StyledCard = styled("div", ({ $theme }: any) => ({
  borderRadius: $theme.borders.cardBorderRadius || "12px",
  border: `1px solid ${$theme.colors.borderOpaque || "#e6e5e0"}`,
  backgroundColor: $theme.colors.backgroundTertiary || "#ffffff",
  color: $theme.colors.contentPrimary || "#26251e",
  fontFamily: $theme.typography.font100?.fontFamily || "Inter, sans-serif",
}));

const StyledCardHeader = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  padding: "24px",
});

const StyledCardTitle = styled("h3", ({ $theme }: any) => ({
  fontSize: "18px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: 0,
  color: $theme.colors.contentPrimary || "#26251e",
}));

const StyledCardDescription = styled("p", ({ $theme }: any) => ({
  fontSize: "14px",
  lineHeight: "1.5",
  margin: 0,
  color: $theme.colors.contentSecondary || "#5a5852",
}));

const StyledCardContent = styled("div", {
  padding: "24px",
  paddingTop: 0,
});

const StyledCardFooter = styled("div", {
  display: "flex",
  alignItems: "center",
  padding: "24px",
  paddingTop: 0,
});

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <StyledCard {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <StyledCardHeader {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <StyledCardTitle {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <StyledCardDescription {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <StyledCardContent {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <StyledCardFooter {...props} />;
}
