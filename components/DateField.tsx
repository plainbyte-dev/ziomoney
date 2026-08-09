"use client";

import { useId, useRef } from "react";
import { Calendar } from "lucide-react";

interface DateFieldProps {
  label: string;
  defaultValue: string;
}

export default function DateField({ label, defaultValue }: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  function openPicker() {
    const input = inputRef.current;
    if (!input) return;
    const showPicker = (input as HTMLInputElement & { showPicker?: () => void }).showPicker;
    if (showPicker) {
      showPicker.call(input);
    } else {
      input.focus();
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm text-heading/70">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          ref={inputRef}
          type="date"
          defaultValue={defaultValue}
          className="w-full appearance-none rounded-xl border border-border bg-panel px-3 py-2.5 pr-9 text-sm text-heading transition-colors focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green [&::-webkit-calendar-picker-indicator]:opacity-0"
        />
        <button
          type="button"
          onClick={openPicker}
          aria-label="Open calendar"
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brand-green"
        >
          <Calendar size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
