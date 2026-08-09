import type { ApproveKycPayload, CustomerRecord, KycApiRecord } from "@/data/kycData";
import { getAccessToken } from "./authToken";

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
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (options.method === "POST") headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`/api/kyc/${action}`, {
      method: options.method,
      headers,
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
