"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ToastVariant = "success" | "error";

export interface ToastEntry {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toasts: ToastEntry[];
  showToast: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3000;
let localIdCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = `T-${Date.now()}-${++localIdCounter}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toasts, showToast, dismiss }), [toasts, showToast, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
