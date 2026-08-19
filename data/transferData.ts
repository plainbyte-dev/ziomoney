import { settlementCurrencyOptions, partnerCountrySelectOptions } from "./partnerData";

// Track A — POST /transfers, GET /transfers. A separate transaction model
// from the Track B endpoints in data/transactionData.ts (viewTransaction,
// getAllUnapprovedRemittances, etc.) — confirmed as two distinct shapes in
// the API doc, not two surfaces of the same table. Whether they're genuinely
// separate flows or unmerged generations of the same feature is an open
// question for backend; until confirmed, this file only models Track A.

// UNCONFIRMED with backend — no enum documented for purpose. Educated guess
// only; do not treat as final.
export const transferPurposeOptions = ["Family Support", "Education", "Medical", "Business", "Other"];

// Shared payout-method vocabulary — used both when sending a transaction
// (TransactionSendPanel's per-beneficiary Method field) and when binding a
// Margin Setup row to a delivery method (MarginSetupPanel's Service field,
// matched directly against this in lib/transferMath.ts's resolveMargin).
// Kept as one exported source so the two vocabularies can't drift apart.
export const payoutMethodOptions = ["Bank", "Wallet", "Cash"];

// Fields accepted by POST /transfers. Server-computed fields (senderName,
// receiverName, exchangeRate, fee, totalAmount, receiverAmount) are
// deliberately NOT part of this type — they only ever appear in the
// response, never sent by the client.
export interface TransferInsertPayload {
  beneficiaryId: number;
  amount: number;
  sourceCurrency: string;
  destinationCurrency: string;
  destinationCountry: string;
  purpose: string;
  remarks: string;
}

// Response shape from POST /transfers, GET /transfers, GET /transfers/{id},
// GET /transfers/ref/{referenceNumber} and PUT /transfers/{id}/cancel —
// confirmed fields per the doc, plus the request fields echoed back (assumed,
// not individually confirmed field-by-field). `username` is present in the
// doc's schema but omitted here — nothing in the UI needs it over
// senderName, and it's not sent back for display anywhere else in this app.
// MOCK-ONLY / DEMO-ONLY — not part of the real /transfers response schema.
// A snapshot of the rate/fee/commission/margin breakdown captured at
// creation time by lib/transferMath.ts's calculateTransfer, so the
// Transaction Rate Report and Transfers detail view show what actually
// applied when the transaction was created rather than recomputing against
// possibly-since-changed commission/rate/margin config. Delete this type
// and every read site once/if a real backend field carries this instead.
export interface TransferRateBreakdown {
  agentName: string;
  retailRate: number | null;
  wholesaleRate: number | null;
  fxSpread: number | null;
  commissionRate: number;
  commission: number;
  marginRate: number | null;
  netEarning: number | null;
  computedAt: string;
}

export interface TransferRecord extends TransferInsertPayload {
  id: number;
  referenceNumber: string;
  senderName: string;
  receiverName: string;
  // No documented enum — do not hardcode a status-color map until real
  // values are confirmed (expected something like PENDING/CONFIRMED/
  // PAID/CANCELLED, per Track B's vocabulary, but unverified).
  status: string;
  provider: string;
  providerReference: string;
  exchangeRate: number;
  fee: number;
  totalAmount: number;
  receiverAmount: number;
  createdAt?: string;
  updatedAt?: string;
  // See TransferRateBreakdown above — absent on transfers created before
  // this feature existed (the 3 seeded demo rows below), which fall back
  // to a live recompute via lib/transferMath.ts's getOrComputeBreakdown.
  rateBreakdownMOCKONLY?: TransferRateBreakdown;
}

// Spring Page<T> shape — GET /transfers?page={page}&size={size}&sort={field},{direction}
export interface PagedTransfers<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// beneficiaryId is deliberately left 0 — it's backfilled once the
// beneficiary list loads (see TransactionSendPanel's effect), since that
// dropdown's options aren't known synchronously at form-init time the way
// currency/country are.
export function emptyTransferInsertPayload(): TransferInsertPayload {
  return {
    beneficiaryId: 0,
    amount: 0,
    sourceCurrency: settlementCurrencyOptions[0],
    destinationCurrency: settlementCurrencyOptions[0],
    destinationCountry: partnerCountrySelectOptions[0],
    purpose: transferPurposeOptions[0],
    remarks: "",
  };
}

// Demo-mode seed for the transfers list/detail/cancel screen. Shaped after
// the confirmed GET /transfers response fields — id only matters as a local
// React key here since demo mode never calls the by-id/cancel routes.
export const demoTransferRecords: TransferRecord[] = [
  {
    id: 501,
    referenceNumber: "TRF-2026-000501",
    beneficiaryId: 12,
    senderName: "Aisa Tanaka",
    receiverName: "R. Gurung",
    amount: 50000,
    sourceCurrency: "JPY",
    destinationCurrency: "NPR",
    destinationCountry: "NEPAL",
    exchangeRate: 1.98,
    fee: 500,
    totalAmount: 50500,
    receiverAmount: 99000,
    purpose: "Family Support",
    status: "PENDING",
    provider: "Himalayan Bank",
    providerReference: "",
    remarks: "",
  },
  {
    id: 502,
    referenceNumber: "TRF-2026-000498",
    beneficiaryId: 7,
    senderName: "L. Brown",
    receiverName: "S. Patel",
    amount: 120000,
    sourceCurrency: "JPY",
    destinationCurrency: "INR",
    destinationCountry: "INDIA",
    exchangeRate: 0.56,
    fee: 900,
    totalAmount: 120900,
    receiverAmount: 67200,
    purpose: "Education",
    status: "CONFIRMED",
    provider: "ICICI Bank",
    providerReference: "ICI-88231",
    remarks: "Semester fee remittance.",
  },
  {
    id: 503,
    referenceNumber: "TRF-2026-000481",
    beneficiaryId: 3,
    senderName: "M. Santos",
    receiverName: "J. Cruz",
    amount: 30000,
    sourceCurrency: "JPY",
    destinationCurrency: "PHP",
    destinationCountry: "PHILIPPINES",
    exchangeRate: 3.1,
    fee: 400,
    totalAmount: 30400,
    receiverAmount: 93000,
    purpose: "Family Support",
    status: "CANCELLED",
    provider: "BDO Unibank",
    providerReference: "",
    remarks: "Cancelled by sender before payout.",
  },
];
