"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, ShieldCheck, Trash2, UserPlus, UserRound, X } from "lucide-react";
import RadioPill from "./RadioPill";
import DateInput from "./DateInput";
import Button from "./Button";
import Spinner from "./Spinner";
import SelectField from "./SelectField";
import BeneficiaryFormFields from "./BeneficiaryFormFields";
import { useBeneficiaries } from "@/contexts/BeneficiariesContext";
import { useKyc } from "@/contexts/KycContext";
import { genderOptions, nationalityOptions } from "@/data/customerDetailsData";
import { emptyCustomerRecord, type CustomerRecord, type KycRecord, type KycStatus } from "@/data/kycData";
import {
  emptyBeneficiaryPayload,
  type AddBeneficiaryPayload,
} from "@/data/beneficiaryData";

const KYC_BADGE_CLASS: Record<KycStatus, string> = {
  NOT_VERIFIED: "bg-surface text-muted",
  VERIFIED: "bg-brand-green-light text-brand-green-dark",
  COMPLIANCE_HOLD: "bg-amber-50 text-amber-700",
  REJECTED: "bg-red-50 text-red-600",
};

interface EditCustomerModalProps {
  target: KycRecord | null;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (payload: CustomerRecord) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

const labelClass = "text-xs uppercase tracking-wide text-muted";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p className="mt-1 text-sm font-medium text-heading">{value || "-"}</p>
    </div>
  );
}

