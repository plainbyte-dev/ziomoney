import type {
  PartnerLatestTransactionPayload,
  RemittanceTransactionRecord,
  StaffTransactionPayload,
  TransactionByRefPayload,
  ViewTransactionPayload,
} from "@/data/transactionData";
import { createActionApi } from "./apiResource";
import type { ApiResponse } from "./apiClient";

// Kept as an alias (rather than dropped like the other 8 resources' local
// envelope types) because components/UnconfirmedQueuePanel.tsx imports this
// name directly.
export type TransactionApiResponse<T> = ApiResponse<T>;

const callAction = createActionApi("/api/transactions", "Network error while calling the remittance API.");

function callTransactionAction<T>(action: string, body: unknown) {
  return callAction<T>(action, { method: "POST", body });
}

function callTransactionGetAction<T>(action: string) {
  return callAction<T>(action, { method: "GET" });
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
