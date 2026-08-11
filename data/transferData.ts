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

// Response shape from POST /transfers and GET /transfers — confirmed fields
// per the doc, plus the request fields echoed back (assumed, not
// individually confirmed field-by-field).
export interface TransferRecord extends TransferInsertPayload {
  referenceNumber: string;
  senderName: string;
  receiverName: string;
  // No documented enum — do not hardcode a status-color map until real
  // values are confirmed (expected something like INSERTED/PENDING/
  // CONFIRMED/PAID/CANCELLED, per Track B's vocabulary, but unverified).
  status: string;
  provider: string;
  providerReference: string;
  exchangeRate: number;
  fee: number;
  totalAmount: number;
  receiverAmount: number;
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
