export type TxnStatus = "INSERTED" | "CONFIRMED" | "CANCELLED" | "PAID";

// Response data shared by /viewTransaction, /getTransactionByStaff,
// /getRemittanceByrefno and /getRemittanceByUsernamefrompartners
export interface RemittanceTransactionRecord {
  id: number;
  referenceNo: string;
  txnId: string;
  userName: string;
  sendingAgent: string;
  status: TxnStatus;
  senderName: string;
  senderCountry: string;
  senderMobile: string;
  receiverName: string;
  receiverCountry: string;
  receiverPhone: string;
  receiverId: string;
  payoutAmount: number;
  sendCurrency: string;
  payoutCurrency: string;
  rate: number;
  paymentType: string;
  payoutPartner: string;
  destCountry: string;
  purposeOfTxn: string;
  confirmId: string;
  confirmUserName: string;
  cancelUserName: string;
  remoteTxnStatus: string;
  remoteControlNum: string;
  txnDate: string;
  confirmTxnDate: string;
  cancelTxnDate: string;
  paidTxnDate: string;
  // Client-side only — never sent to or received from the API. Which
  // unconfirmed queue this belongs to (admin-inserted vs. partner-API);
  // undefined once a record moves past CONFIRMED, since both queues feed
  // the same Pending/Unpaid view from there.
  source?: "admin" | "partner-api";
  // True when this record's status was advanced client-side (Approve / Mark
  // Paid) rather than confirmed by a real endpoint — none is documented for
  // either action. Shown as a visible badge so it's never mistaken for
  // server-confirmed state; a live refresh from the real endpoint can
  // still overwrite it.
  locallyAdvanced?: boolean;
  // True when this record was synthesized from a Track A (POST /transfers)
  // response to make a sent transaction visible in the Track B queues —
  // it does not actually exist under these Track B endpoints server-side.
  // See TransactionLifecycleContext.
  locallyInserted?: boolean;
}

// POST /viewTransaction
export interface ViewTransactionPayload {
  confirmId: string;
}

// POST /getTransactionByStaff
export interface StaffTransactionPayload {
  userName: string;
}

// POST /getRemittanceByrefno
export interface TransactionByRefPayload {
  username: string;
  refNo: string;
  fromDate: string;
  toDate: string;
}

// POST /getRemittanceByUsernamefrompartners
export interface PartnerLatestTransactionPayload {
  username: string;
  fromDate: string;
  toDate: string;
}

export const transactionRecords: RemittanceTransactionRecord[] = [
  {
    id: 1,
    referenceNo: "REF-2026-4471",
    txnId: "TXN-4471",
    userName: "aisa.co",
    sendingAgent: "TRANS CASH INTERNATIONAL",
    status: "PAID",
    senderName: "Aisa Tanaka",
    senderCountry: "Japan",
    senderMobile: "090-1234-5678",
    receiverName: "R. Gurung",
    receiverCountry: "Nepal",
    receiverPhone: "980-1122334",
    receiverId: "NP-ID-88213",
    payoutAmount: 45000,
    sendCurrency: "JPY",
    payoutCurrency: "NPR",
    rate: 1.9,
    paymentType: "Cash Pickup",
    payoutPartner: "remitteragent",
    destCountry: "Nepal",
    purposeOfTxn: "Family Support",
    confirmId: "CNF-9001",
    confirmUserName: "aisa.co",
    cancelUserName: "",
    remoteTxnStatus: "COMPLETED",
    remoteControlNum: "RC-778812",
    txnDate: "2026-08-01T09:12:00Z",
    confirmTxnDate: "2026-08-01T09:15:00Z",
    cancelTxnDate: "",
    paidTxnDate: "2026-08-01T14:40:00Z",
  },
  {
    id: 2,
    referenceNo: "REF-2026-4488",
    txnId: "TXN-4488",
    userName: "rgurung",
    sendingAgent: "AISA CO. LTD",
    status: "CONFIRMED",
    senderName: "S. Patel",
    senderCountry: "Japan",
    senderMobile: "070-9988-1122",
    receiverName: "M. Sharma",
    receiverCountry: "India",
    receiverPhone: "98123-45678",
    receiverId: "IN-ID-33210",
    payoutAmount: 18500,
    sendCurrency: "JPY",
    payoutCurrency: "INR",
    rate: 1.78,
    paymentType: "Bank Deposit",
    payoutPartner: "TRANS CASH INTERNATIONAL",
    destCountry: "India",
    purposeOfTxn: "Education",
    confirmId: "CNF-9002",
    confirmUserName: "rgurung",
    cancelUserName: "",
    remoteTxnStatus: "PENDING",
    remoteControlNum: "",
    txnDate: "2026-08-03T11:05:00Z",
    confirmTxnDate: "2026-08-03T11:20:00Z",
    cancelTxnDate: "",
    paidTxnDate: "",
  },
  {
    id: 3,
    referenceNo: "REF-2026-4502",
    txnId: "TXN-4502",
    userName: "s.patel",
    sendingAgent: "KOPERASI SINEMI BERDIKARI UTAMA",
    status: "CANCELLED",
    senderName: "L. Brown",
    senderCountry: "Japan",
    senderMobile: "090-5566-7788",
    receiverName: "D. Wijaya",
    receiverCountry: "Indonesia",
    receiverPhone: "0812-3344-5566",
    receiverId: "ID-ID-77123",
    payoutAmount: 9200,
    sendCurrency: "JPY",
    payoutCurrency: "IDR",
    rate: 9.6,
    paymentType: "Mobile Wallet",
    payoutPartner: "KOPERASI SINEMI BERDIKARI UTAMA",
    destCountry: "Indonesia",
    purposeOfTxn: "Personal",
    confirmId: "CNF-9003",
    confirmUserName: "",
    cancelUserName: "s.patel",
    remoteTxnStatus: "CANCELLED",
    remoteControlNum: "",
    txnDate: "2026-08-02T08:40:00Z",
    confirmTxnDate: "",
    cancelTxnDate: "2026-08-02T09:00:00Z",
    paidTxnDate: "",
  },
  {
    id: 4,
    referenceNo: "REF-2026-4519",
    txnId: "TXN-4519",
    userName: "aisa.co",
    sendingAgent: "TRANS CASH INTERNATIONAL",
    status: "INSERTED",
    senderName: "Aisa Tanaka",
    senderCountry: "Japan",
    senderMobile: "090-1234-5678",
    receiverName: "K. Adhikari",
    receiverCountry: "Nepal",
    receiverPhone: "981-5566778",
    receiverId: "NP-ID-90112",
    payoutAmount: 30000,
    sendCurrency: "JPY",
    payoutCurrency: "NPR",
    rate: 1.9,
    paymentType: "Cash Pickup",
    payoutPartner: "remitteragent",
    destCountry: "Nepal",
    purposeOfTxn: "Family Support",
    confirmId: "CNF-9004",
    confirmUserName: "",
    cancelUserName: "",
    remoteTxnStatus: "",
    remoteControlNum: "",
    txnDate: "2026-08-04T07:30:00Z",
    confirmTxnDate: "",
    cancelTxnDate: "",
    paidTxnDate: "",
  },
];

