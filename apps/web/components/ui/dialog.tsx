"use client";

import { type ReactNode } from "react";
import { Modal, ROLE } from "baseui/modal";
import { styled } from "styletron-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string; // Kept for compatibility
}

export function Dialog({ open, onClose, children }: DialogProps) {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      closeable
      role={ROLE.dialog}
      animate
      overrides={{
        Root: {
          style: {
            zIndex: 1000,
          }
        },
        Dialog: {
          style: ({ $theme }: any) => ({
            backgroundColor: "#ffffff", // Surface card
            border: `1px solid ${$theme.colors.borderOpaque || "#e6e5e0"}`, // Hairline border
            borderRadius: "12px", // {rounded.lg} is 12px
            padding: "24px",
            maxWidth: "448px",
            width: "100%",
            boxShadow: "none", // Hairline-only depth, no drop shadows
          })
        },
        DialogContainer: {
          style: {
            backgroundColor: "rgba(38, 37, 30, 0.15)", // bg-[--color-ink]/15
            backdropFilter: "blur(4px)",
          }
        },
        Close: {
          style: {
            top: "16px",
            right: "16px",
            color: "#807d72",
            ":hover": {
              color: "#26251e",
              backgroundColor: "transparent",
            }
          }
        }
      }}
    >
      {children}
    </Modal>
  );
}

const StyledDialogHeader = styled("div", {
  marginBottom: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
});

export function DialogHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <StyledDialogHeader className={className}>{children}</StyledDialogHeader>;
}

const StyledTitle = styled("h2", ({ $theme }: any) => ({
  fontSize: "22px", // {typography.display-sm} is 22px
  fontWeight: "400", // Display weight stays at 400. Magazine voice.
  lineHeight: "1.3",
  letterSpacing: "-0.11px",
  margin: 0,
  color: $theme.colors.contentPrimary || "#26251e",
}));

export function DialogTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <StyledTitle className={className}>{children}</StyledTitle>;
}

const StyledDescription = styled("p", ({ $theme }: any) => ({
  fontSize: "14px",
  lineHeight: "1.5",
  margin: 0,
  color: $theme.colors.contentTertiary || "#807d72",
}));

export function DialogDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <StyledDescription className={className}>{children}</StyledDescription>;
}

const StyledFooter = styled("div", {
  marginTop: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "12px",
});

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <StyledFooter className={className}>{children}</StyledFooter>;
}