"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";

// Plain strings keep the existing behavior (value === label). Pass
// {value, label} pairs when the displayed text needs to show more than the
// stored value — e.g. "India — INR" while still saving just "INR".
export type CurrencySelectOption = string | { value: string; label: string };

interface CurrencySelectProps {
  options: CurrencySelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
  // Compact, unlabeled variant for composing inline next to an amount input
  // (e.g. Voucher Entry's amount + currency pair) instead of the standard
  // full-width labeled field.
  bare?: boolean;
  placeholder?: string;
}

export default function CurrencySelect({
  options,
  value,
  onChange,
  label = "Currency",
  required,
  disabled,
  emptyMessage = "No currencies available.",
  bare = false,
  placeholder = "CCY",
}: CurrencySelectProps) {
  const selectId = useId();
  const normalized = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  );

  if (bare) {
    return (
      <select
        aria-label={label}
        value={value || normalized[0]?.value || ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || normalized.length === 0}
        className="w-24 rounded-lg border border-border bg-panel px-2 py-2.5 text-center text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green disabled:bg-surface disabled:text-muted"
      >
        {normalized.length === 0 && <option value="">{placeholder}</option>}
        {normalized.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (normalized.length === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-heading/70">{label}</label>
        <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-muted">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="flex items-center gap-1 text-sm text-heading/70">
        {label}
        {required && (
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required={required}
          aria-required={required || undefined}
          className="w-full appearance-none rounded-xl border border-border bg-panel px-3 py-2.5 pr-9 text-sm text-heading transition-colors focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green disabled:bg-surface disabled:text-muted"
        >
          {normalized.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  );
}
