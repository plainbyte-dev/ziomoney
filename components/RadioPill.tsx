"use client";

export default function RadioPill({
  label,
  checked,
  onSelect,
  disabled,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={disabled ? undefined : onSelect}
      className={`flex items-center gap-2 rounded text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 ${
        disabled ? "cursor-not-allowed text-muted" : "text-heading/80"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
          checked ? "border-brand-green" : "border-border"
        } ${disabled ? "opacity-50" : ""}`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-brand-green" />}
      </span>
      {label}
    </button>
  );
}
