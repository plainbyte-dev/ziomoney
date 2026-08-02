import { ledgerEntries } from "./ledgerData";

export const voucherLedgerOptions = ledgerEntries.map((entry) => entry.ledgerName);

export const drCrOptions = ["DR", "CR"] as const;
export type DrCr = (typeof drCrOptions)[number];

export const voucherCalcModeOptions = ["Calc by USD", "Calc by (Ledger CCy)"] as const;
export type VoucherCalcMode = (typeof voucherCalcModeOptions)[number];

export const applyLedgerOptions = ["All CCY", "USD", "JPY", "AUD", "INR", "GBP", "NPR"];

export type VoucherLine = {
  id: string;
  ledger: string;
  drCr: DrCr;
  amount: number;
  currency: string;
};

export type VoucherStatus = "Not Approved" | "Approved";

export type VoucherLogEntry = {
  id: string;
  voucherNo: string;
  partner: string;
  dot: string; // date of transaction
  usd: number;
  settleRate: number;
  amount: number;
  remarks: string;
  posted: boolean;
  status: VoucherStatus;
};

export const voucherCompany = {
  name: "FOREX JAPAN CO. LTD",
  registration: "Kanto Local Finance Bureau 00029",
  postalCode: "〒 144-0051",
  address: "Tokyo-To Ota-Ku Nishikamata 7-29-7 New Kamata Bldg 703",
  tel: "Tel:03-6868-0808",
};

export function nextVoucherNo(existing: VoucherLogEntry[]): string {
  return `V-${String(existing.length + 1).padStart(5, "0")}`;
}