export default function EditCustomerModal({
  target,
  submitting,
  error,
  onClose,
  onSave,
}: EditCustomerModalProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CustomerRecord>(emptyCustomerRecord());

  const { getEntriesForSender, addEntry, removeEntry, verifyBeneficiaryKyc } = useBeneficiaries();
  const { approvedList } = useKyc();
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [beneficiaryForm, setBeneficiaryForm] = useState<AddBeneficiaryPayload>(emptyBeneficiaryPayload());
  const [beneficiaryCustomerUserName, setBeneficiaryCustomerUserName] = useState("");
  const [addingBeneficiary, setAddingBeneficiary] = useState(false);
  const [addBeneficiaryError, setAddBeneficiaryError] = useState<string | null>(null);
  const [removingBeneficiaryId, setRemovingBeneficiaryId] = useState<number | null>(null);
  const [verifyingBeneficiaryId, setVerifyingBeneficiaryId] = useState<number | null>(null);

  // Re-seed the form whenever a new row is opened, and always reopen in
  // view mode — editing state shouldn't carry over from the previous record.
  useEffect(() => {
    if (target) {
      const { id: _id, status: _status, submittedDate: _submittedDate, kycUniqueCode: _kuc, referCode: _rc, ...customerFields } = target;
      setForm(customerFields);
      setEditing(false);
      setShowAddBeneficiary(false);
      setBeneficiaryForm(emptyBeneficiaryPayload());
      setBeneficiaryCustomerUserName("");
      setAddBeneficiaryError(null);
    }
  }, [target]);

  if (!target) return null;

  function updateField<K extends keyof CustomerRecord>(field: K, value: CustomerRecord[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateBeneficiaryField<K extends keyof AddBeneficiaryPayload>(field: K, value: AddBeneficiaryPayload[K]) {
    setBeneficiaryForm((prev) => ({ ...prev, [field]: value }));
  }

  // Same VERIFIED gate as the standalone Beneficiaries screen — ApprovedKycsPanel
  // only ever opens this modal for VERIFIED customers today, but this stays
  // an explicit check (not an assumption) in case that ever changes.
  const isSenderVerified = target.status === "VERIFIED";
  const linkedBeneficiaries = getEntriesForSender(target.userName);

  // A beneficiary can itself be a KYC-verified customer on file — picking one
  // autofills the name/contact fields below instead of retyping them. The
  // sender (this modal's own customer) can't be their own beneficiary.
  const beneficiaryCustomerOptions = approvedList.filter((c) => c.userName !== target.userName);

  function applyBeneficiaryCustomer(userName: string) {
    setBeneficiaryCustomerUserName(userName);
    const customer = approvedList.find((c) => c.userName === userName);
    if (!customer) return;
    setBeneficiaryForm((prev) => ({
      ...prev,
      fullName: customer.fullName || customer.userName,
      email: customer.emailAddress,
      phone: customer.mobileNo,
    }));
  }

  async function handleAddBeneficiary(event: React.FormEvent) {
    event.preventDefault();
    if (!isSenderVerified || !target) return;
    setAddingBeneficiary(true);
    setAddBeneficiaryError(null);
    const success = await addEntry(beneficiaryForm, target.userName);
    setAddingBeneficiary(false);
    if (!success) {
      setAddBeneficiaryError("Could not add beneficiary. Please try again.");
      return;
    }
    setBeneficiaryForm(emptyBeneficiaryPayload());
    setBeneficiaryCustomerUserName("");
    setShowAddBeneficiary(false);
  }

  async function handleRemoveBeneficiary(id: number) {
    setRemovingBeneficiaryId(id);
    await removeEntry(id);
    setRemovingBeneficiaryId(null);
  }

  function handleVerifyBeneficiary(id: number) {
    setVerifyingBeneficiaryId(id);
    verifyBeneficiaryKyc(id);
    setVerifyingBeneficiaryId(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSave({
      ...form,
      fullName: [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" "),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-panel shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green-light text-brand-green-dark">
              <UserRound size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-heading">
                {target.fullName || target.userName}
              </h2>
              <p className="text-xs text-muted">{target.userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<Pencil size={13} />}
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-muted hover:bg-border hover:text-heading"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto">
          {!editing ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-3 sm:p-8">
              <ReadOnlyField label="Gender" value={target.gender} />
              <ReadOnlyField label="Date of Birth" value={target.dob} />
              <ReadOnlyField label="Nationality" value={target.nationality} />
              <ReadOnlyField label="Email" value={target.emailAddress} />
              <ReadOnlyField label="Mobile No" value={target.mobileNo} />
              <ReadOnlyField label="Telephone" value={target.telephoneNo} />
              <ReadOnlyField label="Zip Code" value={target.zipCode} />
              <ReadOnlyField label="Prefecture" value={target.prefecture} />
              <ReadOnlyField label="City" value={target.city} />
              <ReadOnlyField label="Town" value={target.town} />
              <ReadOnlyField label="Street Address" value={target.streetAddress} />
              <ReadOnlyField label="Primary ID No" value={target.primaryIdNo} />
              <ReadOnlyField label="Primary ID Expiry" value={target.primaryIdExpiryDate} />
              <ReadOnlyField label="Secondary ID No" value={target.secondaryIdNo} />
              <ReadOnlyField label="Registrant Agent" value={target.registrantAgent ?? ""} />
              <ReadOnlyField label="Registrant Branch" value={target.registrantBranch ?? ""} />
              <ReadOnlyField label="KYC Mode" value={target.kycMode ?? ""} />
              <div className="sm:col-span-3">
                <ReadOnlyField label="Remarks" value={target.remarks} />
              </div>

              <div className="sm:col-span-3 border-t border-border pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-heading">
                    <UserPlus size={15} /> Beneficiaries
                  </h3>
                  {isSenderVerified && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={<Plus size={13} />}
                      onClick={() => setShowAddBeneficiary((v) => !v)}
                    >
                      {showAddBeneficiary ? "Cancel" : "Add Beneficiary"}
                    </Button>
                  )}
                </div>

                {!isSenderVerified && (
                  <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    This customer's KYC status is {target.status} — beneficiaries can only be added once
                    they are VERIFIED.
                  </p>
                )}

                {showAddBeneficiary && isSenderVerified && (
                  <form
                    onSubmit={handleAddBeneficiary}
                    className="mb-4 flex flex-col gap-4 rounded-xl border border-border bg-surface p-4"
                  >
                    {beneficiaryCustomerOptions.length > 0 && (
                      <div>
                        <SelectField
                          label="Beneficiary (from approved KYC customers):"
                          options={["-- Enter manually --", ...beneficiaryCustomerOptions.map((c) => c.fullName || c.userName)]}
                          defaultValue="-- Enter manually --"
                          value={
                            beneficiaryCustomerOptions.find((c) => c.userName === beneficiaryCustomerUserName)
                              ?.fullName ?? "-- Enter manually --"
                          }
                          onChange={(v) => {
                            const match = beneficiaryCustomerOptions.find((c) => (c.fullName || c.userName) === v);
                            applyBeneficiaryCustomer(match?.userName ?? "");
                          }}
                        />
                        <p className="mt-1.5 text-xs text-muted">
                          Optional — picking a customer fills in their name, email and phone below; bank details
                          still need to be entered manually.
                        </p>
                      </div>
                    )}
                    <BeneficiaryFormFields form={beneficiaryForm} updateField={updateBeneficiaryField} />
                    {addBeneficiaryError && (
                      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{addBeneficiaryError}</p>
                    )}
                    <div>
                      <Button type="submit" size="sm" loading={addingBeneficiary}>
                        {addingBeneficiary ? "Adding..." : "Save Beneficiary"}
                      </Button>
                    </div>
                  </form>
                )}

                {linkedBeneficiaries.length === 0 ? (
                  <p className="text-sm text-muted">No beneficiaries linked to this customer yet.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {linkedBeneficiaries.map((b) => (
                      <li
                        key={b.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-heading">{b.fullName}</p>
                          <p className="text-xs text-muted">
                            {b.bankName} · {b.accountNumber} · {b.country}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${KYC_BADGE_CLASS[b.beneficiaryKycStatus]}`}
                          >
                            {b.beneficiaryKycStatus}
                          </span>
                          {b.beneficiaryKycStatus !== "VERIFIED" && (
                            <button
                              type="button"
                              onClick={() => handleVerifyBeneficiary(b.id)}
                              disabled={verifyingBeneficiaryId === b.id}
                              className="inline-flex items-center gap-1.5 rounded-full border border-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green-dark hover:bg-brand-green-light disabled:opacity-60"
                            >
                              {verifyingBeneficiaryId === b.id ? (
                                <Spinner className="h-3 w-3" />
                              ) : (
                                <ShieldCheck size={13} />
                              )}
                              Verify
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveBeneficiary(b.id)}
                            disabled={removingBeneficiaryId === b.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            {removingBeneficiaryId === b.id ? (
                              <Spinner className="h-3 w-3" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <form id="edit-customer-form" onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="First Name">
                  <input
                    value={form.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Middle Name">
                  <input
                    value={form.middleName}
                    onChange={(e) => updateField("middleName", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Last Name">
                  <input
                    value={form.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Gender">
                  <div className="flex items-center gap-6 py-2">
                    {genderOptions.map((option) => (
                      <RadioPill
                        key={option}
                        label={option}
                        checked={form.gender === option}
                        onSelect={() => updateField("gender", option)}
                      />
                    ))}
                  </div>
                </Field>
                <Field label="Date of Birth">
                  <DateInput value={form.dob} onChange={(value) => updateField("dob", value)} />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nationality">
                  <select
                    value={form.nationality}
                    onChange={(e) => updateField("nationality", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">--SELECT--</option>
                    {nationalityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={form.emailAddress}
                    onChange={(e) => updateField("emailAddress", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Mobile No">
                  <input
                    value={form.mobileNo}
                    onChange={(e) => updateField("mobileNo", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Telephone">
                  <input
                    value={form.telephoneNo}
                    onChange={(e) => updateField("telephoneNo", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Zip Code">
                  <input
                    value={form.zipCode}
                    onChange={(e) => updateField("zipCode", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Prefecture">
                  <input
                    value={form.prefecture}
                    onChange={(e) => updateField("prefecture", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="City">
                  <input
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Town">
                  <input
                    value={form.town}
                    onChange={(e) => updateField("town", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Street Address">
                  <input
                    value={form.streetAddress}
                    onChange={(e) => updateField("streetAddress", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Primary ID No">
                  <input
                    value={form.primaryIdNo}
                    onChange={(e) => updateField("primaryIdNo", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Primary ID Issue Date">
                  <DateInput
                    value={form.primaryIdIssueDate}
                    onChange={(value) => updateField("primaryIdIssueDate", value)}
                  />
                </Field>
                <Field label="Primary ID Expiry Date">
                  <DateInput
                    value={form.primaryIdExpiryDate}
                    onChange={(value) => updateField("primaryIdExpiryDate", value)}
                  />
                </Field>
              </div>

              <Field label="Secondary ID No">
                <input
                  value={form.secondaryIdNo}
                  onChange={(e) => updateField("secondaryIdNo", e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Remarks">
                <textarea
                  rows={2}
                  value={form.remarks}
                  onChange={(e) => updateField("remarks", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </form>
          )}
        </div>

        {editing && (
          <div className="border-t border-border px-6 py-4 sm:px-8">
            {error && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setEditing(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" form="edit-customer-form" loading={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
