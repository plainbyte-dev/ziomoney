import type { ApproveKycPayload, CustomerRecord, KycRecord } from "@/data/kycData";

export interface KycApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
  timestamp: string;
}

async function callKycAction<T>(
  action: string,
  options: { method: "GET" | "POST"; body?: unknown }
): Promise<KycApiResponse<T>> {
  try {
    const res = await fetch(`/api/kyc/${action}`, {
      method: options.method,
      headers: options.method === "POST" ? { "Content-Type": "application/json" } : undefined,
      body: options.method === "POST" ? JSON.stringify(options.body ?? {}) : undefined,
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
    return data as KycApiResponse<T>;
  } catch {
    return {
      success: false,
      message: "Network error while calling the KYC API.",
      data: null,
      errorCode: null,
      timestamp: new Date().toISOString(),
    };
  }
}

export function updateCustomer(payload: CustomerRecord) {
  return callKycAction<CustomerRecord>("update-customer", { method: "POST", body: payload });
}

export function approveKyc(payload: ApproveKycPayload) {
  return callKycAction<KycRecord>("approve", { method: "POST", body: payload });
}

export function complianceApproveKyc(payload: ApproveKycPayload) {
  return callKycAction<KycRecord>("compliance-approve", { method: "POST", body: payload });
}

export function getApprovedKycs() {
  return callKycAction<KycRecord[]>("approved", { method: "GET" });
}

export function getPendingKycs() {
  return callKycAction<KycRecord[]>("pending", { method: "GET" });
}

export function getComplianceHoldKycs() {
  return callKycAction<KycRecord[]>("compliance-hold", { method: "GET" });
}
