"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDataMode } from "./DataModeContext";
import { useNotifications } from "./NotificationsContext";
import { loadState, saveState } from "@/lib/persist";
import {
  addComplianceRule,
  updateComplianceRule,
  deleteComplianceRule,
  obtainComplianceRule,
  addComplianceRuleValue,
  updateComplianceRuleValue,
  obtainComplianceRuleValueSpecific,
  obtainComplianceRuleValueSpecificCountry,
} from "@/lib/complianceRuleApi";
import {
  complianceRuleRecords,
  complianceRuleValueRecords,
  normalizeRuleValue,
  type ComplianceRule,
  type ComplianceRuleDirection,
  type ComplianceRulePayload,
  type ComplianceRuleValueCountryLookupPayload,
  type ComplianceRuleValueLookupPayload,
  type ComplianceRuleValuePayload,
  type NormalizedComplianceRuleValue,
} from "@/data/complianceRuleData";

interface ComplianceRuleContextValue {
  direction: ComplianceRuleDirection;
  setDirection: (direction: ComplianceRuleDirection) => void;
  rules: ComplianceRule[];
  rulesLoading: boolean;
  rulesError: string | null;
  refreshRules: () => Promise<void>;
  saving: boolean;
  saveRule: (payload: ComplianceRulePayload, isNew: boolean) => Promise<boolean>;
  removeRule: (identifier: string) => Promise<boolean>;
  // Rule Values (Screen B) reuse the same rule set for their identifier
  // dropdown, scoped independently of the Screen A direction toggle above.
  fetchRulesByDirection: (direction: ComplianceRuleDirection) => Promise<ComplianceRule[]>;
  fetchAllActiveRules: () => Promise<ComplianceRule[]>;

  ruleValues: NormalizedComplianceRuleValue[];
  ruleValuesLoading: boolean;
  ruleValuesError: string | null;
  ruleValueSaving: boolean;
  searchRuleValuesSpecific: (payload: ComplianceRuleValueLookupPayload) => Promise<boolean>;
  searchRuleValuesByCountry: (payload: ComplianceRuleValueCountryLookupPayload) => Promise<boolean>;
  saveRuleValue: (payload: ComplianceRuleValuePayload, isNew: boolean) => Promise<boolean>;
}

const ComplianceRuleContext = createContext<ComplianceRuleContextValue | null>(null);

const STORAGE_KEY = "zio-compliance-rules-state";
const VALUES_STORAGE_KEY = "zio-compliance-rule-values-state";

let localIdCounter = 9000;
let localValueIdCounter = 9500;

