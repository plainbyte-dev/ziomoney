import { createActionApi } from "./apiResource";
import type {
  ComplianceRule,
  ComplianceRuleDirection,
  ComplianceRulePayload,
  ComplianceRuleValue,
  ComplianceRuleValueCountryLookupPayload,
  ComplianceRuleValueLookupPayload,
  ComplianceRuleValuePayload,
} from "@/data/complianceRuleData";

const callAction = createActionApi(
  "/api/compliance-rules",
  "Network error while calling the compliance rule API."
);
function callComplianceRuleAction<T>(action: string, body: unknown) {
  return callAction<T>(action, { method: "POST", body });
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
