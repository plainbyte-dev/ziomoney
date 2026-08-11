// Response data shared by /api/remittance/beneficiaries endpoints
export interface Beneficiary {
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

// POST /api/remittance/beneficiaries — `username` in the response is the
// owning account (the "my" in "List my beneficiaries"), derived server-side
// from the caller's auth token — the client never sends it.
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
  },
];
