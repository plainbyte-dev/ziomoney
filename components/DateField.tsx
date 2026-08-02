"use client";

import { useRef } from "react";
import { Calendar } from "lucide-react";

interface DateFieldProps {
  label: string;
  defaultValue: string;
}

export default function DateField({ label, defaultValue }: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
      <label className="text-sm text-heading/70">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="date"
          defaultValue={defaultValue}
          className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2.5 pr-9 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green [&::-webkit-calendar-picker-indicator]:opacity-0"
        />
        <button
          type="button"
          onClick={openPicker}
          aria-label="Open calendar"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brand-green"
        >
          <Calendar size={16} />
        </button>
      </div>
    </div>
  );
}
