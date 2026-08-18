import type { KycStatus } from "./kycData";
import { beneficiaryCountryOptions } from "./staticData";

// Real response shape from /api/remittance/beneficiaries endpoints — exactly
// what the backend sends, nothing more. Use this type (not `Beneficiary`) for
// anything that talks to the API directly (lib/beneficiaryApi.ts).
export interface BeneficiaryApiRecord {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  country: string;
  relationship: string;
  createdAt: string;
  updatedAt: string;
}

// UI-facing shape — the real API fields above, plus two fields the backend
// has no concept of at all (no request/response field for either; ownership
// is derived server-side from the caller's auth token, not a selectable
// sender). Tracked and persisted client-side only, in
// contexts/BeneficiariesContext.tsx, and merged onto BeneficiaryApiRecord
// after every fetch — never sent to or trusted from the backend.
export interface Beneficiary extends BeneficiaryApiRecord {
  senderUserName: string;
  beneficiaryKycStatus: KycStatus;
}

// POST /api/remittance/beneficiaries — `username` in the response is the
// owning account (the "my" in "List my beneficiaries"), derived server-side
// from the caller's auth token — the client never sends it.
// Field names/shape confirmed against the real CreateBeneficiaryRequest
// schema — fullName/accountNumber/email/bankBranch are all genuine backend
// fields, not guesses. There is no payoutMethod/walletId field in this
// request; payout-channel config lives at the partner level
// (requestPayoutBankUpdate / data/payoutBankData.ts), not per-beneficiary.
export interface AddBeneficiaryPayload {
  fullName: string;
  accountNumber: string;
  bankName: string;
  country: string;
  phone: string;
  email: string;
  bankBranch: string;
  relationship: string;
}

export const relationshipOptions = ["Family", "Friend", "Business Partner", "Self", "Other"];

export function emptyBeneficiaryPayload(): AddBeneficiaryPayload {
  return {
    fullName: "",
    accountNumber: "",
    bankName: "",
    country: beneficiaryCountryOptions[0],
    phone: "",
    email: "",
    bankBranch: "",
    relationship: relationshipOptions[0],
  };
}

export const beneficiaryRecords: Beneficiary[] = [
  {
    id: 1,
    username: "aisa.co",
    fullName: "R. Gurung",
    email: "r.gurung@example.com",
    phone: "980-1122334",
    bankName: "Nepal Investment Bank",
    bankBranch: "Kathmandu Main",
    accountNumber: "01234567890",
    country: "Nepal",
    relationship: "Family",
    createdAt: "2026-06-12T09:00:00Z",
    updatedAt: "2026-06-12T09:00:00Z",
    senderUserName: "aisa.co",
    beneficiaryKycStatus: "VERIFIED",
  },
  {
    id: 2,
    username: "rgurung",
    fullName: "M. Sharma",
    email: "m.sharma@example.com",
    phone: "98123-45678",
    bankName: "State Bank of India",
    bankBranch: "Mumbai Andheri",
    accountNumber: "9988776655",
    country: "India",
    relationship: "Friend",
    createdAt: "2026-07-02T11:30:00Z",
    updatedAt: "2026-07-02T11:30:00Z",
    senderUserName: "rgurung",
    beneficiaryKycStatus: "NOT_VERIFIED",
  },
  {
    id: 3,
    username: "s.patel",
    fullName: "D. Wijaya",
    email: "d.wijaya@example.com",
    phone: "0812-3344-5566",
    bankName: "Bank Mandiri",
    bankBranch: "Jakarta Selatan",
    accountNumber: "5544332211",
    country: "Indonesia",
    relationship: "Business Partner",
    createdAt: "2026-07-20T15:45:00Z",
    updatedAt: "2026-07-20T15:45:00Z",
    senderUserName: "s.patel",
    beneficiaryKycStatus: "NOT_VERIFIED",
  },
  {
    id: 4,
    username: "j.miller",
    fullName: "T. Nguyen",
    email: "t.nguyen@example.com",
    phone: "0412-555-778",
    bankName: "Commonwealth Bank",
    bankBranch: "Sydney CBD",
    accountNumber: "062-000-11223344",
    country: "Australia",
    relationship: "Family",
    createdAt: "2026-07-28T08:15:00Z",
    updatedAt: "2026-07-28T08:15:00Z",
    senderUserName: "j.miller",
    beneficiaryKycStatus: "VERIFIED",
  },
  {
    id: 5,
    username: "a.khan",
    fullName: "S. Al Mazrouei",
    email: "s.almazrouei@example.com",
    phone: "050-123-4567",
    bankName: "Emirates NBD",
    bankBranch: "Dubai Marina",
    accountNumber: "1015-8877665",
    country: "UAE",
    relationship: "Business Partner",
    createdAt: "2026-08-03T13:20:00Z",
    updatedAt: "2026-08-03T13:20:00Z",
    senderUserName: "a.khan",
    beneficiaryKycStatus: "NOT_VERIFIED",
  },
  {
    id: 6,
    username: "l.brown",
    fullName: "K. Thompson",
    email: "k.thompson@example.com",
    phone: "416-555-0192",
    bankName: "Royal Bank of Canada",
    bankBranch: "Toronto Downtown",
    accountNumber: "0021-99887766",
    country: "Canada",
    relationship: "Friend",
    createdAt: "2026-08-10T10:05:00Z",
    updatedAt: "2026-08-10T10:05:00Z",
    senderUserName: "l.brown",
    beneficiaryKycStatus: "VERIFIED",
  },
];
