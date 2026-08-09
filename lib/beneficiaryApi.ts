import type { AddBeneficiaryPayload, Beneficiary } from "@/data/beneficiaryData";
import { getAccessToken } from "./authToken";

export interface BeneficiaryApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
  timestamp: string;
}

async function callBeneficiaryApi<T>(
  path: string,
  init?: RequestInit
): Promise<BeneficiaryApiResponse<T>> {
  try {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (init?.body) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`/api/beneficiaries${path}`, {
      headers,
      ...init,
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
    return data as BeneficiaryApiResponse<T>;
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

export function listBeneficiaries() {
  return callBeneficiaryApi<Beneficiary[]>("");
}

export function addBeneficiary(payload: AddBeneficiaryPayload) {
  return callBeneficiaryApi<Beneficiary>("", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getBeneficiaryById(id: number) {
  return callBeneficiaryApi<Beneficiary>(`/${id}`);
}

export function deleteBeneficiary(id: number) {
  return callBeneficiaryApi<null>(`/${id}`, { method: "DELETE" });
}
