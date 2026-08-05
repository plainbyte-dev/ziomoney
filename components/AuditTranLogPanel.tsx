"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import DateField from "./DateField";
import SelectField from "./SelectField";
import { auditLogEntries, logPanelOptions } from "@/data/securityData";
import { reportDefaults } from "@/data/staticData";

export default function AuditTranLogPanel() {
  const [showResults, setShowResults] = useState(false);
  const [userName, setUserName] = useState("");
  const [transactionNo, setTransactionNo] = useState("");
  const [pinno, setPinno] = useState("");
  const fromDate = reportDefaults.fromDate;
  const toDate = reportDefaults.toDate;

  function handleFind() {
    setShowResults(true);
  }

  const filteredEntries = auditLogEntries.filter((entry) => {
    if (userName && !entry.userId.toLowerCase().includes(userName.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="bg-brand-blue px-6 py-4">
        <h1 className="text-lg font-bold text-white">Audit Tran Log</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            <DateField
              label="From"
              defaultValue={fromDate}
            />
            <DateField
              label="To"
              defaultValue={toDate}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">User Name</label>
              <input
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Transaction No.</label>
              <input
                value={transactionNo}
                onChange={(event) => setTransactionNo(event.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">PINNO</label>
              <input
                value={pinno}
                onChange={(event) => setPinno(event.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
              />
            </div>
            <SelectField label="Log Panel" options={logPanelOptions} defaultValue={logPanelOptions[0]} />
          </div>

          <div className="mt-6 flex justify-end border-t border-border pt-5">
            <button
              onClick={handleFind}
              className="flex items-center gap-2 rounded-full bg-brand-green px-8 py-2.5 text-sm font-semibold text-white shadow-card transition-shadow hover:bg-brand-green-dark hover:shadow-card-hover"
            >
              <Search size={16} />
              Find Transaction
            </button>
          </div>
        </div>

        {showResults && (
          <div className="mt-6 overflow-hidden rounded-xl border border-border">
            <div className="bg-brand-blue/90 px-4 py-2">
              <p className="text-sm font-semibold text-white">
                Report Detail From: {fromDate} To: {toDate}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-surface text-[11px] uppercase tracking-wide text-muted">
                    <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Date</th>
                    <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">User ID</th>
                    <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Function Name</th>
                    <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">DC Info</th>
                    <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">IP</th>
                    <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Tranno</th>
                    <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Refno</th>
                    <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">User Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-4 text-center text-muted">
                        No Records Found
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry, index) => (
                      <tr key={`${entry.date}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-surface/50"}>
                        <td className="whitespace-nowrap px-3 py-2 text-heading/80">{entry.date}</td>
                        <td className="whitespace-nowrap px-3 py-2 font-medium text-brand-blue">{entry.userId}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-heading/80">{entry.functionName}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-heading/80">{entry.dcInfo || "—"}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-heading/80">{entry.ip}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-heading/80">{entry.tranno || "—"}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-heading/80">{entry.refno || "—"}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-heading/80">{entry.userType}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
