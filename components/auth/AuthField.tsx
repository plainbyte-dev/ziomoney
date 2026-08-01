"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthFieldProps {
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  name?: string;
}

export default function AuthField({
  label,
  type = "text",
  placeholder,
  autoComplete,
  required,
  name,
}: AuthFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-heading/80">
        {label}
        {required && <span className="text-red-500">•</span>}
      </label>
      <div className="relative">
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-heading placeholder:text-muted focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading"
          >
            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}
