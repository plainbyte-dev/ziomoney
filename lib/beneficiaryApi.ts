import type { AddBeneficiaryPayload, BeneficiaryApiRecord } from "@/data/beneficiaryData";
import { createPathApi } from "./apiResource";

const callBeneficiaryApi = createPathApi("/api/beneficiaries", "Network error while calling the remittance API.");

export function listBeneficiaries() {
  return callBeneficiaryApi<BeneficiaryApiRecord[]>("");
}

export function addBeneficiary(payload: AddBeneficiaryPayload) {
  return callBeneficiaryApi<BeneficiaryApiRecord>("", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getBeneficiaryById(id: number) {
  return callBeneficiaryApi<BeneficiaryApiRecord>(`/${id}`);
}

export function deleteBeneficiary(id: number) {
  return callBeneficiaryApi<null>(`/${id}`, { method: "DELETE" });
}
