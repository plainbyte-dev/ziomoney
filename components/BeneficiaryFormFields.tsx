"use client";

import TextField from "./TextField";
import SelectField from "./SelectField";
import { relationshipOptions, type AddBeneficiaryPayload } from "@/data/beneficiaryData";
import { beneficiaryCountryOptions } from "@/data/staticData";

// Shared by BeneficiariesPanel (sender picked from a dropdown) and
// EditCustomerModal's Customer Details view (sender fixed to whichever
// customer is open) — the fields collected are identical either way, only
// how the sender is chosen differs, which lives in each caller.
export default function BeneficiaryFormFields({
  form,
  updateField,
}: {
  form: AddBeneficiaryPayload;
  updateField: <K extends keyof AddBeneficiaryPayload>(key: K, value: AddBeneficiaryPayload[K]) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
      <TextField label="Full Name:" required value={form.fullName} onChange={(v) => updateField("fullName", v)} />
      <TextField
        label="Account Number:"
        required
        value={form.accountNumber}
        onChange={(v) => updateField("accountNumber", v)}
      />
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
  );
}
