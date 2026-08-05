"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDataMode } from "./DataModeContext";
import { useNotifications } from "./NotificationsContext";
import { loadState, saveState } from "@/lib/persist";
import {
  getAllCountries,
  updateExchangeRate,
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

  const [exchangeRates, setExchangeRates] = useState<ExchangeRateRecord[]>(exchangeRateRecords);
  const [exchangeRatesLoading, setExchangeRatesLoading] = useState(false);
  const [exchangeRatesError, setExchangeRatesError] = useState<string | null>(null);

  const [serviceCharges, setServiceCharges] = useState<ServiceChargeRecord[]>(serviceChargeRecords);
  const [serviceChargesLoading, setServiceChargesLoading] = useState(false);
  const [serviceChargesError, setServiceChargesError] = useState<string | null>(null);

  const [countryCurrencies, setCountryCurrencies] = useState<CountryCurrencyRecord[]>(countryCurrencyRecords);
  const [commissions, setCommissions] = useState<CommissionRecord[]>(commissionRecords);

  const [partnerOfferRates, setPartnerOfferRates] = useState<PartnerOfferRateRecord[]>(partnerOfferRateRecords);
  const [partnerOfferRatesLoading, setPartnerOfferRatesLoading] = useState(false);
  const [partnerOfferRateActionError, setPartnerOfferRateActionError] = useState<string | null>(null);

  const [margins, setMargins] = useState<MarginRecord[]>(marginRecords);

  // Restore any admin-made changes from a previous session so a page refresh
  // doesn't silently drop them back to the seed data.
  useEffect(() => {
    const saved = loadState<PersistedRatesState>(STORAGE_KEY);
    if (!saved) return;
    setExchangeRates(saved.exchangeRates);
    setServiceCharges(saved.serviceCharges);
    setCountryCurrencies(saved.countryCurrencies);
    setCommissions(saved.commissions);
    setPartnerOfferRates(saved.partnerOfferRates);
    setMargins(saved.margins);
  }, []);

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

  const refreshServiceCharges = useCallback(async () => {
    if (!isLive) return;

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
