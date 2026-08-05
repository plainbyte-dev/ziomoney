export interface DaysExceededTxnRow {
  sno: number;
  destCountry: string;
  district: string;
  receivingBranch: string;
  receiver: string;
  date: string;
  paymentType: string;
  payoutAmount: string;
  generatedBy: string;
}

// Empty by default to match the legacy "No Records Found" state until a real
// search is wired up.
export const daysExceededTxnRows: DaysExceededTxnRow[] = [];

export const receiverSearchByOptions = ["Receiver Name", "Receiver Country", "Transaction No."];

export interface AuditLogEntry {
  date: string;
  userId: string;
  functionName: string;
  dcInfo: string;
  ip: string;
  tranno: string;
  refno: string;
  userType: string;
}

export const auditLogEntries: AuditLogEntry[] = [
  { date: "8/4/2026 6:53:30 PM", userId: "SAPANA", functionName: "REPORT_WRITER/REPORT_DETAIL", dcInfo: "", ip: "14.11.20.160", tranno: "", refno: "", userType: "Agent" },
  { date: "8/4/2026 6:53:28 PM", userId: "SAPANA", functionName: "REPORT_WRITER/RPTVIEW", dcInfo: "", ip: "14.11.20.160", tranno: "", refno: "", userType: "Agent" },
  { date: "8/4/2026 6:51:36 PM", userId: "SAPANA", functionName: "SEND_TRANS/REPRINT_VOUCHER", dcInfo: "", ip: "14.11.20.160", tranno: "", refno: "", userType: "Agent" },
  { date: "8/4/2026 5:59:51 PM", userId: "panaceariya", functionName: "SEND_TRANSNEW/SENDMONEY", dcInfo: "", ip: "60.156.241.146", tranno: "", refno: "", userType: "Agent" },
  { date: "8/4/2026 5:59:51 PM", userId: "panaceariya", functionName: "SEND_TRANSNEW/CHECKROUTEPATH", dcInfo: "", ip: "60.156.241.146", tranno: "", refno: "", userType: "Agent" },
  { date: "8/4/2026 5:59:45 PM", userId: "panaceariya", functionName: "SEND_TRANSNEW/SELECTROUTE", dcInfo: "", ip: "60.156.241.146", tranno: "", refno: "", userType: "Agent" },
  { date: "8/4/2026 5:55:22 PM", userId: "panaceariya", functionName: "SEND_TRANSNEW/SENDMONEY", dcInfo: "", ip: "60.156.241.146", tranno: "", refno: "", userType: "Agent" },
  { date: "8/4/2026 5:55:21 PM", userId: "panaceariya", functionName: "SEND_TRANSNEW/CHECKROUTEPATH", dcInfo: "", ip: "60.156.241.146", tranno: "", refno: "", userType: "Agent" },
  { date: "8/4/2026 5:55:15 PM", userId: "panaceariya", functionName: "SEND_TRANSNEW/SELECTROUTE", dcInfo: "", ip: "60.156.241.146", tranno: "", refno: "", userType: "Agent" },
  { date: "8/4/2026 5:42:24 PM", userId: "SAPANA", functionName: "REPORT_WRITER/REPORT_DETAIL", dcInfo: "", ip: "14.11.20.160", tranno: "", refno: "", userType: "Agent" },
  { date: "8/4/2026 5:42:20 PM", userId: "SAPANA", functionName: "REPORT_WRITER/RPTVIEW", dcInfo: "", ip: "14.11.20.160", tranno: "", refno: "", userType: "Agent" },
];

export const logPanelOptions = ["All", "API Account Deposit", "API Exception Hold"];
