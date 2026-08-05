import type {
  PartnerLatestTransactionPayload,
  RemittanceTransactionRecord,
  StaffTransactionPayload,
  TransactionByRefPayload,
  ViewTransactionPayload,
} from "@/data/transactionData";

export interface TransactionApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
  timestamp: string;
}

async function callTransactionAction<T>(action: string, body: unknown): Promise<TransactionApiResponse<T>> {
  try {
    const res = await fetch(`/api/transactions/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
