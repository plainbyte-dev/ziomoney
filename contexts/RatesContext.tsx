"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDataMode } from "./DataModeContext";
import { useNotifications } from "./NotificationsContext";
import { loadState, saveState } from "@/lib/persist";
import { useAsyncMutation } from "@/lib/useAsyncMutation";
import { useAsyncQuery } from "@/lib/useAsyncQuery";
import {
  getAllCountries,
  getCountryWiseExRate,
  updateExchangeRate,
  updateExchangeRateFromCsv,
  getAllServiceCharges,
  saveServiceCharge,
  insertServiceCharge,
  upsertCountryCurrency,
  getPartnerCommissions,
  upsertPartnerCommission,
  getAllPendingPartnerOfferRates,
  getLatestConfirmedPartnerRate,
  getPartnerRateHistory,
  insertPartnerOfferRate,
  confirmPartnerOfferRate,
  cancelPartnerOfferRate,
  addOrUpdateMargin,
} from "@/lib/rateApi";
import {
  exchangeRateRecords,
  type ExchangeRateItem,
  type ExchangeRateRecord,
  type ExchangeRateUpsertPayload,
} from "@/data/exchangeRateData";
import {
  serviceChargeRecords,
  type ServiceChargeRecord,
  type ServiceChargeUpsertPayload,
} from "@/data/serviceChargeData";
import {
  countryCurrencyRecords,
  type CountryCurrencyImportRowResult,
  type CountryCurrencyRecord,
  type CountryCurrencyUpsertPayload,
} from "@/data/countryCurrencyData";
import {
  commissionRecords,
  type CommissionLookupPayload,
  type CommissionRecord,
  type CommissionUpsertPayload,
} from "@/data/partnerCommissionData";
import {
  partnerOfferRateRecords,
  type PartnerOfferRateActionPayload,
  type PartnerOfferRateInsertPayload,
  type PartnerOfferRateLookupPayload,
  type PartnerOfferRateRecord,
} from "@/data/partnerOfferRateData";
import { marginRecords, type MarginRecord, type MarginUpsertPayload } from "@/data/marginSetupData";

interface RatesContextValue {
  exchangeRates: ExchangeRateRecord[];
  exchangeRatesLoading: boolean;
  exchangeRatesError: string | null;
  refreshExchangeRates: () => Promise<void>;
  saveExchangeRate: (payload: ExchangeRateUpsertPayload) => Promise<boolean>;
  lookupExchangeRate: (symbol: string) => Promise<ExchangeRateItem | null>;
  importExchangeRatesFromCsv: (rows: ExchangeRateUpsertPayload[]) => Promise<{ imported: number; failed: number }>;

  serviceCharges: ServiceChargeRecord[];
  serviceChargesLoading: boolean;
  serviceChargesError: string | null;
  refreshServiceCharges: () => Promise<void>;
  saveServiceChargeEntry: (payload: ServiceChargeUpsertPayload, isNew: boolean) => Promise<boolean>;

  countryCurrencies: CountryCurrencyRecord[];
  countryCurrencyImporting: boolean;
  importCountryCurrencyCsv: (rows: CountryCurrencyUpsertPayload[]) => Promise<CountryCurrencyImportRowResult[]>;

  commissions: CommissionRecord[];
  commissionsLoading: boolean;
  commissionsError: string | null;
  searchCommissions: (payload: CommissionLookupPayload) => Promise<boolean>;
  saveCommission: (payload: CommissionUpsertPayload) => Promise<boolean>;
  // Separate from commissionsError — that's the search mutation's error
  // slot, this is save's. Surfaces the real backend rejection message
  // (e.g. a validation 400) instead of a generic string.
  commissionSaveError: string | null;

