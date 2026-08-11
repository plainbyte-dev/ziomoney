import { getAccessToken } from "./authToken";
import type { PayoutPartnerConfigPayload, PayoutPartnerConfigRecord } from "@/data/payoutConfigData";
import type { PayoutBankUpdatePayload, PayoutBankRecord } from "@/data/payoutBankData";

export interface InsertRemittancePartnerPayload {
  userName: string;
  partnerCode: string;
  description: string;
  partnerCountry: string;
  partnerAddress: string;
  remitterType: string;
  settlementCurrency: string;
  acceptPartnerPin: boolean;
  apiUser: boolean;
  email: string;
}

export interface RemittancePartnerRecord extends InsertRemittancePartnerPayload {
  id: number;
  balance: number;
  accountBalance: number;
  registeredDate: string;
  updatedDate: string;
}

export interface PartnerApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
  timestamp: string;
}

async function callPartnerAction<T>(
  action: string,
  options: { method: "GET" | "POST"; body?: unknown }
): Promise<PartnerApiResponse<T>> {
  try {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (options.method === "POST") headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`/api/partners/${action}`, {
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
    return data as PartnerApiResponse<T>;
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

export function insertRemittancePartner(payload: InsertRemittancePartnerPayload) {
  return callPartnerAction<RemittancePartnerRecord>("register", { method: "POST", body: payload });
}

export function listRemittancePartners() {
  return callPartnerAction<RemittancePartnerRecord[]>("list", { method: "GET" });
}

export function lookupRemittancePartner(userName: string) {
  return callPartnerAction<RemittancePartnerRecord>("lookup", { method: "POST", body: { userName } });
}

export function getRemittancePartnerInfo(userName: string) {
  return callPartnerAction<RemittancePartnerRecord>("info", { method: "POST", body: { userName } });
}

export function updateCreditLimit(childUserName: string, amount: number, description: string) {
  return callPartnerAction<RemittancePartnerRecord>("update-credit-limit", {
    method: "POST",
    body: { childUserName, amount, description },
  });
}

export function addActualBalance(childUserName: string, amount: number, description: string) {
  return callPartnerAction<RemittancePartnerRecord>("add-actual-balance", {
    method: "POST",
    body: { childUserName, amount, description },
  });
}

export function updateRemittancePartnerEmail(userName: string, email: string) {
  return callPartnerAction<RemittancePartnerRecord>("update-email", {
    method: "POST",
    body: { userName, email },
  });
}

export function updateRemittancePartnerAcceptPin(userName: string, acceptPartnerPin: boolean) {
  return callPartnerAction<RemittancePartnerRecord>("update-accept-pin", {
    method: "POST",
    body: { userName, acceptPartnerPin },
  });
}

export function insertRemittancePartnerTxnCurrency(remittancePartnerUserName: string, txnCurrency: string) {
  return callPartnerAction<RemittancePartnerRecord>("insert-txn-currency", {
    method: "POST",
    body: { remittancePartnerUserName, txnCurrency },
  });
}

// Registers the well-known default agent partner ("remitteragent") — a
// fixed, server-side record, so this takes no payload.
export function insertAgentPartner() {
  return callPartnerAction<RemittancePartnerRecord>("insert-agent-partner", {
    method: "POST",
    body: {},
  });
}

export function changeRemittancePartnerPassword(userName: string, newPassword: string) {
  return callPartnerAction<RemittancePartnerRecord>("change-password", {
    method: "POST",
    body: { userName, newPassword },
  });
}

export function insertRemittancePayoutPartnerConfiguration(payload: PayoutPartnerConfigPayload) {
  return callPartnerAction<PayoutPartnerConfigRecord>("insert-payout-config", {
    method: "POST",
    body: payload,
  });
}

export function obtainRemittancePayoutPartnerConfiguration(remittancePartnerUserName: string) {
  return callPartnerAction<PayoutPartnerConfigRecord>("get-payout-config", {
    method: "POST",
    body: { remittancePartnerUserName },
  });
}

export function updateRemittancePayoutPartnerConfiguration(payload: PayoutPartnerConfigPayload) {
  return callPartnerAction<PayoutPartnerConfigRecord>("update-payout-config", {
    method: "POST",
    body: payload,
  });
}

export function requestPayoutBankUpdate(payload: PayoutBankUpdatePayload) {
  return callPartnerAction<PayoutBankRecord>("payout-bank-update", {
    method: "POST",
    body: payload,
  });
}

// GET /getPayoutPartner — the fixed "payout partner" enum values. The
// Swagger doc's response schema is ambiguous about array-vs-single-value
// shape, so callers should treat `data` as unknown and normalize it.
export function getPayoutPartner() {
  return callPartnerAction<unknown>("payout-partner-networks", { method: "GET" });
}
