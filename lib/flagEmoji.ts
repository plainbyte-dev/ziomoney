// Converts an ISO-3166 alpha-2 code (as stored in CountryCurrencyRecord.isoAlpha2)
// into its flag emoji via the regional indicator symbol algorithm — no lookup
// table needed, so the flag always matches the ISO code on file rather than
// something typed in by hand.
export function flagEmojiFromIso2(iso2: string): string {
  const code = iso2.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  const points = [...code].map((char) => 0x1f1e6 + (char.charCodeAt(0) - 65));
  return String.fromCodePoint(...points);
}
