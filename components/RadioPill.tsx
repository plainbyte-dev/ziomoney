"use client";

export default function RadioPill({
  label,
  checked,
  onSelect,
}: {
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className="flex items-center gap-2 rounded text-sm text-heading/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
    >
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
          checked ? "border-brand-green" : "border-border"
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-brand-green" />}
      </span>
      {label}
    </button>
  );
}
