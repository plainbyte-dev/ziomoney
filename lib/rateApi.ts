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
import { createActionApi } from "./apiResource";

const callRateAction = createActionApi("/api/rates", "Network error while calling the remittance API.");

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

export function updateExchangeRateFromCsv(payload: ExchangeRateUpsertPayload) {
  return callRateAction<ExchangeRateRecord>("update-csv-rate", { method: "POST", body: payload });
}

// Service Charge
// Singular lookup — "most recently created active service charge," one row.
// Not for populating the main table (that's getAllServiceCharges/GetSeRate
// below) — unused by any screen right now; wire it up only once a real spot
// that needs a single fallback/default service charge is identified.
export function getServiceCharge() {
  return callRateAction<ServiceChargeRecord>("get-service-charge", { method: "GET" });
}

// GetSeRate's 200 response is documented as a bare `string` in the schema —
// unexpanded, same as several other endpoints in this API. callRateAction
// still types it as ServiceChargeRecord[] here on the assumption it matches
// ResponseDtoListServiceChargeResponse; RatesContext.refreshServiceCharges
// guards against an unexpected shape at the point it's consumed rather than
// trusting this type blindly. Update this comment once confirmed against a
// real call.
export function getAllServiceCharges() {
  return callRateAction<ServiceChargeRecord[]>("get-se-rate", { method: "GET" });
}

// Existing row (has a real id) — update in place.
export function saveServiceCharge(payload: ServiceChargeUpsertPayload) {
  return callRateAction<ServiceChargeRecord>("service-charges-save", { method: "POST", body: payload });
}

// New row (id: 0) — separate endpoint from the one above. Whether it
// rejects or just ignores a populated id is unconfirmed, so callers should
// still send id: 0 for a genuinely new row rather than omitting the field.
export function insertServiceCharge(payload: ServiceChargeUpsertPayload) {
  return callRateAction<ServiceChargeRecord>("service-charges-insert", { method: "POST", body: payload });
}

// Country / Currency — POST /UpdateCsvfileForCountries upserts ONE row per
// call, as a structured JSON object with the normal envelope response
// (confirmed against Swagger). "From a CSV import" in its description refers
// to the source of the data, not the request/response shape — an earlier
// build pass wrongly treated this as a raw-string endpoint; see
// data/countryCurrencyData.ts.
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
