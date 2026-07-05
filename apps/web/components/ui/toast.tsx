"use client";

import React, { createContext, useContext, useCallback, ReactNode } from "react";
import { ToasterContainer, toaster, PLACEMENT } from "baseui/toast";

export type ToastType = "default" | "success" | "error";

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useCallback((message: string, type: ToastType = "default") => {
    const overrides = {
      Body: {
        style: ({ $theme }: any) => ({
          backgroundColor: "#ffffff", // Surface card
          color: "#26251e", // Ink
          border: `1px solid ${$theme.colors.borderOpaque || "#e6e5e0"}`, // Hairline
          borderRadius: "8px", // {rounded.md}
          fontFamily: "Inter, system-ui, sans-serif",
          boxShadow: "none",
          fontSize: "14px",
          fontWeight: "500",
          ...(type === "success" && {
            borderColor: "rgba(31, 138, 101, 0.3)",
            backgroundColor: "#fafaf7", // Canvas soft
          }),
          ...(type === "error" && {
            borderColor: "rgba(207, 45, 86, 0.3)",
            backgroundColor: "#fafaf7", // Canvas soft
          }),
        })
      },
      InnerContainer: {
        style: {
          backgroundColor: "transparent",
        }
      }
    };

    if (type === "success") {
      toaster.positive(message, { overrides });
    } else if (type === "error") {
      toaster.negative(message, { overrides });
    } else {
      toaster.info(message, { overrides });
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToasterContainer placement={PLACEMENT.bottomRight} autoHideDuration={4000} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