  partnerOfferRates: PartnerOfferRateRecord[];
  partnerOfferRatesLoading: boolean;
  partnerOfferRateActionError: string | null;
  refreshPartnerOfferRates: () => Promise<void>;
  insertOfferRate: (payload: PartnerOfferRateInsertPayload) => Promise<PartnerOfferRateRecord | null>;
  confirmOfferRate: (
    payload: PartnerOfferRateActionPayload,
    options?: { allowSelfApproval?: boolean }
  ) => Promise<boolean>;
  cancelOfferRate: (
    payload: PartnerOfferRateActionPayload,
    options?: { allowSelfApproval?: boolean }
  ) => Promise<boolean>;
  lookupCurrentPartnerOfferRate: (payload: PartnerOfferRateLookupPayload) => Promise<PartnerOfferRateRecord | null>;
  lookupPartnerOfferRateHistory: (payload: PartnerOfferRateLookupPayload) => Promise<PartnerOfferRateRecord[]>;

  margins: MarginRecord[];
  saveMargin: (payload: MarginUpsertPayload) => Promise<boolean>;
  // Surfaces the real backend rejection message on a failed save, same
  // reasoning as commissionSaveError above.
  marginSaveError: string | null;
}

const RatesContext = createContext<RatesContextValue | null>(null);

const STORAGE_KEY = "zio-rates-state";

interface PersistedRatesState {
  exchangeRates: ExchangeRateRecord[];
  serviceCharges: ServiceChargeRecord[];
  countryCurrencies: CountryCurrencyRecord[];
  commissions: CommissionRecord[];
  partnerOfferRates: PartnerOfferRateRecord[];
  margins: MarginRecord[];
}

let localIdCounter = 5000;
let localOfferRateSeq = 100;

