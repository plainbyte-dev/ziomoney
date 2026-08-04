import type { ExchangeRateItem, ExchangeRateRecord, ExchangeRateUpsertPayload } from "@/data/exchangeRateData";
import type { ServiceChargeRecord, ServiceChargeUpsertPayload } from "@/data/serviceChargeData";
import type { CountryCurrencyRecord, CountryCurrencyUpsertPayload } from "@/data/countryCurrencyData";
import type { CommissionLookupPayload, CommissionRecord, CommissionUpsertPayload } from "@/data/partnerCommissionData";
import type {
  PartnerOfferRateActionPayload,
  PartnerOfferRateInsertPayload,
  PartnerOfferRateLookupPayload,
  PartnerOfferRateRecord,
} from "@/data/partnerOfferRateData";
import type { MarginRecord, MarginUpsertPayload } from "@/data/marginSetupData";

export interface RateApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
  timestamp: string;
}

async function callRateAction<T>(
  action: string,
  options: { method: "GET" | "POST"; body?: unknown }
): Promise<RateApiResponse<T>> {
  try {
    const res = await fetch(`/api/rates/${action}`, {
      method: options.method,
      headers: options.method === "POST" ? { "Content-Type": "application/json" } : undefined,
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
    return data as RateApiResponse<T>;
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

// Exchange Rate
export function getAllCountries() {
  return callRateAction<ExchangeRateItem[]>("get-all-countries", { method: "GET" });
}

export function getCountryWiseExRate(symbol: string) {
  return callRateAction<ExchangeRateItem>("get-country-wise-ex-rate", { method: "POST", body: { symbol } });
}

export function updateExchangeRate(payload: ExchangeRateUpsertPayload) {
  return callRateAction<ExchangeRateRecord>("update-rate", { method: "POST", body: payload });
}

// Service Charge
export function getServiceCharge() {
  return callRateAction<ServiceChargeRecord>("get-service-charge", { method: "GET" });
}

export function getAllServiceCharges() {
  return callRateAction<ServiceChargeRecord[]>("get-se-rate", { method: "GET" });
}

export function saveServiceCharge(payload: ServiceChargeUpsertPayload) {
  return callRateAction<ServiceChargeRecord>("service-charges-save", { method: "POST", body: payload });
}

// Country / Currency
export function upsertCountryCurrency(payload: CountryCurrencyUpsertPayload) {
  return callRateAction<CountryCurrencyRecord>("update-csv-file-for-countries", { method: "POST", body: payload });
}

// Partner Commission
export function getPartnerCommissions(payload: CommissionLookupPayload) {
  return callRateAction<CommissionRecord[]>("obtain-partner-commission", { method: "POST", body: payload });
}

export function upsertPartnerCommission(payload: CommissionUpsertPayload) {
  return callRateAction<CommissionRecord>("insert-or-update-partner-commission", { method: "POST", body: payload });
}

// Partner Offer Rate
export function getAllPendingPartnerOfferRates() {
  return callRateAction<PartnerOfferRateRecord[]>("obtain-all-pending-partner-offer-rates", { method: "GET" });
}

export function getLatestConfirmedPartnerRate(payload: PartnerOfferRateLookupPayload) {
  return callRateAction<PartnerOfferRateRecord>("obtain-partner-rates", { method: "POST", body: payload });
}

export function getPartnerRateHistory(payload: PartnerOfferRateLookupPayload) {
  return callRateAction<PartnerOfferRateRecord[]>("obtain-partner-all-rates", { method: "POST", body: payload });
}

export function insertPartnerOfferRate(payload: PartnerOfferRateInsertPayload) {
  return callRateAction<PartnerOfferRateRecord>("insert-partner-rates", { method: "POST", body: payload });
}

export function confirmPartnerOfferRate(payload: PartnerOfferRateActionPayload) {
  return callRateAction<PartnerOfferRateRecord>("confirm-partner-rate", { method: "POST", body: payload });
}

export function cancelPartnerOfferRate(payload: PartnerOfferRateActionPayload) {
  return callRateAction<PartnerOfferRateRecord>("cancel-partner-rate", { method: "POST", body: payload });
}

// Margin Setup
export function addOrUpdateMargin(payload: MarginUpsertPayload) {
  return callRateAction<MarginRecord>("add-or-update-margin", { method: "POST", body: payload });
}
