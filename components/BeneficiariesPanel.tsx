"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";
import { useKyc } from "@/contexts/KycContext";
import { useBeneficiaries } from "@/contexts/BeneficiariesContext";
import SelectField from "./SelectField";
import BeneficiaryFormFields from "./BeneficiaryFormFields";
import Button from "./Button";
import Spinner from "./Spinner";
import { emptyBeneficiaryPayload, type AddBeneficiaryPayload } from "@/data/beneficiaryData";
import type { KycStatus } from "@/data/kycData";

const KYC_BADGE_CLASS: Record<KycStatus, string> = {
  NOT_VERIFIED: "bg-surface text-muted",
  VERIFIED: "bg-brand-green-light text-brand-green-dark",
  COMPLIANCE_HOLD: "bg-amber-50 text-amber-700",
  REJECTED: "bg-red-50 text-red-600",
};

export default function BeneficiariesPanel() {
  const { isLive } = useDataMode();
  const { approvedList } = useKyc();
  const {
    entriesLoading: loading,
    entriesError: listError,
    addEntry,
    removeEntry,
    verifyBeneficiaryKyc,
    getEntriesForSender,
  } = useBeneficiaries();

  // Only KYC-approved (VERIFIED) customers can be a sender, so only they're
  // offered here — no point listing pending/compliance-hold customers just
  // to disable the Add button underneath them.
  const customerOptions = useMemo(
    () =>
      approvedList.map((record) => ({
        userName: record.userName,
        fullName: record.fullName || record.userName,
        status: record.status as KycStatus,
      })),
    [approvedList]
  );

  const [selectedCustomerUserName, setSelectedCustomerUserName] = useState("");

  // Backfill once the KYC lists load, same pattern used for the other
  // asynchronously-loaded dropdowns in this app (partner/currency selects).
  useEffect(() => {
    if (customerOptions.length === 0) return;
    setSelectedCustomerUserName((prev) =>
      prev && customerOptions.some((c) => c.userName === prev) ? prev : customerOptions[0].userName
    );
  }, [customerOptions]);

  const selectedCustomer = customerOptions.find((c) => c.userName === selectedCustomerUserName) ?? null;
  // customerOptions is already filtered to VERIFIED customers only, so a
  // selection is always eligible — kept as an explicit check rather than an
  // assumption, same defense-in-depth reasoning as the re-check in handleAdd.
  const isSelectedCustomerVerified = selectedCustomer !== null;

  // Beneficiary list per sender (spec Phase 3) — scoped to whichever
  // customer is selected above, not a flat list of everything.
  const beneficiariesForSender = selectedCustomer ? getEntriesForSender(selectedCustomer.userName) : [];

  const [form, setForm] = useState<AddBeneficiaryPayload>(emptyBeneficiaryPayload());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // A beneficiary can itself be a KYC-verified customer on file (e.g. two
  // registered customers sending to each other) — picking one here autofills
  // the name/contact fields below rather than requiring them to be retyped.
  // A customer can't be their own beneficiary, so the sender is excluded.
  const beneficiaryCustomerOptions = customerOptions.filter((c) => c.userName !== selectedCustomerUserName);
  const [beneficiaryCustomerUserName, setBeneficiaryCustomerUserName] = useState("");

  // The picker's options depend on whichever sender is selected above —
  // clear it when the sender changes so it can't silently keep pointing at
  // the previous sender's now-invalid selection.
  useEffect(() => {
    setBeneficiaryCustomerUserName("");
  }, [selectedCustomerUserName]);

  function applyBeneficiaryCustomer(userName: string) {
    setBeneficiaryCustomerUserName(userName);
    const customer = approvedList.find((c) => c.userName === userName);
    if (!customer) return;
    setForm((prev) => ({
      ...prev,
      fullName: customer.fullName || customer.userName,
      email: customer.emailAddress,
      phone: customer.mobileNo,
    }));
  }

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  function updateField<K extends keyof AddBeneficiaryPayload>(key: K, value: AddBeneficiaryPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    // Re-checked here, not just relied on via the disabled button — same
    // defense-in-depth reasoning as the KYC approval maker-checker guard.
    if (!isSelectedCustomerVerified || !selectedCustomer) return;
    setSaving(true);
    setSaveError(null);
    const success = await addEntry(form, selectedCustomer.userName);
    setSaving(false);
    if (!success) {
      setSaveError("Could not add beneficiary. Please try again.");
      return;
    }
    setForm(emptyBeneficiaryPayload());
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    await removeEntry(id);
    setDeletingId(null);
  }

  function handleVerify(id: number) {
    setVerifyingId(id);
    verifyBeneficiaryKyc(id);
    setVerifyingId(null);
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
          <div className="mb-5 max-w-sm">
            {customerOptions.length > 0 ? (
              <SelectField
                label="Sender:"
                required
                options={customerOptions.map((c) => c.fullName)}
                defaultValue={customerOptions[0].fullName}
                value={selectedCustomer?.fullName ?? ""}
                onChange={(v) => {
                  const match = customerOptions.find((c) => c.fullName === v);
                  setSelectedCustomerUserName(match?.userName ?? "");
                }}
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-heading/70">Sender:</label>
                <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-muted">
                  No KYC-verified customers found — approve one under KYC first.
                </p>
              </div>
            )}
            {selectedCustomer && (
              <p className="mt-2 text-xs text-brand-green-dark">
                {selectedCustomer.fullName} is KYC verified. Beneficiaries added below are linked to them.
              </p>
            )}
          </div>

          <fieldset disabled={!isSelectedCustomerVerified} className="disabled:opacity-60">
            {beneficiaryCustomerOptions.length > 0 && (
              <div className="mb-5 max-w-sm">
                <SelectField
                  label="Beneficiary (from approved KYC customers):"
                  options={["-- Enter manually --", ...beneficiaryCustomerOptions.map((c) => c.fullName)]}
                  defaultValue="-- Enter manually --"
                  value={
                    beneficiaryCustomerOptions.find((c) => c.userName === beneficiaryCustomerUserName)?.fullName ??
                    "-- Enter manually --"
                  }
                  onChange={(v) => {
                    const match = beneficiaryCustomerOptions.find((c) => c.fullName === v);
                    applyBeneficiaryCustomer(match?.userName ?? "");
                  }}
                />
                <p className="mt-1.5 text-xs text-muted">
                  Optional — picking a customer fills in their name, email and phone below; bank details still
                  need to be entered manually.
                </p>
              </div>
            )}
            <BeneficiaryFormFields form={form} updateField={updateField} />
          </fieldset>

          <div className="mt-6 border-t border-border pt-5">
            {saveError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>
            )}
            <Button
              type="submit"
              loading={saving}
              disabled={!isSelectedCustomerVerified}
              icon={<Plus size={15} />}
            >
              {saving
                ? "Adding..."
                : isSelectedCustomerVerified
                  ? "Add Beneficiary"
                  : "Sender not KYC verified"}
            </Button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border flex items-center gap-2 px-6 py-4">
          <UserPlus size={18} className="text-heading" />
          <h2 className="text-lg font-bold text-heading">
            Beneficiaries{selectedCustomer ? ` — ${selectedCustomer.fullName}` : ""}
          </h2>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          {listError && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{listError}</p>
          )}

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Bank</th>
                    <th className="px-4 py-3">Account Number</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Relationship</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Beneficiary KYC</th>
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
                    beneficiariesForSender.map((b) => (
                      <tr key={b.id} className="border-b border-border bg-panel last:border-b-0">
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
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${KYC_BADGE_CLASS[b.beneficiaryKycStatus]}`}
                          >
                            {b.beneficiaryKycStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {b.beneficiaryKycStatus !== "VERIFIED" && (
                              <button
                                type="button"
                                onClick={() => handleVerify(b.id)}
                                disabled={verifyingId === b.id}
                                className="inline-flex items-center gap-1.5 rounded-full border border-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green-dark hover:bg-brand-green-light disabled:opacity-60"
                              >
                                {verifyingId === b.id ? <Spinner className="h-3 w-3" /> : <ShieldCheck size={13} />}
                                Verify
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(b.id)}
                              disabled={deletingId === b.id}
                              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                            >
                              {deletingId === b.id ? <Spinner className="h-3 w-3" /> : <Trash2 size={13} />}
                              {deletingId === b.id ? "Removing..." : "Remove"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {!loading && beneficiariesForSender.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                        {selectedCustomer
                          ? `No beneficiaries linked to ${selectedCustomer.fullName} yet.`
                          : "No beneficiaries yet."}
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
