"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Button from "./Button";
import SelectField from "./SelectField";
import TextField from "./TextField";
import RadioPill from "./RadioPill";
import { usePartners } from "@/contexts/PartnersContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useDataMode } from "@/contexts/DataModeContext";
import {
  obtainRemittancePayoutPartnerConfiguration,
  updateRemittancePayoutPartnerConfiguration,
} from "@/lib/partnersApi";
import { emptyPayoutPartnerConfigPayload, type PayoutPartnerConfigPayload } from "@/data/payoutConfigData";

// Edit-only re-entry point for the same payout configuration Create New
// Partner's step 3 sets up initially — an admin comes back here repeatedly
// to adjust rates/limits long after the partner was created. Payout method
// is exactly two booleans (cash vs. account credit), each with its own
// commission rate and limit — confirmed against the Swagger doc.
export default function PayoutConfigurationPanel() {
  const { entries } = usePartners();
  const { notify } = useNotifications();
  const { isLive } = useDataMode();

  const partnerOptions = entries.map((p) => p.partnerName);
  const [selectedPartner, setSelectedPartner] = useState("");

  useEffect(() => {
    if (partnerOptions.length === 0) return;
    setSelectedPartner((prev) => (prev ? prev : partnerOptions[0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerOptions.length]);

  const [form, setForm] = useState<PayoutPartnerConfigPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleLoad(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedPartner) return;
    setLoadError(null);
    setSaveError(null);
    setLoading(true);

    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setForm(emptyPayoutPartnerConfigPayload(selectedPartner));
      setLoading(false);
      return;
    }

    const response = await obtainRemittancePayoutPartnerConfiguration(selectedPartner);
    setLoading(false);
    if (!response.success) {
      setLoadError(response.message || "Could not load this partner's payout configuration.");
      setForm(null);
      return;
    }
    setForm(response.data ?? emptyPayoutPartnerConfigPayload(selectedPartner));
  }

  function updateField<K extends keyof PayoutPartnerConfigPayload>(field: K, value: PayoutPartnerConfigPayload[K]) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  // Payout method is exclusive — a partner is configured for cash OR
  // account credit, never both — so selecting one clears the other rather
  // than toggling independently.
  function selectPayoutMethod(method: "cash" | "account") {
    setForm((prev) =>
      prev ? { ...prev, allowCash: method === "cash", allowAccountCredit: method === "account" } : prev
    );
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaveError(null);
    setSaving(true);

    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      notify({
        title: "Payout configuration saved",
        message: `${form.remittancePartnerUserName}'s payout configuration was updated.`,
      });
      setSaving(false);
      return;
    }

    const response = await updateRemittancePayoutPartnerConfiguration(form);
    setSaving(false);
    if (!response.success) {
      setSaveError(response.message || "Could not save the payout configuration.");
      return;
    }
    notify({
      title: "Payout configuration saved",
      message: `${form.remittancePartnerUserName}'s payout configuration was updated.`,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Payout Configuration</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — edit an existing partner&apos;s payout setup.
          </p>
        </div>
        <form onSubmit={handleLoad} className="flex flex-wrap items-end gap-3 bg-panel p-6 sm:p-8">
          {partnerOptions.length > 0 ? (
            <div className="w-full max-w-xs">
              <SelectField
                label="Partner:"
                required
                options={partnerOptions}
                defaultValue={partnerOptions[0]}
                value={selectedPartner}
                onChange={setSelectedPartner}
              />
            </div>
          ) : (
            <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-muted">
              No partners found — create one under Create New Partner first.
            </p>
          )}
          {partnerOptions.length > 0 && (
            <Button type="submit" loading={loading} icon={<Search size={14} />}>
              {loading ? "Loading..." : "Load Configuration"}
            </Button>
          )}
        </form>
        {loadError && (
          <p className="mx-6 mb-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 sm:mx-8">{loadError}</p>
        )}
      </div>

      {form && (
        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-bold text-heading">{form.remittancePartnerUserName}</h2>
          </div>
          <form onSubmit={handleSave} className="flex flex-col gap-6 bg-panel p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border border-border p-4 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <RadioPill checked={form.allowCash} onSelect={() => selectPayoutMethod("cash")} label="Allow Cash Payout" />
              </div>
              <TextField
                label="Cash Commission Rate:"
                value={String(form.cashPayoutCommissionRate)}
                onChange={(v) => updateField("cashPayoutCommissionRate", Number(v) || 0)}
              />
              <TextField
                label="Cash Limit:"
                value={String(form.cashLimit)}
                onChange={(v) => updateField("cashLimit", Number(v) || 0)}
              />
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border border-border p-4 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <RadioPill
                  checked={form.allowAccountCredit}
                  onSelect={() => selectPayoutMethod("account")}
                  label="Allow Account Credit Payout"
                />
              </div>
              <TextField
                label="Account Commission Rate:"
                value={String(form.accountPayoutCommissionRate)}
                onChange={(v) => updateField("accountPayoutCommissionRate", Number(v) || 0)}
              />
              <TextField
                label="Account Limit:"
                value={String(form.accountLimit)}
                onChange={(v) => updateField("accountLimit", Number(v) || 0)}
              />
            </div>

            <div className="border-t border-border pt-5">
              {saveError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>}
              <Button type="submit" loading={saving}>
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
