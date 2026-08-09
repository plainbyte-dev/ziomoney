"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";
import TextField from "./TextField";
import SelectField from "./SelectField";
import Spinner from "./Spinner";
import {
  beneficiaryRecords,
  relationshipOptions,
  type AddBeneficiaryPayload,
  type Beneficiary,
} from "@/data/beneficiaryData";
import { beneficiaryCountryOptions } from "@/data/staticData";
import { addBeneficiary, deleteBeneficiary, listBeneficiaries } from "@/lib/beneficiaryApi";

const emptyForm: AddBeneficiaryPayload = {
  customerId: "",
  fullName: "",
  accountNumber: "",
  bankName: "",
  country: beneficiaryCountryOptions[0],
  phone: "",
  email: "",
  bankBranch: "",
  relationship: relationshipOptions[0],
};

let demoIdCounter = 1000;

export default function BeneficiariesPanel() {
  const { isLive } = useDataMode();

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [form, setForm] = useState<AddBeneficiaryPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    setListError(null);

    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setBeneficiaries(beneficiaryRecords);
      setLoading(false);
      return;
    }

    const response = await listBeneficiaries();
    setLoading(false);
    if (!response.success) {
      setListError(response.message || "Could not load beneficiaries.");
      return;
    }
    setBeneficiaries(response.data ?? []);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  function updateField<K extends keyof AddBeneficiaryPayload>(key: K, value: AddBeneficiaryPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);

    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const now = new Date().toISOString();
      const { customerId, ...beneficiaryFields } = form;
      const record: Beneficiary = {
        id: ++demoIdCounter,
        username: customerId,
        ...beneficiaryFields,
        createdAt: now,
        updatedAt: now,
      };
      setBeneficiaries((prev) => [record, ...prev]);
      setForm(emptyForm);
      setSaving(false);
      return;
    }

    const response = await addBeneficiary(form);
    setSaving(false);
    if (!response.success) {
      setSaveError(response.message || "Could not add beneficiary.");
      return;
    }
    setForm(emptyForm);
    refresh();
  }

  async function handleDelete(id: number) {
    setDeletingId(id);

    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
      setDeletingId(null);
      return;
    }

    const response = await deleteBeneficiary(id);
    setDeletingId(null);
    if (!response.success) {
      setListError(response.message || "Could not delete beneficiary.");
      return;
    }
    setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Add Beneficiary</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — manage remittance beneficiaries.
          </p>
        </div>

        <form onSubmit={handleAdd} className="bg-panel p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
            <TextField label="Customer ID:" required value={form.customerId} onChange={(v) => updateField("customerId", v)} />
            <TextField label="Full Name:" required value={form.fullName} onChange={(v) => updateField("fullName", v)} />
            <TextField label="Account Number:" required value={form.accountNumber} onChange={(v) => updateField("accountNumber", v)} />
            <TextField label="Bank Name:" required value={form.bankName} onChange={(v) => updateField("bankName", v)} />
            <TextField label="Bank Branch:" value={form.bankBranch} onChange={(v) => updateField("bankBranch", v)} />
            <SelectField
              label="Country:"
              options={beneficiaryCountryOptions}
              defaultValue={form.country}
              value={form.country}
              onChange={(v) => updateField("country", v)}
            />
            <SelectField
              label="Relationship:"
              options={relationshipOptions}
              defaultValue={form.relationship}
              value={form.relationship}
              onChange={(v) => updateField("relationship", v)}
            />
            <TextField label="Phone:" value={form.phone} onChange={(v) => updateField("phone", v)} />
            <TextField label="Email:" value={form.email} onChange={(v) => updateField("email", v)} />
          </div>

          <div className="mt-6 border-t border-border pt-5">
            {saveError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-brand-green px-8 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:opacity-70"
            >
              {saving ? <Spinner className="h-3.5 w-3.5" /> : <Plus size={15} />}
              {saving ? "Adding..." : "Add Beneficiary"}
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border flex items-center gap-2 px-6 py-4">
          <UserPlus size={18} className="text-heading" />
          <h2 className="text-lg font-bold text-heading">Beneficiaries</h2>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          {listError && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{listError}</p>
          )}

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                    <th className="px-4 py-3">Customer ID</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Bank</th>
                    <th className="px-4 py-3">Account Number</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Relationship</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                        <span className="inline-flex items-center gap-2">
                          <Spinner className="h-4 w-4" />
                          Loading beneficiaries...
                        </span>
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    beneficiaries.map((b) => (
                      <tr key={b.id} className="border-b border-border bg-panel last:border-b-0">
                        <td className="px-4 py-3 text-heading/80">{b.username}</td>
                        <td className="px-4 py-3 font-medium text-heading">{b.fullName}</td>
                        <td className="px-4 py-3 text-heading/80">
                          {b.bankName}
                          {b.bankBranch && <div className="text-xs text-muted">{b.bankBranch}</div>}
                        </td>
                        <td className="px-4 py-3 text-heading/80">{b.accountNumber}</td>
                        <td className="px-4 py-3 text-heading/80">{b.country}</td>
                        <td className="px-4 py-3 text-heading/80">{b.relationship}</td>
                        <td className="px-4 py-3 text-heading/80">
                          {b.phone}
                          {b.email && <div className="text-xs text-muted">{b.email}</div>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(b.id)}
                            disabled={deletingId === b.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            {deletingId === b.id ? <Spinner className="h-3 w-3" /> : <Trash2 size={13} />}
                            {deletingId === b.id ? "Removing..." : "Remove"}
                          </button>
                        </td>
                      </tr>
                    ))}

                  {!loading && beneficiaries.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                        No beneficiaries yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
