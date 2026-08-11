import { getAccessToken } from "./authToken";
import type {
  ComplianceRule,
  ComplianceRuleDirection,
  ComplianceRulePayload,
  ComplianceRuleValue,
  ComplianceRuleValueCountryLookupPayload,
  ComplianceRuleValueLookupPayload,
  ComplianceRuleValuePayload,
} from "@/data/complianceRuleData";

export interface ComplianceRuleApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
  timestamp: string;
}

async function callComplianceRuleAction<T>(
  action: string,
  body: unknown
): Promise<ComplianceRuleApiResponse<T>> {
  try {
    const token = getAccessToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`/api/compliance-rules/${action}`, {
      method: "POST",
      headers,
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
    return data as ComplianceRuleApiResponse<T>;
  } catch {
    return {
      success: false,
      message: "Network error while calling the compliance rule API.",
      data: null,
      errorCode: null,
      timestamp: new Date().toISOString(),
    };
  }
}

export function addComplianceRule(payload: ComplianceRulePayload) {
  return callComplianceRuleAction<ComplianceRule>("add", payload);
}

export function updateComplianceRule(payload: ComplianceRulePayload) {
  return callComplianceRuleAction<ComplianceRule>("update", payload);
}

export function deleteComplianceRule(identifier: string) {
  return callComplianceRuleAction<ComplianceRule>("delete", { identifier });
}

export function obtainComplianceRule(direction: ComplianceRuleDirection) {
  return callComplianceRuleAction<ComplianceRule[]>("list", { complianceRuleDirection: direction });
}

export function addComplianceRuleValue(payload: ComplianceRuleValuePayload) {
  return callComplianceRuleAction<ComplianceRuleValue>("add-value", payload);
}

export function updateComplianceRuleValue(payload: ComplianceRuleValuePayload) {
  return callComplianceRuleAction<ComplianceRuleValue>("update-value", payload);
}

export function obtainComplianceRuleValueSpecific(payload: ComplianceRuleValueLookupPayload) {
  return callComplianceRuleAction<ComplianceRuleValue[]>("value-specific", payload);
}

export function obtainComplianceRuleValueSpecificCountry(
  payload: ComplianceRuleValueCountryLookupPayload
) {
  return callComplianceRuleAction<ComplianceRuleValue[]>("value-specific-country", payload);
}
