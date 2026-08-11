"use client";

import { useEffect, useState } from "react";
import { Ban, Pencil, Plus, RefreshCw, X } from "lucide-react";
import { useComplianceRules } from "@/contexts/ComplianceRuleContext";
import { useDataMode } from "@/contexts/DataModeContext";
import RadioPill from "./RadioPill";
import Button from "./Button";
import {
  complianceRuleDirections,
  emptyComplianceRulePayload,
  ruleStatusLabel,
  type ComplianceRule,
} from "@/data/complianceRuleData";

const inputClass =
  "rounded-lg border border-border bg-panel px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

export default function ComplianceRulesSetupPanel() {
  const { isLive } = useDataMode();
  const {
    direction,
    setDirection,
    rules,
    rulesLoading,
    rulesError,
    refreshRules,
    saving,
    saveRule,
    removeRule,
  } = useComplianceRules();

  const [editingIdentifier, setEditingIdentifier] = useState<string | null>(null);
  const [form, setForm] = useState(emptyComplianceRulePayload(direction));
  const [deletingIdentifier, setDeletingIdentifier] = useState<string | null>(null);

  useEffect(() => {
    setForm(emptyComplianceRulePayload(direction));
    setEditingIdentifier(null);
  }, [direction]);

  function updateField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(rule: ComplianceRule) {
    setEditingIdentifier(rule.identifier);
    setForm({
      ruleName: rule.ruleName,
      identifier: rule.identifier,
      criteria: rule.criteria,
      dataType: rule.dataType,
      field: rule.field,
      direction: rule.direction,
    });
  }

  function cancelEdit() {
    setEditingIdentifier(null);
    setForm(emptyComplianceRulePayload(direction));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const isNew = editingIdentifier === null;
    const success = await saveRule(form, isNew);
    if (success) cancelEdit();
  }

  async function handleDeactivate(identifier: string) {
    setDeletingIdentifier(identifier);
    await removeRule(identifier);
    setDeletingIdentifier(null);
    if (editingIdentifier === identifier) cancelEdit();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-heading">Compliance Rules Setup</h1>
            <p className="mt-0.5 text-sm text-muted">
              {isLive ? "Live remittance API" : "Static demo data"} — rules evaluated per transfer
              direction.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshRules}
            disabled={rulesLoading}
            icon={<RefreshCw size={13} className={rulesLoading ? "animate-spin" : undefined} />}
          >
            Refresh
          </Button>
        </div>

        <div className="flex flex-col gap-6 bg-panel p-6 sm:p-8">
          <div className="flex items-center gap-6">
            {complianceRuleDirections.map((option) => (
              <RadioPill
                key={option}
                label={option}
                checked={direction === option}
                onSelect={() => setDirection(option)}
              />
            ))}
          </div>

          {rulesError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{rulesError}</p>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Rule Name</label>
              <input
                required
                value={form.ruleName}
                onChange={(event) => updateField("ruleName", event.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Identifier</label>
              <input
                required
                disabled={editingIdentifier !== null}
                value={form.identifier}
                onChange={(event) => updateField("identifier", event.target.value)}
                className={`${inputClass} disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Criteria</label>
              <input
                required
                value={form.criteria}
                onChange={(event) => updateField("criteria", event.target.value)}
                placeholder="e.g. amount > 1000000"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Field</label>
              <input
                required
                value={form.field}
                onChange={(event) => updateField("field", event.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Data Type</label>
              <input
                required
                value={form.dataType}
                onChange={(event) => updateField("dataType", event.target.value)}
                placeholder="e.g. NUMBER, STRING"
                className={inputClass}
              />
            </div>

            <div className="flex items-end gap-3 sm:col-span-2">
              <Button type="submit" loading={saving} icon={editingIdentifier ? undefined : <Plus size={15} />}>
                {saving ? "Saving..." : editingIdentifier ? "Update Rule" : "Add Rule"}
              </Button>
              {editingIdentifier && (
                <Button type="button" variant="secondary" onClick={cancelEdit} icon={<X size={15} />}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                <th className="px-4 py-3">Rule Name</th>
                <th className="px-4 py-3">Identifier</th>
                <th className="px-4 py-3">Criteria</th>
                <th className="px-4 py-3">Field</th>
                <th className="px-4 py-3">Data Type</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rulesLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                    Loading compliance rules...
                  </td>
                </tr>
              )}

              {!rulesLoading && rules.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                    No {direction.toLowerCase()} rules configured yet.
                  </td>
                </tr>
              )}

              {!rulesLoading &&
                rules.map((rule) => {
                  const status = ruleStatusLabel(rule.deleted);
                  return (
                    <tr key={rule.identifier} className="border-b border-border bg-panel last:border-b-0">
                      <td className="px-4 py-3 font-medium text-heading">{rule.ruleName}</td>
                      <td className="px-4 py-3 text-heading/80">{rule.identifier}</td>
                      <td className="px-4 py-3 text-heading/80">{rule.criteria}</td>
                      <td className="px-4 py-3 text-heading/80">{rule.field}</td>
                      <td className="px-4 py-3 text-heading/80">{rule.dataType}</td>
                      <td className="px-4 py-3 text-heading/80">{rule.direction}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            status === "Active"
                              ? "bg-brand-green-light text-brand-green-dark"
                              : "bg-surface text-muted"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(rule)}
                            icon={<Pencil size={12} />}
                          >
                            Edit
                          </Button>
                          {status === "Active" ? (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeactivate(rule.identifier)}
                              loading={deletingIdentifier === rule.identifier}
                              icon={<Ban size={12} />}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <span className="px-2 py-1.5 text-xs text-muted">Inactive</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
