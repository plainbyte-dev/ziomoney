"use client";

import { useState } from "react";
import TextField from "./TextField";
import SelectField from "./SelectField";
import Checkbox from "./Checkbox";
import Button from "./Button";
import { partnerCountrySelectOptions, partnerEntries } from "@/data/partnerData";
import { sendBranchOptions } from "@/data/transactionSendData";
import { privilegeOptions, userRoleOptions } from "@/data/userManagementData";

const agentOptions = ["Select Agent", ...partnerEntries.map((p) => p.partnerName)];
const branchOptions = ["Select Branch", ...sendBranchOptions];

export default function CreatePartnerUserPanel() {
  const [country, setCountry] = useState(partnerCountrySelectOptions[0]);
  const [partnerId, setPartnerId] = useState(agentOptions[0]);
  const [branchName, setBranchName] = useState(branchOptions[0]);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [sendersName, setSendersName] = useState("");
  const [post, setPost] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [privilege, setPrivilege] = useState(privilegeOptions[0]);
  const [allowIntegration, setAllowIntegration] = useState(false);
  const [viewPastTxnLimit, setViewPastTxnLimit] = useState("60");
  const [deactivateUser, setDeactivateUser] = useState("5");
  const [remarks, setRemarks] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  function toggleRole(role: string) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  const canSave = sendersName.trim().length > 0 && password.length > 0 && password === confirmPassword;

  function handleSave() {
    if (!canSave) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Create Partner User</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="grid max-w-3xl grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <SelectField label="Country:" options={partnerCountrySelectOptions} defaultValue={partnerCountrySelectOptions[0]} value={country} onChange={setCountry} />
          <TextField label="Login ID:" value={loginId} onChange={setLoginId} />

          <SelectField label="Partner ID:" options={agentOptions} defaultValue={agentOptions[0]} value={partnerId} onChange={setPartnerId} />
          <TextField label="Password:" required value={password} onChange={setPassword} />

          <SelectField label="Branch Name:" options={branchOptions} defaultValue={branchOptions[0]} value={branchName} onChange={setBranchName} />
          <TextField label="Confirm Password:" required value={confirmPassword} onChange={setConfirmPassword} />
        </div>

        <div className="mt-6 grid max-w-3xl grid-cols-1 gap-x-6 gap-y-5 border-t border-border pt-5 sm:grid-cols-2">
          <TextField label="Sender's Name:" required value={sendersName} onChange={setSendersName} />
          <SelectField label="Priviledge:" options={privilegeOptions} defaultValue={privilegeOptions[0]} value={privilege} onChange={setPrivilege} />

          <TextField label="Post:" value={post} onChange={setPost} />
          <div className="flex items-end pb-2.5">
            <Checkbox
              checked={allowIntegration}
              onToggle={() => setAllowIntegration((v) => !v)}
              label="Allow Integration:"
              className="flex-row-reverse justify-end gap-2 text-heading/70"
            />
          </div>

          <TextField label="Address:" value={address} onChange={setAddress} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">View Past TXN Limit:</label>
            <div className="flex items-center gap-2">
              <input value={viewPastTxnLimit} onChange={(event) => setViewPastTxnLimit(event.target.value)} className="w-20 rounded-lg border border-border bg-panel px-3 py-1.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green" />
              <span className="text-sm text-heading/70">days</span>
            </div>
          </div>

          <TextField label="Email:" value={email} onChange={setEmail} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Deactivate User:</label>
            <div className="flex items-center gap-2">
              <input value={deactivateUser} onChange={(event) => setDeactivateUser(event.target.value)} className="w-20 rounded-lg border border-border bg-panel px-3 py-1.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green" />
              <span className="text-sm text-heading/70">days, if not logged in.</span>
            </div>
            <span className="text-xs italic text-red-500">Blank means never Deactivate this user</span>
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Remarks:</label>
            <textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </div>
        </div>

        <div className="mt-6 max-w-3xl border-t border-border pt-5">
          <p className="mb-2 text-sm font-semibold text-heading">Roles:</p>
          <div className="rounded-lg border border-border bg-panel p-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {userRoleOptions.map((role) => (
                <Checkbox key={role} checked={roles.includes(role)} onToggle={() => toggleRole(role)} label={role} className="text-red-500" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 max-w-3xl">
          {saved && (
            <p className="mb-3 rounded-lg bg-brand-green-light/40 px-3 py-2 text-sm text-brand-green-dark">
              Partner user saved.
            </p>
          )}
          <Button onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
          <p className="mt-2 text-xs text-red-500">* are required fields</p>
        </div>
      </div>
    </div>
  );
}
