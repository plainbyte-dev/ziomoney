"use client";

import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  className?: string;
}

export default function Checkbox({ checked, onToggle, label, className }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 text-sm text-heading/80 ${className ?? ""}`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
          checked ? "bg-brand-green" : "border border-border bg-white"
        }`}
      >
        {checked && <Check size={12} className="text-white" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}
