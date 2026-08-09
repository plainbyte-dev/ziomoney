"use client";

import { CheckCircle2, XCircle, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function ToastHost() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-popover ${
            toast.variant === "success"
              ? "border-brand-green/30 bg-brand-green-light text-brand-green-dark"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {toast.variant === "success" ? (
            <CheckCircle2 size={16} className="shrink-0" />
          ) : (
            <XCircle size={16} className="shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="ml-1 shrink-0 rounded-full p-0.5 hover:bg-black/5"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
