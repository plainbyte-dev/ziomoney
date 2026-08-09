"use client";

import { useId } from "react";

interface TextFieldProps {
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  // Optional controlled mode — omit both to keep the field uncontrolled/decorative.
  value?: string;
  onChange?: (value: string) => void;
}

export default function TextField({
  label,
  defaultValue,
  placeholder,
  required,
  error,
  value,
  onChange,
}: TextFieldProps) {
  const isControlled = value !== undefined;
  const inputId = useId();
  const errorId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="flex items-center gap-1 text-sm text-heading/70">
        {label}
        {required && (
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={inputId}
        type="text"
        value={isControlled ? value : undefined}
        defaultValue={isControlled ? undefined : defaultValue}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={placeholder}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border bg-panel px-3 py-2.5 text-sm text-heading placeholder:text-muted transition-colors focus:outline-none focus:ring-1 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-400"
            : "border-border focus:border-brand-green focus:ring-brand-green"
        }`}
      />
      {error && (
        <p id={errorId} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