// Static demo data for GET /getAllCompileHoldRemittance — no real backend.
// Same record shape as the other transaction endpoints; the API gives no
// separate "hold reason" field, so the detail view can only show what's
// actually on the record (status/remoteTxnStatus), not a fabricated cause.
export const complianceHoldRemittanceRecords: RemittanceTransactionRecord[] = [
  {
    id: 101,
    referenceNo: "REF-2026-4610",
    txnId: "TXN-4610",
    userName: "s.patel",
    sendingAgent: "KOPERASI SINEMI BERDIKARI UTAMA",
    status: "CONFIRMED",
    senderName: "L. Brown",
    senderCountry: "Japan",
    senderMobile: "090-5566-7788",
    receiverName: "B. Santoso",
    receiverCountry: "Indonesia",
    receiverPhone: "0812-9988-1122",
    receiverId: "ID-ID-90441",
    payoutAmount: 1250000,
    sendCurrency: "JPY",
    payoutCurrency: "IDR",
    rate: 9.6,
    paymentType: "Bank Deposit",
    payoutPartner: "KOPERASI SINEMI BERDIKARI UTAMA",
    destCountry: "Indonesia",
    purposeOfTxn: "Business",
    confirmId: "CNF-9101",
    confirmUserName: "s.patel",
    cancelUserName: "",
    remoteTxnStatus: "COMPLIANCE_HOLD",
    remoteControlNum: "",
    txnDate: "2026-08-05T10:05:00Z",
    confirmTxnDate: "2026-08-05T10:12:00Z",
    cancelTxnDate: "",
    paidTxnDate: "",
  },
  {
    id: 102,
    referenceNo: "REF-2026-4622",
    txnId: "TXN-4622",
    userName: "aisa.co",
    sendingAgent: "TRANS CASH INTERNATIONAL",
    status: "CONFIRMED",
    senderName: "Aisa Tanaka",
    senderCountry: "Japan",
    senderMobile: "090-1234-5678",
    receiverName: "K. Adhikari",
    receiverCountry: "Nepal",
    receiverPhone: "981-5566778",
    receiverId: "NP-ID-90112",
    payoutAmount: 620000,
    sendCurrency: "JPY",
    payoutCurrency: "NPR",
    rate: 1.9,
    paymentType: "Cash Pickup",
    payoutPartner: "remitteragent",
    destCountry: "Nepal",
    purposeOfTxn: "Family Support",
    confirmId: "CNF-9102",
    confirmUserName: "aisa.co",
    cancelUserName: "",
    remoteTxnStatus: "COMPLIANCE_HOLD",
    remoteControlNum: "",
    txnDate: "2026-08-06T08:20:00Z",
    confirmTxnDate: "2026-08-06T08:25:00Z",
    cancelTxnDate: "",
    paidTxnDate: "",
  },
];

