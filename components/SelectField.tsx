"use client";

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

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 text-sm text-heading/70">
        {label}
        {required && <span className="text-red-500">•</span>}
      </label>
      <div className="relative">
        <select
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2.5 pr-9 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  );
}
