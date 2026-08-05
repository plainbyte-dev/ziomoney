"use client";

import { useState } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { auditRoleFilterOptions, functionNameOptions, searchAreaOptions } from "@/data/userManagementData";

export default function AuditUserRightsPartnerPanel() {
  const [mainPartner, setMainPartner] = useState("");
  const [branch, setBranch] = useState("");
  const [loginId, setLoginId] = useState("");
  const [role, setRole] = useState(auditRoleFilterOptions[0]);
  const [functionName, setFunctionName] = useState(functionNameOptions[0]);
  const [searchArea, setSearchArea] = useState(searchAreaOptions[0]);
  const [searched, setSearched] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="bg-brand-blue px-6 py-4">
        <h1 className="text-lg font-bold text-white">Audit User Rights - Partner</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="max-w-xl space-y-4">
          <FormRow label="Main Partner:">
            <div className="flex gap-2">
              <input value={mainPartner} onChange={(event) => setMainPartner(event.target.value)} className={inputClass} />
              <button className={ellipsisButtonClass} aria-label="Browse main partner">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </FormRow>

          <FormRow label="Branch:">
            <div className="flex gap-2">
              <input value={branch} onChange={(event) => setBranch(event.target.value)} className={inputClass} />
              <button className={ellipsisButtonClass} aria-label="Browse branch">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </FormRow>

          <FormRow label="Login ID :">
            <input value={loginId} onChange={(event) => setLoginId(event.target.value)} className={inputClass} />
          </FormRow>

          <FormRow label="Roles :">
            <select value={role} onChange={(event) => setRole(event.target.value)} className={selectClass}>
              {auditRoleFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="Function Name:">
            <select value={functionName} onChange={(event) => setFunctionName(event.target.value)} className={selectClass}>
              {functionNameOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="Search Area:">
            <select value={searchArea} onChange={(event) => setSearchArea(event.target.value)} className={selectClass}>
              {searchAreaOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FormRow>

          <button
            onClick={() => setSearched(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-heading/80 hover:bg-border"
          >
            <Search size={14} />
            Search
          </button>

          {searched && (
            <p className="rounded-lg bg-surface px-4 py-2.5 text-xs text-muted">
              No matching audit records found for the selected filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border px-3 py-1.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";
const selectClass =
  "w-full max-w-[220px] rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";
const ellipsisButtonClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-heading/70 hover:bg-border";

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="w-32 shrink-0 text-sm text-heading/80">{label}</span>
      <div className="min-w-[220px] flex-1">{children}</div>
    </div>
  );
}
