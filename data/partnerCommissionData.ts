import { settlementCurrencyOptions, partnerCountrySelectOptions } from "./partnerData";

export type CommissionType = "PERCENT" | "FLAT";

export const commissionTypeValues: CommissionType[] = ["PERCENT", "FLAT"];

// Fields accepted by POST /insertOrUpdateRemittancePartnerCommission
export interface CommissionUpsertPayload {
  userName: string;
  commissionRate: number;
  commissionType: CommissionType;
  service: string;
  sendCurrency: string;
  destinationCountry: string;
  remittanceType: string;
}

// Fields accepted by POST /obtainRemittancePartnerCommission
export interface CommissionLookupPayload {
  userName: string;
  destinationCountry: string;
  sendCurrency: string;
}

export interface CommissionRecord {
  id: number;
  remittancePartner: string;
  commissionRate: number;
  commissionType: CommissionType;
  service: string;
  sendCurrency: string;
  destinationCountry: string;
  remittanceType: string;
}

// userName is deliberately left "" — it's backfilled once the partner list
// loads (see PartnerCommissionPanel's effect), since that dropdown's options
// aren't known synchronously at form-init time the way currency/country are.
export function emptyCommissionPayload(): CommissionUpsertPayload {
  return {
    userName: "",
    commissionRate: 0,
    commissionType: "PERCENT",
    service: "",
    sendCurrency: settlementCurrencyOptions[0],
    destinationCountry: partnerCountrySelectOptions[0],
    remittanceType: "",
  };
}

export const commissionRecords: CommissionRecord[] = [
  {
    id: 1,
    remittancePartner: "TRANS CASH INTERNATIONAL",
    commissionRate: 1.5,
    commissionType: "PERCENT",
    service: "Cash Pickup",
    sendCurrency: "JPY",
    destinationCountry: "India",
    remittanceType: "Individual",
  },
  {
    id: 2,
    remittancePartner: "remitteragent",
    commissionRate: 500,
    commissionType: "FLAT",
    service: "Bank Deposit",
    sendCurrency: "JPY",
    destinationCountry: "Nepal",
    remittanceType: "Agent",
  },
];
