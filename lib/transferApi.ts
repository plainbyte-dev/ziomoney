import type { PagedTransfers, TransferInsertPayload, TransferRecord } from "@/data/transferData";
import { createPathApi } from "./apiResource";

const callTransferApi = createPathApi("/api/transfers", "Network error while calling the remittance API.");

export function insertTransfer(payload: TransferInsertPayload) {
  return callTransferApi<TransferRecord>("", { method: "POST", body: JSON.stringify(payload) });
}

export function listTransfers(params: { page: number; size: number; sort?: string }) {
  const query = new URLSearchParams({ page: String(params.page), size: String(params.size) });
  if (params.sort) query.set("sort", params.sort);
  return callTransferApi<PagedTransfers<TransferRecord>>(`?${query.toString()}`);
}

export function getTransferById(id: number) {
  return callTransferApi<TransferRecord>(`/${id}`);
}

export function getTransferByRef(referenceNumber: string) {
  return callTransferApi<TransferRecord>(`/ref/${encodeURIComponent(referenceNumber)}`);
}

export function cancelTransfer(id: number) {
  return callTransferApi<TransferRecord>(`/${id}/cancel`, { method: "PUT" });
}
