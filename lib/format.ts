export function formatAmount(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Accounting-style formatting: negatives render in parentheses,
 * e.g. -4000 -> "(4,000.00)" instead of "-4,000.00".
 */
export function formatAccounting(value: number): string {
  const formatted = formatAmount(Math.abs(value));
  return value < 0 ? `(${formatted})` : formatted;
}

export function formatDate(value: string | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}