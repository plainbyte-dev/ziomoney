import { type SetupType, setupTypeValues } from "./setupTypeData";

// Fields accepted by POST /Service_Charges_save and /Service_Charges_Insert
export interface ServiceChargeUpsertPayload {
  id: number;
  countrySymbol: string;
  agentName: string;
  deliveryOption: string;
  active: boolean;
  // MOCK-ONLY — not part of the confirmed request schema. Governs the form
  // only: "COUNTRY" clears/hides Partner Name so the charge applies to every
  // partner in countrySymbol; "PARTNER" requires it. Stripped from the body
  // before it reaches Service_Charges_save/_Insert — see lib/rateApi.ts.
  setupTypeMOCKONLY: SetupType;
}

// Response data from GET /getServiceCharge and GET /GetSeRate
export interface ServiceChargeRecord extends ServiceChargeUpsertPayload {
  createdDate: string;
  updatedDate: string;
  // MOCK-ONLY — does not exist in the real ServiceChargeResponse schema.
  // The documented schema has no fee-amount field at all. This is a
  // stand-in so the UI can show a live number during frontend development;
  // read only by lib/transferMath.ts's resolveFee when
  // SERVICE_FEE_SOURCE_CONFIRMED is false (config/businessRules.ts).
  // DELETE this field and replace every read site once backend confirms
  // where the real fee amount lives.
  feeAmountMOCKONLY: number;
}

// UNCONFIRMED with backend — deliveryOption has no enum in the schema (it's
// a plain string). These three values are an educated guess based on the
// payout-channel pattern used elsewhere in this API (allowCash /
// allowAccountCredit), not a confirmed set. Do not treat this as final.
export const deliveryOptionValues = ["Cash Pickup", "Bank Deposit", "Mobile Wallet"];

export function emptyServiceChargePayload(): ServiceChargeUpsertPayload {
  return {
    id: 0,
    countrySymbol: "",
    agentName: "",
    deliveryOption: deliveryOptionValues[0],
    active: true,
    setupTypeMOCKONLY: setupTypeValues[1],
  };
}

export const serviceChargeRecords: ServiceChargeRecord[] = [
  {
    id: 1,
    countrySymbol: "INR",
    agentName: "TRANS CASH INTERNATIONAL",
    deliveryOption: "Cash Pickup",
    active: true,
    setupTypeMOCKONLY: "PARTNER",
    feeAmountMOCKONLY: 5,
    createdDate: "2026-05-01",
    updatedDate: "2026-07-15",
  },
  {
    id: 2,
    countrySymbol: "NPR",
    agentName: "remitteragent",
    deliveryOption: "Bank Deposit",
    active: true,
    setupTypeMOCKONLY: "PARTNER",
    feeAmountMOCKONLY: 5,
    createdDate: "2026-05-12",
    updatedDate: "2026-06-30",
  },
  {
    id: 3,
    countrySymbol: "IDR",
    agentName: "KOPERASI SINEMI BERDIKARI UTAMA",
    deliveryOption: "Mobile Wallet",
    active: false,
    setupTypeMOCKONLY: "PARTNER",
    feeAmountMOCKONLY: 4,
    createdDate: "2026-04-20",
    updatedDate: "2026-06-01",
  },
  {
    id: 4,
    countrySymbol: "USD",
    agentName: "AISA CO. LTD",
    deliveryOption: "Bank Deposit",
    active: true,
    setupTypeMOCKONLY: "PARTNER",
    feeAmountMOCKONLY: 8,
    createdDate: "2026-06-05",
    updatedDate: "2026-07-22",
  },
  {
    id: 5,
    countrySymbol: "PHP",
    agentName: "TRANS CASH INTERNATIONAL",
    deliveryOption: "Cash Pickup",
    active: true,
    setupTypeMOCKONLY: "PARTNER",
    feeAmountMOCKONLY: 6,
    createdDate: "2026-05-18",
    updatedDate: "2026-07-10",
  },
  {
    id: 6,
    countrySymbol: "AUD",
    agentName: "",
    deliveryOption: "Bank Deposit",
    active: true,
    setupTypeMOCKONLY: "COUNTRY",
    feeAmountMOCKONLY: 7,
    createdDate: "2026-07-01",
    updatedDate: "2026-07-01",
  },
  {
    id: 7,
    countrySymbol: "AED",
    agentName: "",
    deliveryOption: "Cash Pickup",
    active: true,
    setupTypeMOCKONLY: "COUNTRY",
    feeAmountMOCKONLY: 5,
    createdDate: "2026-07-14",
    updatedDate: "2026-07-14",
  },
];