// Static demo data for GET /getAllUnapprovedRemittances (admin-inserted queue).
export const unapprovedRemittanceRecords: RemittanceTransactionRecord[] = [
  {
    id: 201,
    source: "admin",
    referenceNo: "REF-2026-4701",
    txnId: "TXN-4701",
    userName: "aisa.co",
    sendingAgent: "TRANS CASH INTERNATIONAL",
    status: "INSERTED",
    senderName: "Aisa Tanaka",
    senderCountry: "Japan",
    senderMobile: "090-1234-5678",
    receiverName: "R. Gurung",
    receiverCountry: "Nepal",
    receiverPhone: "980-1122334",
    receiverId: "NP-ID-88213",
    payoutAmount: 52000,
    sendCurrency: "JPY",
    payoutCurrency: "NPR",
    rate: 1.9,
    paymentType: "Cash Pickup",
    payoutPartner: "remitteragent",
    destCountry: "Nepal",
    purposeOfTxn: "Family Support",
    confirmId: "CNF-9201",
    confirmUserName: "",
    cancelUserName: "",
    remoteTxnStatus: "",
    remoteControlNum: "",
    txnDate: "2026-08-07T09:10:00Z",
    confirmTxnDate: "",
    cancelTxnDate: "",
    paidTxnDate: "",
  },
];

// Static demo data for GET /getAllUnapprovedRemittances2 (partner-API-inserted queue).
export const unapprovedRemittancePartnerApiRecords: RemittanceTransactionRecord[] = [
  {
    id: 301,
    source: "partner-api",
    referenceNo: "REF-2026-4715",
    txnId: "TXN-4715",
    userName: "rgurung",
    sendingAgent: "AISA CO. LTD",
    status: "INSERTED",
    senderName: "S. Patel",
    senderCountry: "Japan",
    senderMobile: "070-9988-1122",
    receiverName: "M. Sharma",
    receiverCountry: "India",
    receiverPhone: "98123-45678",
    receiverId: "IN-ID-33210",
    payoutAmount: 21500,
    sendCurrency: "JPY",
    payoutCurrency: "INR",
    rate: 1.78,
    paymentType: "Bank Deposit",
    payoutPartner: "TRANS CASH INTERNATIONAL",
    destCountry: "India",
    purposeOfTxn: "Education",
    confirmId: "CNF-9301",
    confirmUserName: "",
    cancelUserName: "",
    remoteTxnStatus: "",
    remoteControlNum: "",
    txnDate: "2026-08-07T13:45:00Z",
    confirmTxnDate: "",
    cancelTxnDate: "",
    paidTxnDate: "",
  },
];

// Static demo data for GET /getAllConformedRemittances (confirmed, ready for
// payout). remoteTxnStatus values are unconfirmed with backend — see
// UnpaidTransactionsPanel for how this field is (not yet) filtered on.
export const confirmedRemittanceRecords: RemittanceTransactionRecord[] = [
  {
    id: 401,
    referenceNo: "REF-2026-4488",
    txnId: "TXN-4488",
    userName: "rgurung",
    sendingAgent: "AISA CO. LTD",
    status: "CONFIRMED",
    senderName: "S. Patel",
    senderCountry: "Japan",
    senderMobile: "070-9988-1122",
    receiverName: "M. Sharma",
    receiverCountry: "India",
    receiverPhone: "98123-45678",
    receiverId: "IN-ID-33210",
    payoutAmount: 18500,
    sendCurrency: "JPY",
    payoutCurrency: "INR",
    rate: 1.78,
    paymentType: "Bank Deposit",
    payoutPartner: "TRANS CASH INTERNATIONAL",
    destCountry: "India",
    purposeOfTxn: "Education",
    confirmId: "CNF-9002",
    confirmUserName: "rgurung",
    cancelUserName: "",
    remoteTxnStatus: "PENDING",
    remoteControlNum: "",
    txnDate: "2026-08-03T11:05:00Z",
    confirmTxnDate: "2026-08-03T11:20:00Z",
    cancelTxnDate: "",
    paidTxnDate: "",
  },
  {
    id: 402,
    referenceNo: "REF-2026-4471",
    txnId: "TXN-4471",
    userName: "aisa.co",
    sendingAgent: "TRANS CASH INTERNATIONAL",
    status: "CONFIRMED",
    senderName: "Aisa Tanaka",
    senderCountry: "Japan",
    senderMobile: "090-1234-5678",
    receiverName: "R. Gurung",
    receiverCountry: "Nepal",
    receiverPhone: "980-1122334",
    receiverId: "NP-ID-88213",
    payoutAmount: 45000,
    sendCurrency: "JPY",
    payoutCurrency: "NPR",
    rate: 1.9,
    paymentType: "Cash Pickup",
    payoutPartner: "remitteragent",
    destCountry: "Nepal",
    purposeOfTxn: "Family Support",
    confirmId: "CNF-9001",
    confirmUserName: "aisa.co",
    cancelUserName: "",
    remoteTxnStatus: "COMPLETED",
    remoteControlNum: "RC-778812",
    txnDate: "2026-08-01T09:12:00Z",
    confirmTxnDate: "2026-08-01T09:15:00Z",
    cancelTxnDate: "",
    paidTxnDate: "2026-08-01T14:40:00Z",
  },
];
