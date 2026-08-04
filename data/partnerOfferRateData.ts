export type QuoteType = "DIRECT" | "INDIRECT";
export type OfferRateStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export const quoteTypeValues: QuoteType[] = ["DIRECT", "INDIRECT"];

// Response data shared by insert / confirm / cancel / lookup endpoints
export interface PartnerOfferRateRecord {
  id: number;
  uniqueId: string;
  remittancePartner: string;
  sendCurrency: string;
  receiveCurrency: string;
  destCountry: string;
  sendCurrencyPerUsd: number;
  receiveCurrencyPerUsd: number;
  directQuote: number;
  rate: number;
  quoteType: QuoteType;
  status: OfferRateStatus;
  makerUser: string;
  checkerUser: string;
  createdDateTime: string;
  updatedDateTime: string;
}

// Fields accepted by POST /insertRemittancePartnerRates
export interface PartnerOfferRateInsertPayload {
  remittancePartner: string;
  sendCurrency: string;
  receiveCurrency: string;
  destCountry: string;
  quoteType: QuoteType;
  sendCurrencyPerUsd: number;
  receiveCurrencyPerUsd: number;
  directQuote: number;
  makerUser: string;
}

// Fields accepted by POST /confirmRemittancePartnerRate and /cancelRemittancePartnerRate
export interface PartnerOfferRateActionPayload {
  uniqueId: string;
  checkerUser: string;
}

// Fields accepted by POST /obtainRemittancePartnerRates and /obtainRemittancePartnerAllRates
export interface PartnerOfferRateLookupPayload {
  userName: string;
  sendCurrency: string;
  destCountry: string;
  fromDate: string;
  toDate: string;
}

export function emptyPartnerOfferRateInsertPayload(): PartnerOfferRateInsertPayload {
  return {
    remittancePartner: "",
    sendCurrency: "",
    receiveCurrency: "",
    destCountry: "",
    quoteType: "DIRECT",
    sendCurrencyPerUsd: 0,
    receiveCurrencyPerUsd: 0,
    directQuote: 0,
    makerUser: "",
  };
}

export const partnerOfferRateRecords: PartnerOfferRateRecord[] = [
  {
    id: 1,
    uniqueId: "POR-2026-0001",
    remittancePartner: "TRANS CASH INTERNATIONAL",
    sendCurrency: "JPY",
    receiveCurrency: "INR",
    destCountry: "India",
    sendCurrencyPerUsd: 148.2,
    receiveCurrencyPerUsd: 83.1,
    directQuote: 0.561,
    rate: 1.78,
    quoteType: "DIRECT",
    status: "PENDING",
    makerUser: "aisa.co",
    checkerUser: "",
    createdDateTime: "2026-08-02T09:15:00Z",
    updatedDateTime: "2026-08-02T09:15:00Z",
  },
  {
    id: 2,
    uniqueId: "POR-2026-0002",
    remittancePartner: "AISA CO. LTD",
    sendCurrency: "JPY",
    receiveCurrency: "NPR",
    destCountry: "Nepal",
    sendCurrencyPerUsd: 148.2,
    receiveCurrencyPerUsd: 133.5,
    directQuote: 0.9,
    rate: 1.9,
    quoteType: "DIRECT",
    status: "PENDING",
    makerUser: "rgurung",
    checkerUser: "",
    createdDateTime: "2026-08-03T11:40:00Z",
    updatedDateTime: "2026-08-03T11:40:00Z",
  },
];
