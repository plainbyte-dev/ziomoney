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
      onClick={onSelect}
      className="flex items-center gap-2 text-sm text-heading/80"
    >
      <span
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
