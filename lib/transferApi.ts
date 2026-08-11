import type { PagedTransfers, TransferInsertPayload, TransferRecord } from "@/data/transferData";
import { getAccessToken } from "./authToken";

export interface TransferApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
  timestamp: string;
}

async function callTransferApi<T>(path: string, init?: RequestInit): Promise<TransferApiResponse<T>> {
  try {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (init?.body) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`/api/transfers${path}`, { headers, ...init });

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
    return data as TransferApiResponse<T>;
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

export function insertTransfer(payload: TransferInsertPayload) {
  return callTransferApi<TransferRecord>("", { method: "POST", body: JSON.stringify(payload) });
}

export function listTransfers(params: { page: number; size: number; sort?: string }) {
  const query = new URLSearchParams({ page: String(params.page), size: String(params.size) });
  if (params.sort) query.set("sort", params.sort);
  return callTransferApi<PagedTransfers<TransferRecord>>(`?${query.toString()}`);
}
