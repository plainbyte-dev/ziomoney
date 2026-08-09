"use client";

import { useState } from "react";
import TextField from "./TextField";
import SelectField from "./SelectField";
import Checkbox from "./Checkbox";
import { userTypeOptions, userRoleOptions } from "@/data/userManagementData";

export default function CreateHeadOfficeUserPanel() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState(userTypeOptions[0]);
  const [staffId, setStaffId] = useState("");
  const [lockIfNotLogin, setLockIfNotLogin] = useState("0");
  const [dateLimited, setDateLimited] = useState("60");
  const [creditLimitAuthority, setCreditLimitAuthority] = useState("");
  const [require2fa, setRequire2fa] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [telephone, setTelephone] = useState("");
  const [emailId, setEmailId] = useState("");
  const [saved, setSaved] = useState(false);

  function toggleRole(role: string) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  const canSave = password.length > 0 && password === confirmPassword;

  function handleSave() {
    if (!canSave) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">New Head Office User</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="grid max-w-3xl grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <TextField label="User Name" value={userName} onChange={setUserName} />
          <SelectField label="User Type" options={userTypeOptions} defaultValue={userTypeOptions[0]} value={userType} onChange={setUserType} />

          <TextField label="Password:" required value={password} onChange={setPassword} />
          <TextField label="Staff ID" value={staffId} onChange={setStaffId} />

          <TextField label="Confirm Password:" required value={confirmPassword} onChange={setConfirmPassword} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Credit Limit authority</label>
            <input value={creditLimitAuthority} onChange={(event) => setCreditLimitAuthority(event.target.value)} className={inputClass} />
            <span className="text-xs italic text-red-500">
              If Blank then User can change all branch Credit Limit/Group defined
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Lock if not login</label>
            <div className="flex items-center gap-2">
              <input value={lockIfNotLogin} onChange={(event) => setLockIfNotLogin(event.target.value)} className="w-20 rounded-lg border border-border bg-panel px-3 py-1.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green" />
              <span className="text-sm text-heading/70">days, if not logged in</span>
            </div>
            <span className="text-xs italic text-red-500">0(Zero) or Blank means never Lock this user</span>
          </div>

          <div className="flex items-end pb-2.5">
            <Checkbox
              checked={require2fa}
              onToggle={() => setRequire2fa((v) => !v)}
              label="By checking this, user MUST activate 2 Factor Authentication"
              className="flex-row-reverse justify-end gap-2 text-heading/70"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Date Limited</label>
            <input value={dateLimited} onChange={(event) => setDateLimited(event.target.value)} className={inputClass} />
            <span className="text-xs italic text-red-500">Blank mean Unlimited Date</span>
          </div>
          <div />
        </div>

        <div className="mt-6 max-w-3xl border-t border-border pt-5">
          <p className="mb-2 text-sm text-heading/70">User Roles</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {userRoleOptions.map((role) => (
              <Checkbox key={role} checked={roles.includes(role)} onToggle={() => toggleRole(role)} label={role} className="font-medium text-brand-blue" />
            ))}
          </div>
        </div>

        <div className="mt-6 grid max-w-3xl grid-cols-1 gap-x-6 gap-y-5 border-t border-border pt-5 sm:grid-cols-2">
          <TextField label="Name" value={name} onChange={setName} />
          <TextField label="Address" value={address} onChange={setAddress} />
          <TextField label="Telephone" value={telephone} onChange={setTelephone} />
          <TextField label="Email ID" value={emailId} onChange={setEmailId} />
        </div>

        <div className="mt-6 max-w-3xl border-t border-border pt-5">
          {saved && (
            <p className="mb-3 rounded-lg bg-brand-green-light/40 px-3 py-2 text-sm text-brand-green-dark">
              Head office user saved.
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center gap-2 rounded-full bg-brand-green px-8 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
          <p className="mt-2 text-xs text-red-500">* are required fields</p>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-panel px-3 py-1.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";
