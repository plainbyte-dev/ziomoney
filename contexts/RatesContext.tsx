"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDataMode } from "./DataModeContext";
import { useNotifications } from "./NotificationsContext";
import { loadState, saveState } from "@/lib/persist";
import {
  getAllCountries,
  getCountryWiseExRate,
  updateExchangeRate,
  updateExchangeRateFromCsv,
  getAllServiceCharges,
  saveServiceCharge,
  upsertCountryCurrency,
  getPartnerCommissions,
  upsertPartnerCommission,
  getAllPendingPartnerOfferRates,
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
  type CountryCurrencyRecord,
  type CountryCurrencyUpsertPayload,
} from "@/data/countryCurrencyData";
import {
  commissionRecords,
  type CommissionRecord,
  type CommissionUpsertPayload,
} from "@/data/partnerCommissionData";
import {
  partnerOfferRateRecords,
  type PartnerOfferRateActionPayload,
  type PartnerOfferRateInsertPayload,
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
  saveServiceChargeEntry: (payload: ServiceChargeUpsertPayload) => Promise<boolean>;

  countryCurrencies: CountryCurrencyRecord[];
  saveCountryCurrency: (payload: CountryCurrencyUpsertPayload) => Promise<boolean>;

  commissions: CommissionRecord[];
  saveCommission: (payload: CommissionUpsertPayload) => Promise<boolean>;

  partnerOfferRates: PartnerOfferRateRecord[];
  partnerOfferRatesLoading: boolean;
  partnerOfferRateActionError: string | null;
  refreshPartnerOfferRates: () => Promise<void>;
  insertOfferRate: (payload: PartnerOfferRateInsertPayload) => Promise<boolean>;
  confirmOfferRate: (payload: PartnerOfferRateActionPayload) => Promise<boolean>;
  cancelOfferRate: (payload: PartnerOfferRateActionPayload) => Promise<boolean>;

  margins: MarginRecord[];
  saveMargin: (payload: MarginUpsertPayload) => Promise<boolean>;
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
  const [exchangeRatesLoading, setExchangeRatesLoading] = useState(false);
  const [exchangeRatesError, setExchangeRatesError] = useState<string | null>(null);

  const [serviceCharges, setServiceCharges] = useState<ServiceChargeRecord[]>(() =>
    isLive ? [] : serviceChargeRecords
  );
  const [serviceChargesLoading, setServiceChargesLoading] = useState(false);
  const [serviceChargesError, setServiceChargesError] = useState<string | null>(null);

  // These two have no "list all" endpoint on the backend at all — only
  // upsert/filtered-lookup — so a live session can never populate them from
  // a general fetch. They only ever fill in from a save/lookup response.
  const [countryCurrencies, setCountryCurrencies] = useState<CountryCurrencyRecord[]>(() =>
    isLive ? [] : countryCurrencyRecords
  );
  const [commissions, setCommissions] = useState<CommissionRecord[]>(() =>
    isLive ? [] : commissionRecords
  );

  const [partnerOfferRates, setPartnerOfferRates] = useState<PartnerOfferRateRecord[]>(() =>
    isLive ? [] : partnerOfferRateRecords
  );
  const [partnerOfferRatesLoading, setPartnerOfferRatesLoading] = useState(false);
  const [partnerOfferRateActionError, setPartnerOfferRateActionError] = useState<string | null>(null);

  // No "list all" endpoint for margins either — same as countryCurrencies/commissions above.
  const [margins, setMargins] = useState<MarginRecord[]>(() => (isLive ? [] : marginRecords));

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
    // In static/demo mode there's no backend to refresh from — state already
    // reflects local admin actions, restored from localStorage on load.
    if (!isLive) return;

    // Wipe any demo data left over from before switching into live mode —
    // it must never linger on screen while Live API is active.
    setExchangeRates([]);
    setExchangeRatesLoading(true);
    setExchangeRatesError(null);
    const response = await getAllCountries();
    setExchangeRatesLoading(false);
    if (!response.success) {
      setExchangeRatesError(response.message || "Could not load exchange rates.");
      return;
    }
    // /getAllCountries returns the lighter ExchangeRateItem shape; map it onto
    // the fuller record shape the table renders (missing fields default out).
    setExchangeRates(
      (response.data ?? []).map((item, index) => ({
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
  }, [isLive]);

  const saveExchangeRate = useCallback(
    async (payload: ExchangeRateUpsertPayload) => {
      if (!isLive) {
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
      }
      const response = await updateExchangeRate(payload);
      if (!response.success) {
        setExchangeRatesError(response.message || "Could not save the exchange rate.");
        return false;
      }
      await refreshExchangeRates();
      notify({ title: "Exchange rate updated", message: `${payload.symbol} rate was saved.` });
      return true;
    },
    [isLive, notify, refreshExchangeRates]
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
    if (!isLive) return;

    setServiceCharges([]);
    setServiceChargesLoading(true);
    setServiceChargesError(null);
    const response = await getAllServiceCharges();
    setServiceChargesLoading(false);
    if (!response.success) {
      setServiceChargesError(response.message || "Could not load service charges.");
      return;
    }
    setServiceCharges(response.data ?? []);
  }, [isLive]);

  const saveServiceChargeEntry = useCallback(
    async (payload: ServiceChargeUpsertPayload) => {
      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setServiceCharges((prev) => {
          const id = payload.id || ++localIdCounter;
          const record: ServiceChargeRecord = {
            ...payload,
            id,
            createdDate: prev.find((r) => r.id === id)?.createdDate ?? new Date().toISOString().slice(0, 10),
            updatedDate: new Date().toISOString().slice(0, 10),
          };
          const exists = prev.some((r) => r.id === id);
          return exists ? prev.map((r) => (r.id === id ? record : r)) : [record, ...prev];
        });
        notify({ title: "Service charge saved", message: `${payload.countrySymbol} / ${payload.agentName} was updated.` });
        return true;
      }
      const response = await saveServiceCharge(payload);
      if (!response.success) {
        setServiceChargesError(response.message || "Could not save the service charge.");
        return false;
      }
      await refreshServiceCharges();
      notify({ title: "Service charge saved", message: `${payload.countrySymbol} / ${payload.agentName} was updated.` });
      return true;
    },
    [isLive, notify, refreshServiceCharges]
  );

  const saveCountryCurrency = useCallback(
    async (payload: CountryCurrencyUpsertPayload) => {
      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setCountryCurrencies((prev) => {
          const existing = prev.find((r) => r.isoAlpha2 === payload.isoAlpha2);
          const record: CountryCurrencyRecord = { ...payload, id: existing?.id ?? ++localIdCounter };
          return existing
            ? prev.map((r) => (r.isoAlpha2 === payload.isoAlpha2 ? record : r))
            : [record, ...prev];
        });
        notify({ title: "Country/currency saved", message: `${payload.countryName} (${payload.currencyCode}) was updated.` });
        return true;
      }
      const response = await upsertCountryCurrency(payload);
      if (!response.success || !response.data) return false;
      setCountryCurrencies((prev) => {
        const exists = prev.some((r) => r.id === response.data!.id);
        return exists
          ? prev.map((r) => (r.id === response.data!.id ? response.data! : r))
          : [response.data!, ...prev];
      });
      notify({ title: "Country/currency saved", message: `${payload.countryName} (${payload.currencyCode}) was updated.` });
      return true;
    },
    [isLive, notify]
  );

  const saveCommission = useCallback(
    async (payload: CommissionUpsertPayload) => {
      if (!isLive) {
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
      }
      const response = await upsertPartnerCommission(payload);
      if (!response.success) return false;
      const lookup = await getPartnerCommissions({
        userName: payload.userName,
        destinationCountry: payload.destinationCountry,
        sendCurrency: payload.sendCurrency,
      });
      if (lookup.success) setCommissions(lookup.data ?? []);
      notify({ title: "Partner commission saved", message: `${payload.userName} → ${payload.destinationCountry} commission was updated.` });
      return true;
    },
    [isLive, notify]
  );

  const saveMargin = useCallback(
    async (payload: MarginUpsertPayload) => {
      if (!isLive) {
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
      }
      const response = await addOrUpdateMargin(payload);
      if (!response.success || !response.data) return false;
      setMargins((prev) => {
        const exists = prev.some((r) => r.id === response.data!.id);
        return exists
          ? prev.map((r) => (r.id === response.data!.id ? response.data! : r))
          : [response.data!, ...prev];
      });
      notify({ title: "Margin setup saved", message: `Margin for ${payload.targetPartner} was updated.` });
      return true;
    },
    [isLive, notify]
  );

  const refreshPartnerOfferRates = useCallback(async () => {
    if (!isLive) return;

    setPartnerOfferRates([]);
    setPartnerOfferRatesLoading(true);
    const response = await getAllPendingPartnerOfferRates();
    setPartnerOfferRatesLoading(false);
    if (response.success) setPartnerOfferRates(response.data ?? []);
  }, [isLive]);

  const insertOfferRate = useCallback(
    async (payload: PartnerOfferRateInsertPayload) => {
      setPartnerOfferRateActionError(null);
      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const now = new Date().toISOString();
        setPartnerOfferRates((prev) => [
          {
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
            checkerUser: "",
            createdDateTime: now,
            updatedDateTime: now,
          },
          ...prev,
        ]);
        notify({ title: "Offer rate submitted", message: `${payload.remittancePartner} quote is pending approval.` });
        return true;
      }
      const response = await insertPartnerOfferRate(payload);
      if (!response.success) {
        setPartnerOfferRateActionError(response.message || "Could not submit the offer rate.");
        return false;
      }
      await refreshPartnerOfferRates();
      notify({ title: "Offer rate submitted", message: `${payload.remittancePartner} quote is pending approval.` });
      return true;
    },
    [isLive, notify, refreshPartnerOfferRates]
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

  const confirmOfferRate = useCallback(
    async (payload: PartnerOfferRateActionPayload) => {
      setPartnerOfferRateActionError(null);
      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        resolveOfferRate(payload.uniqueId, payload.checkerUser, "CONFIRMED");
        notify({ title: "Offer rate confirmed", message: `${payload.uniqueId} was approved.` });
        return true;
      }
      const response = await confirmPartnerOfferRate(payload);
      if (!response.success) {
        setPartnerOfferRateActionError(response.message || "Could not confirm the offer rate.");
        return false;
      }
      await refreshPartnerOfferRates();
      notify({ title: "Offer rate confirmed", message: `${payload.uniqueId} was approved.` });
      return true;
    },
    [isLive, notify, refreshPartnerOfferRates, resolveOfferRate]
  );

  const cancelOfferRate = useCallback(
    async (payload: PartnerOfferRateActionPayload) => {
      setPartnerOfferRateActionError(null);
      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        resolveOfferRate(payload.uniqueId, payload.checkerUser, "CANCELLED");
        notify({ title: "Offer rate cancelled", message: `${payload.uniqueId} was cancelled.` });
        return true;
      }
      const response = await cancelPartnerOfferRate(payload);
      if (!response.success) {
        setPartnerOfferRateActionError(response.message || "Could not cancel the offer rate.");
        return false;
      }
      await refreshPartnerOfferRates();
      notify({ title: "Offer rate cancelled", message: `${payload.uniqueId} was cancelled.` });
      return true;
    },
    [isLive, notify, refreshPartnerOfferRates, resolveOfferRate]
  );

  const value = useMemo(
    () => ({
      exchangeRates,
      exchangeRatesLoading,
      exchangeRatesError,
      refreshExchangeRates,
      saveExchangeRate,
      lookupExchangeRate,
      importExchangeRatesFromCsv,
      serviceCharges,
      serviceChargesLoading,
      serviceChargesError,
      refreshServiceCharges,
      saveServiceChargeEntry,
      countryCurrencies,
      saveCountryCurrency,
      commissions,
      saveCommission,
      partnerOfferRates,
      partnerOfferRatesLoading,
      partnerOfferRateActionError,
      refreshPartnerOfferRates,
      insertOfferRate,
      confirmOfferRate,
      cancelOfferRate,
      margins,
      saveMargin,
    }),
    [
      exchangeRates,
      exchangeRatesLoading,
      exchangeRatesError,
      refreshExchangeRates,
      saveExchangeRate,
      lookupExchangeRate,
      importExchangeRatesFromCsv,
      serviceCharges,
      serviceChargesLoading,
      serviceChargesError,
      refreshServiceCharges,
      saveServiceChargeEntry,
      countryCurrencies,
      saveCountryCurrency,
      commissions,
      saveCommission,
      partnerOfferRates,
      partnerOfferRatesLoading,
      partnerOfferRateActionError,
      refreshPartnerOfferRates,
      insertOfferRate,
      confirmOfferRate,
      cancelOfferRate,
      margins,
      saveMargin,
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