export function ComplianceRuleProvider({ children }: { children: React.ReactNode }) {
  const { isLive } = useDataMode();
  const { notify } = useNotifications();

  const [direction, setDirection] = useState<ComplianceRuleDirection>("SEND");
  // Seed data is demo-only — a live session must never render it, not even
  // for the instant before the first live fetch resolves.
  const [allRules, setAllRules] = useState<ComplianceRule[]>(() =>
    isLive ? [] : complianceRuleRecords
  );
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Two lists in demo mode: `demoRuleValues` is the full persisted dataset
  // (seed + anything saved this session); `ruleValues` is just what's
  // currently displayed (the last search's results). Searching must filter
  // FROM the former INTO the latter — filtering `ruleValues` in place would
  // permanently discard whatever didn't match the most recent search.
  const [demoRuleValues, setDemoRuleValues] = useState<NormalizedComplianceRuleValue[]>(
    complianceRuleValueRecords
  );
  const [ruleValues, setRuleValues] = useState<NormalizedComplianceRuleValue[]>(() =>
    isLive ? [] : complianceRuleValueRecords
  );
  const [ruleValuesLoading, setRuleValuesLoading] = useState(false);
  const [ruleValuesError, setRuleValuesError] = useState<string | null>(null);
  const [ruleValueSaving, setRuleValueSaving] = useState(false);

  // Restore any admin-made changes from a previous session so a page refresh
  // doesn't silently drop them back to the seed data. Only meaningful in demo
  // mode — a live session gets its records from the API.
  useEffect(() => {
    if (isLive) return;
    const savedRules = loadState<ComplianceRule[]>(STORAGE_KEY);
    if (savedRules) setAllRules(savedRules);
    const savedValues = loadState<NormalizedComplianceRuleValue[]>(VALUES_STORAGE_KEY);
    if (savedValues) {
      setDemoRuleValues(savedValues);
      setRuleValues(savedValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skipNextSave = useRef(true);
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveState<ComplianceRule[]>(STORAGE_KEY, allRules);
    saveState<NormalizedComplianceRuleValue[]>(VALUES_STORAGE_KEY, demoRuleValues);
  }, [allRules, demoRuleValues]);

  const refreshRules = useCallback(async () => {
    if (!isLive) return;

    // Wipe any demo data left over from before switching into live mode.
    setAllRules([]);
    setRulesLoading(true);
    setRulesError(null);
    const response = await obtainComplianceRule(direction);
    setRulesLoading(false);
    if (!response.success) {
      setRulesError(response.message || "Could not load compliance rules.");
      return;
    }
    setAllRules(response.data ?? []);
  }, [isLive, direction]);

  // Re-fetch whenever the direction toggle changes, in live mode.
  useEffect(() => {
    if (isLive) refreshRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, isLive]);

  const saveRule = useCallback(
    async (payload: ComplianceRulePayload, isNew: boolean) => {
      setSaving(true);
      setRulesError(null);

      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setAllRules((prev) => {
          const existing = prev.find((r) => r.identifier === payload.identifier);
          const record: ComplianceRule = {
            ...payload,
            id: existing?.id ?? ++localIdCounter,
            deleted: false,
          };
          return existing
            ? prev.map((r) => (r.identifier === payload.identifier ? record : r))
            : [record, ...prev];
        });
        setSaving(false);
        notify({
          title: isNew ? "Compliance rule added" : "Compliance rule updated",
          message: `${payload.ruleName} (${payload.identifier}) was saved.`,
        });
        return true;
      }

      const response = isNew ? await addComplianceRule(payload) : await updateComplianceRule(payload);
      setSaving(false);
      if (!response.success || !response.data) {
        setRulesError(response.message || "Could not save the compliance rule.");
        return false;
      }
      await refreshRules();
      notify({
        title: isNew ? "Compliance rule added" : "Compliance rule updated",
        message: `${payload.ruleName} (${payload.identifier}) was saved.`,
      });
      return true;
    },
    [isLive, notify, refreshRules]
  );

  const removeRule = useCallback(
    async (identifier: string) => {
      setRulesError(null);

      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        // Soft-delete, matching the real endpoint — flip the flag rather
        // than dropping the row, so it still shows up as "Inactive."
        setAllRules((prev) =>
          prev.map((r) => (r.identifier === identifier ? { ...r, deleted: true } : r))
        );
        notify({ title: "Compliance rule deactivated", message: `${identifier} was deactivated.` });
        return true;
      }

      const response = await deleteComplianceRule(identifier);
      if (!response.success) {
        setRulesError(response.message || "Could not deactivate the compliance rule.");
        return false;
      }
      await refreshRules();
      notify({ title: "Compliance rule deactivated", message: `${identifier} was deactivated.` });
      return true;
    },
    [isLive, notify, refreshRules]
  );

  // Standalone lookups for the Rule Value identifier dropdown — deliberately
  // NOT tied to the direction toggle/allRules state above, so Screen B can
  // query rules independently of whatever Screen A is currently showing.
  const fetchRulesByDirection = useCallback(
    async (dir: ComplianceRuleDirection): Promise<ComplianceRule[]> => {
      if (!isLive) {
        return allRules.filter((r) => r.direction === dir && !r.deleted);
      }
      const response = await obtainComplianceRule(dir);
      return response.success ? (response.data ?? []).filter((r) => !r.deleted) : [];
    },
    [isLive, allRules]
  );

  const fetchAllActiveRules = useCallback(async (): Promise<ComplianceRule[]> => {
    const [sendRules, receiveRules] = await Promise.all([
      fetchRulesByDirection("SEND"),
      fetchRulesByDirection("RECEIVE"),
    ]);
    return [...sendRules, ...receiveRules];
  }, [fetchRulesByDirection]);

  function matchesLookup(v: NormalizedComplianceRuleValue, payload: ComplianceRuleValueLookupPayload) {
    return (
      v.complianceRuleIdentifier === payload.complianceRuleIdentifier &&
      v.country.toLowerCase() === payload.country.toLowerCase() &&
      v.agent.toLowerCase() === payload.agent.toLowerCase() &&
      v.direction === payload.direction
    );
  }

  const searchRuleValuesSpecific = useCallback(
    async (payload: ComplianceRuleValueLookupPayload) => {
      setRuleValuesError(null);
      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        // Filter FROM the persisted demo dataset INTO the displayed list —
        // never filter `ruleValues` itself, or the next search would have
        // nothing left to search from.
        setRuleValues(demoRuleValues.filter((v) => matchesLookup(v, payload)));
        return true;
      }
      setRuleValuesLoading(true);
      const response = await obtainComplianceRuleValueSpecific(payload);
      setRuleValuesLoading(false);
      if (!response.success) {
        setRuleValuesError(response.message || "Could not look up compliance rule values.");
        return false;
      }
      setRuleValues((response.data ?? []).map(normalizeRuleValue));
      return true;
    },
    [isLive, demoRuleValues]
  );

  const searchRuleValuesByCountry = useCallback(
    async (payload: ComplianceRuleValueCountryLookupPayload) => {
      setRuleValuesError(null);
      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        setRuleValues(demoRuleValues.filter((v) => matchesLookup(v, payload)));
        return true;
      }
      setRuleValuesLoading(true);
      const response = await obtainComplianceRuleValueSpecificCountry(payload);
      setRuleValuesLoading(false);
      if (!response.success) {
        setRuleValuesError(response.message || "Could not look up compliance rule values.");
        return false;
      }
      setRuleValues((response.data ?? []).map(normalizeRuleValue));
      return true;
    },
    [isLive, demoRuleValues]
  );

  const saveRuleValue = useCallback(
    async (payload: ComplianceRuleValuePayload, isNew: boolean) => {
      setRuleValueSaving(true);
      setRuleValuesError(null);

      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const id = payload.id || ++localValueIdCounter;
        const existing = demoRuleValues.find((v) => v.id === id);
        const record: NormalizedComplianceRuleValue = {
          id,
          complianceRuleIdentifier: payload.complianceRuleIdentifier,
          // Direction isn't in the request — carried over from the
          // existing row on edit, or left at "SEND" as an unconfirmed
          // placeholder for a genuinely new one (see the open question in
          // data/complianceRuleData.ts).
          direction: existing?.direction ?? "SEND",
          value: payload.value,
          country: payload.country,
          agent: payload.agent,
        };
        const upsert = (prev: NormalizedComplianceRuleValue[]) =>
          existing ? prev.map((v) => (v.id === id ? record : v)) : [record, ...prev];
        setDemoRuleValues(upsert);
        // Show the saved row immediately, regardless of the currently
        // displayed search results.
        setRuleValues(upsert);
        setRuleValueSaving(false);
        notify({
          title: isNew ? "Compliance rule value added" : "Compliance rule value updated",
          message: `${payload.complianceRuleIdentifier} / ${payload.country} / ${payload.agent} was saved.`,
        });
        return true;
      }

      const response = isNew ? await addComplianceRuleValue(payload) : await updateComplianceRuleValue(payload);
      setRuleValueSaving(false);
      if (!response.success || !response.data) {
        setRuleValuesError(response.message || "Could not save the compliance rule value.");
        return false;
      }
      const saved = normalizeRuleValue(response.data);
      setRuleValues((prev) => {
        const exists = prev.some((v) => v.id === saved.id);
        return exists ? prev.map((v) => (v.id === saved.id ? saved : v)) : [saved, ...prev];
      });
      notify({
        title: isNew ? "Compliance rule value added" : "Compliance rule value updated",
        message: `${payload.complianceRuleIdentifier} / ${payload.country} / ${payload.agent} was saved.`,
      });
      return true;
    },
    [isLive, notify, demoRuleValues]
  );

  // Demo mode has no server-side direction filter — filter the shared list
  // client-side to mirror what obtainComplianceRule(direction) does live.
  // Deactivated rules stay visible (with an Inactive status) rather than
  // disappearing — matching the real soft-delete, which doesn't remove them.
  const rules = useMemo(
    () => (isLive ? allRules : allRules.filter((r) => r.direction === direction)),
    [allRules, direction, isLive]
  );

  const value = useMemo(
    () => ({
      direction,
      setDirection,
      rules,
      rulesLoading,
      rulesError,
      refreshRules,
      saving,
      saveRule,
      removeRule,
      fetchRulesByDirection,
      fetchAllActiveRules,
      ruleValues,
      ruleValuesLoading,
      ruleValuesError,
      ruleValueSaving,
      searchRuleValuesSpecific,
      searchRuleValuesByCountry,
      saveRuleValue,
    }),
    [
      direction,
      rules,
      rulesLoading,
      rulesError,
      refreshRules,
      saving,
      saveRule,
      removeRule,
      fetchRulesByDirection,
      fetchAllActiveRules,
      ruleValues,
      ruleValuesLoading,
      ruleValuesError,
      ruleValueSaving,
      searchRuleValuesSpecific,
      searchRuleValuesByCountry,
      saveRuleValue,
    ]
  );

  return <ComplianceRuleContext.Provider value={value}>{children}</ComplianceRuleContext.Provider>;
}

export function useComplianceRules() {
  const ctx = useContext(ComplianceRuleContext);
  if (!ctx) {
    throw new Error("useComplianceRules must be used within a ComplianceRuleProvider");
  }
  return ctx;
}
