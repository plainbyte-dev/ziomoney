"use client";

interface TextFieldProps {
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}

export default function TextField({
  label,
  defaultValue,
  placeholder,
  required,
}: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 text-sm text-heading/70">
        {label}
        {required && <span className="text-red-500">•</span>}
      </label>
      <input
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-heading placeholder:text-muted focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
      />
    </div>
  );
}
