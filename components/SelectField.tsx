"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";

interface SelectFieldProps {
  label: string;
  options: string[];
  defaultValue: string;
  required?: boolean;
  // Optional controlled mode — omit onChange to keep the field uncontrolled/decorative.
  value?: string;
  onChange?: (value: string) => void;
}

export default function SelectField({
  label,
  options,
  defaultValue,
  required,
  value,
  onChange,
}: SelectFieldProps) {
  const isControlled = value !== undefined;
  const selectId = useId();

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
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          required={required}
          aria-required={required || undefined}
          className="w-full appearance-none rounded-xl border border-border bg-panel px-3 py-2.5 pr-9 text-sm text-heading transition-colors focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
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