export function RatesProvider({ children }: { children: React.ReactNode }) {
  const { isLive } = useDataMode();
  const { notify } = useNotifications();

  // Seed data is demo-only — a live session must never render it, not even
  // for the instant before the first live fetch resolves.
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateRecord[]>(() =>
    isLive ? [] : exchangeRateRecords
  );
  const exchangeRatesQuery = useAsyncQuery();
  const saveExchangeRateMutation = useAsyncMutation();

  const [serviceCharges, setServiceCharges] = useState<ServiceChargeRecord[]>(() =>
    isLive ? [] : serviceChargeRecords
  );
  const serviceChargesQuery = useAsyncQuery();
  const saveServiceChargeMutation = useAsyncMutation();

  // countryCurrencies has no "list all" endpoint at all — the only backend
  // call is UpdateCsvfileForCountries, which takes one raw CSV row string per
  // call and returns an opaque string, not a saved record. So this table is
  // built entirely from what was successfully imported this session, using
  // the values as parsed from the CSV — never from a response payload.
  const [countryCurrencies, setCountryCurrencies] = useState<CountryCurrencyRecord[]>(() =>
    isLive ? [] : countryCurrencyRecords
  );
  const [countryCurrencyImporting, setCountryCurrencyImporting] = useState(false);

  // No "list ALL" endpoint for commissions — obtainRemittancePartnerCommission
  // is a real search endpoint (userName + destinationCountry + sendCurrency),
  // just a filtered one, not a full fetch. So this table only ever holds
  // what's been searched for or saved this session, merged in rather than
  // replaced so an earlier search's rows don't disappear when a different
  // one is saved.
  const [commissions, setCommissions] = useState<CommissionRecord[]>(() =>
    isLive ? [] : commissionRecords
  );
  // searchCommissions merges results into existing state rather than
  // replacing it, so it's a mutation (no wipe-before-fetch), not a query.
  const commissionsMutation = useAsyncMutation();
  const saveCommissionMutation = useAsyncMutation();

  const [partnerOfferRates, setPartnerOfferRates] = useState<PartnerOfferRateRecord[]>(() =>
    isLive ? [] : partnerOfferRateRecords
  );
  const partnerOfferRatesQuery = useAsyncQuery();
  // Shared by insert/confirm/cancel — same single error slot as before.
  const offerRateActionMutation = useAsyncMutation();

  // No "list all" endpoint for margins either — same as countryCurrencies/commissions above.
  const [margins, setMargins] = useState<MarginRecord[]>(() => (isLive ? [] : marginRecords));
  const saveMarginMutation = useAsyncMutation();

  // Restore any admin-made changes from a previous session so a page refresh
  // doesn't silently drop them back to the seed data. Only meaningful in demo
  // mode — a live session gets its records from the API, never from a
  // locally persisted demo snapshot.
  useEffect(() => {
    if (isLive) return;
    const saved = loadState<PersistedRatesState>(STORAGE_KEY);
    if (!saved) return;
    setExchangeRates(saved.exchangeRates);
    setServiceCharges(saved.serviceCharges);
    setCountryCurrencies(saved.countryCurrencies);
    setCommissions(saved.commissions);
    setPartnerOfferRates(saved.partnerOfferRates);
    setMargins(saved.margins);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // countryCurrencies/commissions/margins have no refresh-from-API mechanism
  // (no list endpoint), so switching into live mode has to explicitly clear
  // out whatever demo data was showing — nothing will otherwise overwrite it.
  useEffect(() => {
    if (!isLive) return;
    setCountryCurrencies([]);
    setCommissions([]);
    setMargins([]);
  }, [isLive]);

  const skipNextSave = useRef(true);
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveState<PersistedRatesState>(STORAGE_KEY, {
      exchangeRates,
      serviceCharges,
      countryCurrencies,
      commissions,
      partnerOfferRates,
      margins,
    });
  }, [exchangeRates, serviceCharges, countryCurrencies, commissions, partnerOfferRates, margins]);

  const refreshExchangeRates = useCallback(async () => {
    await exchangeRatesQuery.run<ExchangeRateItem[]>({
      isLive,
      clear: () => setExchangeRates([]),
      fetch: () => getAllCountries(),
      // /getAllCountries returns the lighter ExchangeRateItem shape; map it
      // onto the fuller record shape the table renders (missing fields
      // default out).
      onSuccess: (data) => {
        setExchangeRates(
          (data ?? []).map((item, index) => ({
            id: index + 1,
            symbol: item.symbol,
            countryName: item.countryName,
            currencyName: item.currency,
            countryIsoCode: item.currencyAcro,
            unit: item.unit,
            buying: item.buying,
            selling: item.selling,
            flag: item.flag,
            priority: index,
            active: true,
            createdDate: "",
            updatedDate: "",
          }))
        );
      },
      fallbackErrorMessage: "Could not load exchange rates.",
    });
  }, [isLive, exchangeRatesQuery]);

  const saveExchangeRate = useCallback(
    (payload: ExchangeRateUpsertPayload) =>
      saveExchangeRateMutation.run<boolean>({
        isLive,
        demo: async () => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          setExchangeRates((prev) => {
            const existing = prev.find((r) => r.symbol === payload.symbol);
            const record: ExchangeRateRecord = {
              ...payload,
              id: existing?.id ?? ++localIdCounter,
              createdDate: existing?.createdDate ?? new Date().toISOString().slice(0, 10),
              updatedDate: new Date().toISOString().slice(0, 10),
            };
            return existing
              ? prev.map((r) => (r.symbol === payload.symbol ? record : r))
              : [record, ...prev];
          });
          notify({ title: "Exchange rate updated", message: `${payload.symbol} rate was saved.` });
          return true;
        },
        live: () => updateExchangeRate(payload),
        onLiveSuccess: async () => {
          await refreshExchangeRates();
          notify({ title: "Exchange rate updated", message: `${payload.symbol} rate was saved.` });
          return true;
        },
        failValue: false,
        fallbackErrorMessage: "Could not save the exchange rate.",
      }),
    [isLive, notify, refreshExchangeRates, saveExchangeRateMutation]
  );

  const lookupExchangeRate = useCallback(
    async (symbol: string) => {
      const normalized = symbol.trim().toUpperCase();
      if (!normalized) return null;

      if (!isLive) {
        const match = exchangeRates.find((r) => r.symbol.toUpperCase() === normalized);
        if (!match) return null;
        return {
          symbol: match.symbol,
          currency: match.currencyName,
          currencyAcro: match.countryIsoCode,
          countryName: match.countryName,
          unit: match.unit,
          buying: match.buying,
          selling: match.selling,
          flag: match.flag,
        };
      }

      const response = await getCountryWiseExRate(normalized);
      return response.success ? response.data : null;
    },
    [isLive, exchangeRates]
  );

  const importExchangeRatesFromCsv = useCallback(
    async (rows: ExchangeRateUpsertPayload[]) => {
      let imported = 0;
      let failed = 0;

      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setExchangeRates((prev) => {
          let next = prev;
          for (const payload of rows) {
            const existing = next.find((r) => r.symbol === payload.symbol);
            const record: ExchangeRateRecord = {
              ...payload,
              id: existing?.id ?? ++localIdCounter,
              createdDate: existing?.createdDate ?? new Date().toISOString().slice(0, 10),
              updatedDate: new Date().toISOString().slice(0, 10),
            };
            next = existing
              ? next.map((r) => (r.symbol === payload.symbol ? record : r))
              : [record, ...next];
          }
          return next;
        });
        imported = rows.length;
        notify({ title: "Exchange rates imported", message: `${imported} row(s) imported from CSV.` });
        return { imported, failed };
      }

      for (const payload of rows) {
        const response = await updateExchangeRateFromCsv(payload);
        if (response.success) imported += 1;
        else failed += 1;
      }
      await refreshExchangeRates();
      notify({
        title: "Exchange rates imported",
        message: `${imported} row(s) imported${failed ? `, ${failed} failed` : ""}.`,
      });
      return { imported, failed };
    },
    [isLive, notify, refreshExchangeRates]
  );

  const refreshServiceCharges = useCallback(async () => {
    await serviceChargesQuery.run<ServiceChargeRecord[]>({
      isLive,
      clear: () => setServiceCharges([]),
      // GetSeRate's response schema is an unexpanded bare `string` in the
      // Swagger doc — guard against it not actually being the array we
      // expect, rather than trusting the type and letting `.map`/`.length`
      // blow up downstream on something else (e.g. a JSON-encoded string
      // needing a second parse).
      fetch: async () => {
        const response = await getAllServiceCharges();
        if (response.success && !Array.isArray(response.data)) {
          return {
            ...response,
            success: false,
            message: "GetSeRate returned an unexpected shape (not an array) — confirm the real response format with backend.",
          };
        }
        return response;
      },
      onSuccess: (data) => setServiceCharges(data),
      fallbackErrorMessage: "Could not load service charges.",
    });
  }, [isLive, serviceChargesQuery]);

  const saveServiceChargeEntry = useCallback(
    (payload: ServiceChargeUpsertPayload, isNew: boolean) =>
      saveServiceChargeMutation.run<boolean>({
        isLive,
        demo: async () => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          setServiceCharges((prev) => {
            const id = payload.id || ++localIdCounter;
            const existing = prev.find((r) => r.id === id);
            const record: ServiceChargeRecord = {
              ...payload,
              id,
              // MOCK-ONLY field, not part of the save payload — carry the
              // existing value forward on edit, default on a genuinely new row.
              feeAmountMOCKONLY: existing?.feeAmountMOCKONLY ?? 0,
              createdDate: existing?.createdDate ?? new Date().toISOString().slice(0, 10),
              updatedDate: new Date().toISOString().slice(0, 10),
            };
            const exists = prev.some((r) => r.id === id);
            return exists ? prev.map((r) => (r.id === id ? record : r)) : [record, ...prev];
          });
          notify({ title: "Service charge saved", message: `${payload.countrySymbol} / ${payload.agentName} was updated.` });
          return true;
        },
        // New rows go through Service_Charges_Insert; existing ones (a real
        // id from the row being edited) go through Service_Charges_save —
        // these are two distinct endpoints, not one shared upsert.
        live: () => (isNew ? insertServiceCharge(payload) : saveServiceCharge(payload)),
        onLiveSuccess: async () => {
          await refreshServiceCharges();
          notify({ title: "Service charge saved", message: `${payload.countrySymbol} / ${payload.agentName} was updated.` });
          return true;
        },
        failValue: false,
        fallbackErrorMessage: "Could not save the service charge.",
      }),
    [isLive, notify, refreshServiceCharges, saveServiceChargeMutation]
  );

  // UpdateCsvfileForCountries upserts ONE row per call and has no
  // "list all" endpoint, so importing is a batched loop and the table is
  // built from successfully-imported rows, not a fetch. Batched (not fully
  // parallel) so a large file doesn't fire dozens of requests at once.
  const COUNTRY_CURRENCY_IMPORT_BATCH_SIZE = 5;

  const importCountryCurrencyCsv = useCallback(
    async (rows: CountryCurrencyUpsertPayload[]): Promise<CountryCurrencyImportRowResult[]> => {
      setCountryCurrencyImporting(true);
      const results: CountryCurrencyImportRowResult[] = [];

      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        for (const row of rows) results.push({ row, success: true, message: "Imported (demo mode)." });
        setCountryCurrencies((prev) => [...rows.map((row) => ({ ...row, id: ++localIdCounter })), ...prev]);
        setCountryCurrencyImporting(false);
        notify({
          title: "Country/currency rows imported",
          message: `${rows.length} of ${rows.length} row(s) imported.`,
        });
        return results;
      }

      for (let i = 0; i < rows.length; i += COUNTRY_CURRENCY_IMPORT_BATCH_SIZE) {
        const batch = rows.slice(i, i + COUNTRY_CURRENCY_IMPORT_BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(async (row): Promise<CountryCurrencyImportRowResult & { record?: CountryCurrencyRecord }> => {
            const response = await upsertCountryCurrency(row);
            return {
              row,
              success: response.success && !!response.data,
              message: response.success ? "Imported." : response.message || "Import failed.",
              record: response.data ?? undefined,
            };
          })
        );
        results.push(...batchResults.map(({ row, success, message }) => ({ row, success, message })));
        // Use the server-assigned id from the response rather than a local
        // counter — this is a real upsert now, not a fire-and-forget call.
        const succeededRows = batchResults
          .filter((r): r is typeof r & { record: CountryCurrencyRecord } => r.success && !!r.record)
          .map((r) => r.record);
        if (succeededRows.length) setCountryCurrencies((prev) => [...succeededRows, ...prev]);
      }

      setCountryCurrencyImporting(false);
      const succeeded = results.filter((r) => r.success).length;
      notify({
        title: "Country/currency rows imported",
        message: `${succeeded} of ${rows.length} row(s) imported${
          succeeded < rows.length ? `, ${rows.length - succeeded} failed` : ""
        }.`,
      });
      return results;
    },
    [isLive, notify]
  );

  const saveCommission = useCallback(
    (payload: CommissionUpsertPayload) =>
      saveCommissionMutation.run<boolean>({
        isLive,
        demo: async () => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          setCommissions((prev) => {
            const existing = prev.find(
              (r) =>
                r.remittancePartner === payload.userName &&
                r.destinationCountry === payload.destinationCountry &&
                r.sendCurrency === payload.sendCurrency
            );
            const record: CommissionRecord = {
              id: existing?.id ?? ++localIdCounter,
              remittancePartner: payload.userName,
              commissionRate: payload.commissionRate,
              commissionType: payload.commissionType,
              service: payload.service,
              sendCurrency: payload.sendCurrency,
              destinationCountry: payload.destinationCountry,
              remittanceType: payload.remittanceType,
            };
            return existing ? prev.map((r) => (r.id === record.id ? record : r)) : [record, ...prev];
          });
          notify({ title: "Partner commission saved", message: `${payload.userName} → ${payload.destinationCountry} commission was updated.` });
          return true;
        },
        live: () => upsertPartnerCommission(payload),
        // Original never surfaced a save failure via commissionsError, just
        // the boolean return — requireData: true still gives us that (a
        // missing `data` falls into the generic failValue path below).
        onLiveSuccess: (response) => {
          const saved = response.data as CommissionRecord;
          // The upsert response already IS the saved record — merge it
          // straight in rather than re-querying and replacing the whole
          // list, which would wipe out any other partner/currency/country
          // combo already searched for this session.
          setCommissions((prev) => {
            const exists = prev.some((r) => r.id === saved.id);
            return exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...prev];
          });
          notify({ title: "Partner commission saved", message: `${payload.userName} → ${payload.destinationCountry} commission was updated.` });
          return true;
        },
        failValue: false,
        fallbackErrorMessage: "Could not save the partner commission.",
      }),
    [isLive, notify, saveCommissionMutation]
  );

  const searchCommissions = useCallback(
    (payload: CommissionLookupPayload) =>
      commissionsMutation.run<boolean>({
        isLive,
        // Demo mode already holds everything locally — nothing to fetch.
        demo: () => true,
        live: () => getPartnerCommissions(payload),
        onLiveSuccess: (response) => {
          const results = (response.data as CommissionRecord[] | null) ?? [];
          setCommissions((prev) => {
            const byId = new Map(prev.map((r) => [r.id, r]));
            for (const r of results) byId.set(r.id, r);
            return Array.from(byId.values());
          });
          return true;
        },
        failValue: false,
        fallbackErrorMessage: "Could not search partner commissions.",
        requireData: false,
      }),
    [isLive, commissionsMutation]
  );

  const saveMargin = useCallback(
    (payload: MarginUpsertPayload) =>
      saveMarginMutation.run<boolean>({
        isLive,
        demo: async () => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          setMargins((prev) => {
            const id = payload.id || ++localIdCounter;
            const record: MarginRecord = {
              ...payload,
              id,
              createdDate: prev.find((r) => r.id === id)?.createdDate ?? new Date().toISOString().slice(0, 10),
            };
            const exists = prev.some((r) => r.id === id);
            return exists ? prev.map((r) => (r.id === id ? record : r)) : [record, ...prev];
          });
          notify({ title: "Margin setup saved", message: `Margin for ${payload.targetPartner} was updated.` });
          return true;
        },
        live: () => addOrUpdateMargin(payload),
        onLiveSuccess: (response) => {
          const saved = response.data as MarginRecord;
          setMargins((prev) => {
            const exists = prev.some((r) => r.id === saved.id);
            return exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...prev];
          });
          notify({ title: "Margin setup saved", message: `Margin for ${payload.targetPartner} was updated.` });
          return true;
        },
        failValue: false,
        fallbackErrorMessage: "Could not save the margin.",
      }),
    [isLive, notify, saveMarginMutation]
  );

  const refreshPartnerOfferRates = useCallback(async () => {
    await partnerOfferRatesQuery.run<PartnerOfferRateRecord[]>({
      isLive,
      clear: () => setPartnerOfferRates([]),
      fetch: () => getAllPendingPartnerOfferRates(),
      onSuccess: (data) => setPartnerOfferRates(data ?? []),
      fallbackErrorMessage: "Could not load partner offer rates.",
    });
  }, [isLive, partnerOfferRatesQuery]);

  const insertOfferRate = useCallback(
    (payload: PartnerOfferRateInsertPayload) =>
      offerRateActionMutation.run<PartnerOfferRateRecord | null>({
        isLive,
        demo: async () => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const now = new Date().toISOString();
          const record: PartnerOfferRateRecord = {
            id: ++localIdCounter,
            uniqueId: `POR-LOCAL-${++localOfferRateSeq}`,
            remittancePartner: payload.remittancePartner,
            sendCurrency: payload.sendCurrency,
            receiveCurrency: payload.receiveCurrency,
            destCountry: payload.destCountry,
            sendCurrencyPerUsd: payload.sendCurrencyPerUsd,
            receiveCurrencyPerUsd: payload.receiveCurrencyPerUsd,
            directQuote: payload.directQuote,
            rate: payload.directQuote,
            quoteType: payload.quoteType,
            status: "PENDING",
            makerUser: payload.makerUser,
            checkerUser: null,
            createdDateTime: now,
            updatedDateTime: now,
          };
          setPartnerOfferRates((prev) => [record, ...prev]);
          notify({ title: "Offer rate submitted", message: `${payload.remittancePartner} quote is pending approval.` });
          return record;
        },
        live: () => insertPartnerOfferRate(payload),
        onLiveSuccess: async (response) => {
          await refreshPartnerOfferRates();
          notify({ title: "Offer rate submitted", message: `${payload.remittancePartner} quote is pending approval.` });
          return response.data as PartnerOfferRateRecord;
        },
        failValue: null,
        fallbackErrorMessage: "Could not submit the offer rate.",
      }),
    [isLive, notify, refreshPartnerOfferRates, offerRateActionMutation]
  );

  const resolveOfferRate = useCallback(
    (uniqueId: string, checkerUser: string, status: "CONFIRMED" | "CANCELLED") => {
      setPartnerOfferRates((prev) =>
        prev.map((r) =>
          r.uniqueId === uniqueId
            ? { ...r, status, checkerUser, updatedDateTime: new Date().toISOString() }
            : r
        )
      );
    },
    []
  );

  // Maker-checker separation of duties: whoever proposed a rate must not be
  // the one who approves/rejects it, even if the backend doesn't enforce
  // this itself — checked client-side against the rate we already hold.
  function blocksSelfApproval(uniqueId: string, checkerUser: string): boolean {
    const rate = partnerOfferRates.find((r) => r.uniqueId === uniqueId);
    return !!rate && rate.makerUser.trim().toLowerCase() === checkerUser.trim().toLowerCase();
  }

  const confirmOfferRate = useCallback(
    (payload: PartnerOfferRateActionPayload, options?: { allowSelfApproval?: boolean }) =>
      offerRateActionMutation.run<boolean>({
        isLive,
        guard: () =>
          !options?.allowSelfApproval && blocksSelfApproval(payload.uniqueId, payload.checkerUser)
            ? "You proposed this rate — a different user must confirm it."
            : null,
        demo: async () => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          resolveOfferRate(payload.uniqueId, payload.checkerUser, "CONFIRMED");
          notify({ title: "Offer rate confirmed", message: `${payload.uniqueId} was approved.` });
          return true;
        },
        live: () => confirmPartnerOfferRate(payload),
        onLiveSuccess: async () => {
          await refreshPartnerOfferRates();
          notify({ title: "Offer rate confirmed", message: `${payload.uniqueId} was approved.` });
          return true;
        },
        failValue: false,
        fallbackErrorMessage: "Could not confirm the offer rate.",
        requireData: false,
      }),
    [isLive, notify, refreshPartnerOfferRates, resolveOfferRate, offerRateActionMutation, partnerOfferRates]
  );

  const cancelOfferRate = useCallback(
    (payload: PartnerOfferRateActionPayload, options?: { allowSelfApproval?: boolean }) =>
      offerRateActionMutation.run<boolean>({
        isLive,
        guard: () =>
          !options?.allowSelfApproval && blocksSelfApproval(payload.uniqueId, payload.checkerUser)
            ? "You proposed this rate — a different user must reject it."
            : null,
        demo: async () => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          resolveOfferRate(payload.uniqueId, payload.checkerUser, "CANCELLED");
          notify({ title: "Offer rate cancelled", message: `${payload.uniqueId} was cancelled.` });
          return true;
        },
        live: () => cancelPartnerOfferRate(payload),
        onLiveSuccess: async () => {
          await refreshPartnerOfferRates();
          notify({ title: "Offer rate cancelled", message: `${payload.uniqueId} was cancelled.` });
          return true;
        },
        failValue: false,
        fallbackErrorMessage: "Could not cancel the offer rate.",
        requireData: false,
      }),
    [isLive, notify, refreshPartnerOfferRates, resolveOfferRate, offerRateActionMutation, partnerOfferRates]
  );

  // View C (Current) and View D (History) — on-demand lookups, not
  // persistent list state. Current returns a single latest-confirmed rate;
  // History returns everything matching the filters.
  const lookupCurrentPartnerOfferRate = useCallback(
    async (payload: PartnerOfferRateLookupPayload): Promise<PartnerOfferRateRecord | null> => {
      if (!isLive) {
        const match = partnerOfferRates.find(
          (r) =>
            r.remittancePartner.toLowerCase() === payload.userName.toLowerCase() &&
            r.sendCurrency.toUpperCase() === payload.sendCurrency.toUpperCase() &&
            r.destCountry.toLowerCase() === payload.destCountry.toLowerCase() &&
            r.status === "CONFIRMED"
        );
        return match ?? null;
      }
      const response = await getLatestConfirmedPartnerRate(payload);
      return response.success ? response.data : null;
    },
    [isLive, partnerOfferRates]
  );

  const lookupPartnerOfferRateHistory = useCallback(
    async (payload: PartnerOfferRateLookupPayload): Promise<PartnerOfferRateRecord[]> => {
      if (!isLive) {
        return partnerOfferRates.filter(
          (r) =>
            r.remittancePartner.toLowerCase() === payload.userName.toLowerCase() &&
            r.sendCurrency.toUpperCase() === payload.sendCurrency.toUpperCase() &&
            r.destCountry.toLowerCase() === payload.destCountry.toLowerCase()
        );
      }
      const response = await getPartnerRateHistory(payload);
      return response.success ? response.data ?? [] : [];
    },
    [isLive, partnerOfferRates]
  );

  const value = useMemo(
    () => ({
      exchangeRates,
      exchangeRatesLoading: exchangeRatesQuery.loading,
      exchangeRatesError: saveExchangeRateMutation.error ?? exchangeRatesQuery.error,
      refreshExchangeRates,
      saveExchangeRate,
      lookupExchangeRate,
      importExchangeRatesFromCsv,
      serviceCharges,
      serviceChargesLoading: serviceChargesQuery.loading,
      serviceChargesError: saveServiceChargeMutation.error ?? serviceChargesQuery.error,
      refreshServiceCharges,
      saveServiceChargeEntry,
      countryCurrencies,
      countryCurrencyImporting,
      importCountryCurrencyCsv,
      commissions,
      commissionsLoading: commissionsMutation.loading,
      commissionsError: commissionsMutation.error,
      searchCommissions,
      saveCommission,
      commissionSaveError: saveCommissionMutation.error,
      partnerOfferRates,
      partnerOfferRatesLoading: partnerOfferRatesQuery.loading,
      partnerOfferRateActionError: offerRateActionMutation.error,
      refreshPartnerOfferRates,
      insertOfferRate,
      confirmOfferRate,
      cancelOfferRate,
      lookupCurrentPartnerOfferRate,
      lookupPartnerOfferRateHistory,
      margins,
      saveMargin,
      marginSaveError: saveMarginMutation.error,
    }),
    [
      exchangeRates,
      exchangeRatesQuery.loading,
      exchangeRatesQuery.error,
      saveExchangeRateMutation.error,
      refreshExchangeRates,
      saveExchangeRate,
      lookupExchangeRate,
      importExchangeRatesFromCsv,
      serviceCharges,
      serviceChargesQuery.loading,
      serviceChargesQuery.error,
      saveServiceChargeMutation.error,
      refreshServiceCharges,
      saveServiceChargeEntry,
      countryCurrencies,
      countryCurrencyImporting,
      importCountryCurrencyCsv,
      commissions,
      commissionsMutation.loading,
      commissionsMutation.error,
      searchCommissions,
      saveCommission,
      saveCommissionMutation.error,
      partnerOfferRates,
      partnerOfferRatesQuery.loading,
      offerRateActionMutation.error,
      refreshPartnerOfferRates,
      insertOfferRate,
      confirmOfferRate,
      cancelOfferRate,
      lookupCurrentPartnerOfferRate,
      lookupPartnerOfferRateHistory,
      margins,
      saveMargin,
      saveMarginMutation.error,
    ]
  );

  return <RatesContext.Provider value={value}>{children}</RatesContext.Provider>;
}

export function useRates() {
  const ctx = useContext(RatesContext);
  if (!ctx) {
    throw new Error("useRates must be used within a RatesProvider");
  }
  return ctx;
}
