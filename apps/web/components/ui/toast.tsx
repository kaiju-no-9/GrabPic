"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type ToastType = "default" | "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  leaving?: boolean;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "default") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            onClick={() => dismiss(t.id)}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-md border bg-surface-card px-4 py-3 text-sm font-medium text-ink cursor-pointer",
              t.leaving ? "animate-[slideOutRight_0.25s_ease-in_forwards]" : "animate-[slideInRight_0.25s_ease-out]",
              t.type === "success" && "border-success/30 bg-canvas-soft",
              t.type === "error" && "border-error/30 bg-canvas-soft",
              t.type === "default" && "border-hairline",
            )}
          >
            {t.type === "success" && (
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-success" />
            )}
            {t.type === "error" && (
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-error" />
            )}
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
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
