// Fields accepted by POST /Service_Charges_save and /Service_Charges_Insert
export interface ServiceChargeUpsertPayload {
  id: number;
  countrySymbol: string;
  agentName: string;
  deliveryOption: string;
  active: boolean;
}

// Response data from /Service_Charges_Insert and /getServiceCharge
export interface ServiceChargeRecord extends ServiceChargeUpsertPayload {
  createdDate: string;
  updatedDate: string;
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
  };
}

export const serviceChargeRecords: ServiceChargeRecord[] = [
  {
    id: 1,
    countrySymbol: "INR",
    agentName: "TRANS CASH INTERNATIONAL",
    deliveryOption: "Cash Pickup",
    active: true,
    createdDate: "2026-05-01",
    updatedDate: "2026-07-15",
  },
  {
    id: 2,
    countrySymbol: "NPR",
    agentName: "remitteragent",
    deliveryOption: "Bank Deposit",
    active: true,
    createdDate: "2026-05-12",
    updatedDate: "2026-06-30",
  },
  {
    id: 3,
    countrySymbol: "IDR",
    agentName: "KOPERASI SINEMI BERDIKARI UTAMA",
    deliveryOption: "Mobile Wallet",
    active: false,
    createdDate: "2026-04-20",
    updatedDate: "2026-06-01",
  },
];
