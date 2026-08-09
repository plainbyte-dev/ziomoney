"use client";

import { useRef } from "react";
import { Calendar } from "lucide-react";

interface DateInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export default function DateInput({
  value,
  defaultValue,
  onChange,
  className,
  id,
  "aria-label": ariaLabel,
}: DateInputProps) {
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
    <div className="relative">
      <input
        id={id}
        ref={inputRef}
        type="date"
        value={value}
        defaultValue={defaultValue}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        aria-label={ariaLabel}
        className={`w-full appearance-none rounded-xl border border-border bg-panel px-3 py-2.5 pr-9 text-sm text-heading transition-colors focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green [&::-webkit-calendar-picker-indicator]:opacity-0 ${
          className ?? ""
        }`}
      />
      <button
        type="button"
        onClick={openPicker}
        aria-label="Open calendar"
        tabIndex={-1}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-brand-green"
      >
        <Calendar size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
