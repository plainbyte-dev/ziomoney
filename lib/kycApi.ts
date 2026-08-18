import type { ApproveKycPayload, CustomerRecord, KycApiRecord } from "@/data/kycData";
import { createActionApi } from "./apiResource";

const callKycAction = createActionApi("/api/kyc", "Network error while calling the KYC API.");

export function updateCustomer(payload: CustomerRecord) {
  return callKycAction<KycApiRecord>("update-customer", { method: "POST", body: payload });
}

export function approveKyc(payload: ApproveKycPayload) {
  return callKycAction<KycApiRecord>("approve", { method: "POST", body: payload });
}

export function complianceApproveKyc(payload: ApproveKycPayload) {
  return callKycAction<KycApiRecord>("compliance-approve", { method: "POST", body: payload });
}

export function getApprovedKycs() {
  return callKycAction<KycApiRecord[]>("approved", { method: "GET" });
}

export function getPendingKycs() {
  return callKycAction<KycApiRecord[]>("pending", { method: "GET" });
}

export function getComplianceHoldKycs() {
  return callKycAction<KycApiRecord[]>("compliance-hold", { method: "GET" });
}
