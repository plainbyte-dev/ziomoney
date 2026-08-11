export type ComplianceRuleDirection = "SEND" | "RECEIVE";

export const complianceRuleDirections: ComplianceRuleDirection[] = ["SEND", "RECEIVE"];

export interface ComplianceRule {
  id: number;
  ruleName: string;
  identifier: string;
  criteria: string;
  dataType: string;
  field: string;
  direction: ComplianceRuleDirection;
  deleted: boolean;
}

// Fields accepted by both POST /addComplianceRule and POST /updateComplianceRule
// (the update endpoint is looked up by `identifier`, not a numeric id).
export type ComplianceRulePayload = Omit<ComplianceRule, "id" | "deleted">;

export function emptyComplianceRulePayload(direction: ComplianceRuleDirection): ComplianceRulePayload {
  return {
    ruleName: "",
    identifier: "",
    criteria: "",
    dataType: "",
    field: "",
    direction,
  };
}

// Response shape from obtainComplianceRuleValueSpecific / …SpecificCountry —
// note the key is `ruleIdentifier`, not `complianceRuleIdentifier` (that's
// the request-side name). Never read `ruleIdentifier` outside this file —
// call normalizeRuleValue() on every fetch and use `complianceRuleIdentifier`
// everywhere downstream instead, so the mismatch doesn't leak into forms/tables.
export interface ComplianceRuleValue {
  id: number;
  ruleIdentifier: string;
  direction: ComplianceRuleDirection;
  value: string;
  country: string;
  agent: string;
}

export interface NormalizedComplianceRuleValue {
  id: number;
  complianceRuleIdentifier: string;
  direction: ComplianceRuleDirection;
  value: string;
  country: string;
  agent: string;
}

export function normalizeRuleValue(value: ComplianceRuleValue): NormalizedComplianceRuleValue {
  return {
    id: value.id,
    complianceRuleIdentifier: value.ruleIdentifier,
    direction: value.direction,
    value: value.value,
    country: value.country,
    agent: value.agent,
  };
}

// Fields accepted by both POST /addComplianceRuleValue and POST /updateComplianceRuleValue.
// `id` is 0/omitted for add — the update endpoint is the only one that reads
// it (unlike the Rule endpoints above, which key off `identifier` instead).
// Neither request has a `direction` field — the response does, which
// strongly suggests direction is inherited from the parent rule rather than
// set per value, but that's UNCONFIRMED with backend. Do not add a direction
// input to the add/edit form on the strength of that guess alone.
export interface ComplianceRuleValuePayload {
  id: number;
  complianceRuleIdentifier: string;
  value: string;
  country: string;
  agent: string;
}

export function emptyComplianceRuleValuePayload(): ComplianceRuleValuePayload {
  return { id: 0, complianceRuleIdentifier: "", value: "", country: "", agent: "" };
}

// Fields accepted by POST /obtainComplianceRuleValueSpecific.
export interface ComplianceRuleValueLookupPayload {
  complianceRuleIdentifier: string;
  country: string;
  agent: string;
  direction: ComplianceRuleDirection;
}

// obtainComplianceRuleValueSpecificCountry's documented request schema is
// IDENTICAL to obtainComplianceRuleValueSpecific's — same four fields —
// despite the endpoint name suggesting a country-only lookup. What actually
// differs in backend matching behavior (e.g. wildcard country/agent matching)
// is UNCONFIRMED; both modes are wired here as distinct calls so that
// question can be tested without blocking on an answer.
export type ComplianceRuleValueCountryLookupPayload = ComplianceRuleValueLookupPayload;

export function emptyComplianceRuleValueLookupPayload(
  direction: ComplianceRuleDirection
): ComplianceRuleValueLookupPayload {
  return { complianceRuleIdentifier: "", country: "", agent: "", direction };
}

export function ruleStatusLabel(deleted: boolean): "Active" | "Inactive" {
  return deleted ? "Inactive" : "Active";
}

// Static demo data — no real backend. Swap for an API call in live mode.
export const complianceRuleRecords: ComplianceRule[] = [
  {
    id: 1,
    ruleName: "Sender amount threshold",
    identifier: "SEND_AMOUNT_MAX",
    criteria: "amount > 1000000",
    dataType: "NUMBER",
    field: "transferAmount",
    direction: "SEND",
    deleted: false,
  },
  {
    id: 2,
    ruleName: "Sanctioned nationality check",
    identifier: "SEND_NATIONALITY_BLOCK",
    criteria: "nationality IN (blockList)",
    dataType: "STRING",
    field: "nationality",
    direction: "SEND",
    deleted: false,
  },
  {
    id: 3,
    ruleName: "Beneficiary daily receive cap",
    identifier: "RECEIVE_DAILY_CAP",
    criteria: "dailyTotal > 500000",
    dataType: "NUMBER",
    field: "receiveAmount",
    direction: "RECEIVE",
    deleted: false,
  },
];

// Static demo data — no real backend. Swap for an API call in live mode.
export const complianceRuleValueRecords: NormalizedComplianceRuleValue[] = [
  {
    id: 1,
    complianceRuleIdentifier: "SEND_AMOUNT_MAX",
    direction: "SEND",
    value: "500000",
    country: "Japan",
    agent: "TRANS CASH INTERNATIONAL",
  },
  {
    id: 2,
    complianceRuleIdentifier: "RECEIVE_DAILY_CAP",
    direction: "RECEIVE",
    value: "300000",
    country: "India",
    agent: "remitteragent",
  },
];
