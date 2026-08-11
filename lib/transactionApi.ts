import type {
  PartnerLatestTransactionPayload,
  RemittanceTransactionRecord,
  StaffTransactionPayload,
  TransactionByRefPayload,
  ViewTransactionPayload,
} from "@/data/transactionData";
import { getAccessToken } from "./authToken";

export interface TransactionApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
  timestamp: string;
}

async function callTransactionAction<T>(action: string, body: unknown): Promise<TransactionApiResponse<T>> {
  try {
    const token = getAccessToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`/api/transactions/${action}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body ?? {}),
    });

    const data = await res.json().catch(() => null);
    if (!data) {
      return {
        success: false,
        message: `Unexpected response from server (HTTP ${res.status}).`,
        data: null,
        errorCode: null,
        timestamp: new Date().toISOString(),
      };
    }
    return data as TransactionApiResponse<T>;
  } catch {
    return {
      success: false,
      message: "Network error while calling the remittance API.",
      data: null,
      errorCode: null,
      timestamp: new Date().toISOString(),
    };
  }
}

async function callTransactionGetAction<T>(action: string): Promise<TransactionApiResponse<T>> {
  try {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`/api/transactions/${action}`, { method: "GET", headers });

    const data = await res.json().catch(() => null);
    if (!data) {
      return {
        success: false,
        message: `Unexpected response from server (HTTP ${res.status}).`,
        data: null,
        errorCode: null,
        timestamp: new Date().toISOString(),
      };
    }
    return data as TransactionApiResponse<T>;
  } catch {
    return {
      success: false,
      message: "Network error while calling the remittance API.",
      data: null,
      errorCode: null,
      timestamp: new Date().toISOString(),
    };
  }
}

export function viewTransaction(payload: ViewTransactionPayload) {
  return callTransactionAction<RemittanceTransactionRecord>("view-transaction", payload);
}

export function getTransactionsByStaff(payload: StaffTransactionPayload) {
  return callTransactionAction<RemittanceTransactionRecord[]>("by-staff", payload);
}

export function getTransactionsByRefNo(payload: TransactionByRefPayload) {
  return callTransactionAction<RemittanceTransactionRecord[]>("by-ref-no", payload);
}

export function getLatestTransactionByUsername(payload: PartnerLatestTransactionPayload) {
  return callTransactionAction<RemittanceTransactionRecord>("latest-by-username", payload);
}

// GET /getAllCompileHoldRemittance — remittances currently held by
// compliance. No request body. What clears a hold isn't documented by any
// endpoint in this API — see ComplianceTxnHoldsPanel for that open question.
export function getComplianceHoldRemittances() {
  return callTransactionGetAction<RemittanceTransactionRecord[]>("compliance-holds");
}

// GET /getAllUnapprovedRemittances — admin-inserted unconfirmed queue.
// GET /getAllUnapprovedRemittances2 — partner-API-inserted unconfirmed
// queue. Two distinct source queues per the API, not two views of the same
// data — kept as separate calls/screens rather than merged.
// Both endpoints' 200 responses are shown as a bare `string` in the doc —
// unexpanded, same issue hit elsewhere in this API. Callers should guard
// against `response.data` not actually being an array rather than trusting
// this type blindly (see UnconfirmedListPanel/UnconfirmedListPartnerApiPanel).
export function getAllUnapprovedRemittances() {
  return callTransactionGetAction<RemittanceTransactionRecord[]>("unconfirmed-admin");
}

export function getAllUnapprovedRemittancesPartnerApi() {
  return callTransactionGetAction<RemittanceTransactionRecord[]>("unconfirmed-partner");
}

// GET /getAllConformedRemittances — confirmed remittances ready to push to a
// payout partner. Same unexpanded-schema caveat as above. Whether there's an
// explicit "push to payout" action or it happens automatically once status
// reaches CONFIRMED is unconfirmed — see PendingTransactionPanel.
export function getAllConformedRemittances() {
  return callTransactionGetAction<RemittanceTransactionRecord[]>("confirmed");
}
