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
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={`flex items-center gap-2 rounded text-sm text-heading/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 ${
        className ?? ""
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
          checked ? "bg-brand-green" : "border border-border bg-panel"
        }`}
      >
        {checked && <Check size={12} className="text-white" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}
