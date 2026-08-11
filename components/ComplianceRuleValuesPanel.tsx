"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Search, X } from "lucide-react";
import { useComplianceRules } from "@/contexts/ComplianceRuleContext";
import { usePartners } from "@/contexts/PartnersContext";
import { useDataMode } from "@/contexts/DataModeContext";
import RadioPill from "./RadioPill";
import Button from "./Button";
import {
  complianceRuleDirections,
  emptyComplianceRuleValueLookupPayload,
  emptyComplianceRuleValuePayload,
  type ComplianceRule,
  type ComplianceRuleDirection,
  type ComplianceRuleValueLookupPayload,
  type ComplianceRuleValuePayload,
  type NormalizedComplianceRuleValue,
} from "@/data/complianceRuleData";

const inputClass =
  "rounded-lg border border-border bg-panel px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";
const selectClass = `${inputClass} appearance-none`;

type QueryMode = "specific" | "by-country";

export default function ComplianceRuleValuesPanel() {
  const { isLive } = useDataMode();
  const {
    fetchRulesByDirection,
    fetchAllActiveRules,
    ruleValues,
    ruleValuesLoading,
    ruleValuesError,
    ruleValueSaving,
    searchRuleValuesSpecific,
    saveRuleValue,
  } = useComplianceRules();
  const { entries: partners } = usePartners();
  const agentOptions = partners.map((p) => p.partnerName);

  const [queryMode, setQueryMode] = useState<QueryMode>("specific");
  const [lookupForm, setLookupForm] = useState<ComplianceRuleValueLookupPayload>(
    emptyComplianceRuleValueLookupPayload("SEND")
  );
  const [lookupRules, setLookupRules] = useState<ComplianceRule[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  // Only set while editing — the direction of the row being edited, kept
  // separately so it still displays correctly even if that rule has since
  // been deactivated and dropped out of formRules.
  const [editingDirection, setEditingDirection] = useState<ComplianceRuleDirection | null>(null);
  const [form, setForm] = useState<ComplianceRuleValuePayload>(emptyComplianceRuleValuePayload());
  const [formRules, setFormRules] = useState<ComplianceRule[]>([]);

  // The add/update request has no direction field — it's presumed inherited
  // from the selected rule (unconfirmed with backend), so it's shown
  // read-only rather than editable.
  const selectedFormRuleDirection =
    formRules.find((r) => r.identifier === form.complianceRuleIdentifier)?.direction ?? null;
  const displayedDirection = editingId !== null ? editingDirection : selectedFormRuleDirection;

  // Rule dropdown for the lookup form is scoped to whichever direction is
  // selected there, since the lookup itself requires a direction.
  useEffect(() => {
    let cancelled = false;
    fetchRulesByDirection(lookupForm.direction).then((rules) => {
      if (!cancelled) setLookupRules(rules);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookupForm.direction, isLive]);

  // Rule dropdown for the Add/Edit form has no direction of its own to scope
  // by — the request has no direction field (see the open question in
  // data/complianceRuleData.ts) — so it lists rules across both directions,
  // labeled so they're still distinguishable.
  useEffect(() => {
    let cancelled = false;
    fetchAllActiveRules().then((rules) => {
      if (!cancelled) setFormRules(rules);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  function updateLookupField<K extends keyof ComplianceRuleValueLookupPayload>(
    field: K,
    value: ComplianceRuleValueLookupPayload[K]
  ) {
    setLookupForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateField<K extends keyof ComplianceRuleValuePayload>(
    field: K,
    value: ComplianceRuleValuePayload[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    // "By country" is stubbed, not wired — see the toggle below. Only
    // "Specific tuple" can actually be submitted right now.
    if (queryMode !== "specific") return;
    setSearching(true);
    setSearched(true);
    await searchRuleValuesSpecific(lookupForm);
    setSearching(false);
  }

  function startEdit(entry: NormalizedComplianceRuleValue) {
    setEditingId(entry.id);
    setEditingDirection(entry.direction);
    setForm({
      id: entry.id,
      complianceRuleIdentifier: entry.complianceRuleIdentifier,
      value: entry.value,
      country: entry.country,
      agent: entry.agent,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingDirection(null);
    setForm(emptyComplianceRuleValuePayload());
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const isNew = editingId === null;
    const success = await saveRuleValue(form, isNew);
    if (success) cancelEdit();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Compliance Rule Values</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — country/agent-scoped values attached to a
            compliance rule.
          </p>
        </div>

        <div className="flex flex-col gap-5 bg-panel p-6 sm:p-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-6">
              <RadioPill
                label="Specific tuple"
                checked={queryMode === "specific"}
                onSelect={() => setQueryMode("specific")}
              />
              <div className="flex items-center gap-2">
                <RadioPill
                  label="By country"
                  checked={queryMode === "by-country"}
                  onSelect={() => setQueryMode("by-country")}
                  disabled
                />
                <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Coming soon
                </span>
              </div>
            </div>
            <p className="text-xs text-muted">
              "By country" calls a separate endpoint (<code>obtainComplianceRuleValueSpecificCountry</code>)
              whose documented request is identical to "Specific tuple" — what it actually does differently
              (e.g. agent-optional/wildcard matching) is unconfirmed with backend. Disabled until that's
              clarified, rather than shipping two forms that look the same but may return different results.
            </p>
          </div>

          {ruleValuesError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{ruleValuesError}</p>
          )}

          <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Direction</label>
              <select
                value={lookupForm.direction}
                onChange={(event) =>
                  updateLookupField("direction", event.target.value as ComplianceRuleDirection)
                }
                className={selectClass}
              >
                {complianceRuleDirections.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Rule</label>
              <select
                required
                value={lookupForm.complianceRuleIdentifier}
                onChange={(event) => updateLookupField("complianceRuleIdentifier", event.target.value)}
                className={selectClass}
                disabled={lookupRules.length === 0}
              >
                <option value="">{lookupRules.length ? "-- Select --" : "No active rules"}</option>
                {lookupRules.map((rule) => (
                  <option key={rule.identifier} value={rule.identifier}>
                    {rule.identifier} — {rule.ruleName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Country</label>
              <input
                required
                value={lookupForm.country}
                onChange={(event) => updateLookupField("country", event.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Agent</label>
              <select
                required
                value={lookupForm.agent}
                onChange={(event) => updateLookupField("agent", event.target.value)}
                className={selectClass}
                disabled={agentOptions.length === 0}
              >
                <option value="">{agentOptions.length ? "-- Select --" : "No partners found"}</option>
                {agentOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" loading={searching} icon={<Search size={14} />}>
                {searching ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                <th className="px-4 py-3">Rule Identifier</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ruleValuesLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                    Loading compliance rule values...
                  </td>
                </tr>
              )}

              {!ruleValuesLoading && !searched && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                    Search above to see matching rule values.
                  </td>
                </tr>
              )}

              {!ruleValuesLoading && searched && ruleValues.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                    No rule values matched that search.
                  </td>
                </tr>
              )}

              {!ruleValuesLoading &&
                ruleValues.map((entry) => (
                  <tr key={entry.id} className="border-b border-border bg-panel last:border-b-0">
                    <td className="px-4 py-3 font-medium text-heading">{entry.complianceRuleIdentifier}</td>
                    <td className="px-4 py-3 text-heading/80">{entry.value}</td>
                    <td className="px-4 py-3 text-heading/80">{entry.country}</td>
                    <td className="px-4 py-3 text-heading/80">{entry.agent}</td>
                    <td className="px-4 py-3 text-heading/80">{entry.direction}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(entry)}
                          icon={<Pencil size={12} />}
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-heading">
            {editingId === null ? "Add Rule Value" : "Update Rule Value"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-panel p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Rule</label>
              <select
                required
                disabled={editingId !== null || formRules.length === 0}
                value={form.complianceRuleIdentifier}
                onChange={(event) => updateField("complianceRuleIdentifier", event.target.value)}
                className={`${selectClass} disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted`}
              >
                <option value="">{formRules.length ? "-- Select --" : "No active rules"}</option>
                {formRules.map((rule) => (
                  <option key={rule.identifier} value={rule.identifier}>
                    {rule.identifier} — {rule.ruleName} ({rule.direction})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Direction</label>
              <p className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-heading/70">
                {displayedDirection ?? "— select a rule —"}
              </p>
              <p className="text-xs text-muted">
                Not part of the request — inherited from the selected rule (unconfirmed with backend), shown
                read-only.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Value</label>
              <input
                required
                value={form.value}
                onChange={(event) => updateField("value", event.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Country</label>
              <input
                required
                value={form.country}
                onChange={(event) => updateField("country", event.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Agent</label>
              <select
                required
                value={form.agent}
                onChange={(event) => updateField("agent", event.target.value)}
                className={selectClass}
                disabled={agentOptions.length === 0}
              >
                <option value="">{agentOptions.length ? "-- Select --" : "No partners found"}</option>
                {agentOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              loading={ruleValueSaving}
              icon={editingId === null ? <Plus size={15} /> : undefined}
            >
              {ruleValueSaving ? "Saving..." : editingId === null ? "Add Value" : "Update Value"}
            </Button>
            {editingId !== null && (
              <Button type="button" variant="secondary" onClick={cancelEdit} icon={<X size={15} />}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
