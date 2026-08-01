"use client";

import { ChevronDown } from "lucide-react";

interface SelectFieldProps {
  label: string;
  options: string[];
  defaultValue: string;
  required?: boolean;
}

export default function SelectField({
  label,
  options,
  defaultValue,
  required,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 text-sm text-heading/70">
        {label}
        {required && <span className="text-red-500">•</span>}
      </label>
      <div className="relative">
        <select
          defaultValue={defaultValue}
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
