"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";
import TextField from "./TextField";
import SelectField from "./SelectField";
import Spinner from "./Spinner";
import {
  transactionRecords,
  type RemittanceTransactionRecord,
} from "@/data/transactionData";
import {
  viewTransaction,
  getTransactionsByStaff,
  getTransactionsByRefNo,
  getLatestTransactionByUsername,
} from "@/lib/transactionApi";

type QueryMode = "confirmId" | "staff" | "refNo" | "latest";

const MODE_LABELS: Record<QueryMode, string> = {
  confirmId: "By Confirm ID",
  staff: "By Staff / Agent",
  refNo: "By Reference Number",
  latest: "Latest for Partner",
};

const STATUS_STYLES: Record<string, string> = {
  INSERTED: "bg-surface text-heading/70",
  CONFIRMED: "bg-brand-blue-light text-brand-blue-dark",
  PAID: "bg-brand-green-light text-brand-green-dark",
  CANCELLED: "bg-red-50 text-red-600",
};

function withinRange(iso: string, fromDate: string, toDate: string) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (fromDate && t < new Date(fromDate).getTime()) return false;
  if (toDate && t > new Date(toDate).getTime()) return false;
  return true;
}

export default function TransactionQueryPanel() {
  const { isLive } = useDataMode();
  const [mode, setMode] = useState<QueryMode>("confirmId");

  const [confirmId, setConfirmId] = useState("");
  const [staffUserName, setStaffUserName] = useState("");
  const [refUsername, setRefUsername] = useState("");
  const [refNo, setRefNo] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [latestUsername, setLatestUsername] = useState("");

  const [results, setResults] = useState<RemittanceTransactionRecord[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setSearching(true);
    setSearchError(null);
    setSearched(true);

    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let matches: RemittanceTransactionRecord[] = [];
      if (mode === "confirmId") {
        matches = transactionRecords.filter((r) => r.confirmId === confirmId);
      } else if (mode === "staff") {
        matches = transactionRecords.filter((r) => r.userName === staffUserName);
      } else if (mode === "refNo") {
        matches = transactionRecords.filter(
          (r) =>
            r.userName === refUsername &&
            r.referenceNo === refNo &&
            (!fromDate || !toDate || withinRange(r.txnDate, fromDate, toDate))
        );
      } else {
        const candidates = transactionRecords
          .filter(
            (r) =>
              r.userName === latestUsername &&
              r.status !== "CANCELLED" &&
              (!fromDate || !toDate || withinRange(r.txnDate, fromDate, toDate))
          )
          .sort((a, b) => new Date(b.txnDate).getTime() - new Date(a.txnDate).getTime());
        matches = candidates.slice(0, 1);
      }
      setResults(matches);
      setSearching(false);
      return;
    }

    let response;
    if (mode === "confirmId") {
      response = await viewTransaction({ confirmId });
    } else if (mode === "staff") {
      response = await getTransactionsByStaff({ userName: staffUserName });
    } else if (mode === "refNo") {
      response = await getTransactionsByRefNo({ username: refUsername, refNo, fromDate, toDate });
    } else {
      response = await getLatestTransactionByUsername({ username: latestUsername, fromDate, toDate });
    }

    setSearching(false);
    if (!response.success) {
      setSearchError(response.message || "Could not run the transaction search.");
      setResults([]);
      return;
    }
    setResults(response.data ? (Array.isArray(response.data) ? response.data : [response.data]) : []);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Transaction Query</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — read-only remittance transaction lookups.
          </p>
        </div>

        <form onSubmit={handleSearch} className="bg-panel p-6 sm:p-8">
          <div className="mb-5 max-w-xs">
            <SelectField
              label="Search by:"
              options={Object.values(MODE_LABELS)}
              defaultValue={MODE_LABELS[mode]}
              value={MODE_LABELS[mode]}
              onChange={(label) => {
                const next = (Object.keys(MODE_LABELS) as QueryMode[]).find((k) => MODE_LABELS[k] === label);
                if (next) setMode(next);
                setResults([]);
                setSearched(false);
              }}
            />
          </div>

          {mode === "confirmId" && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
              <TextField label="Confirm ID:" required value={confirmId} onChange={setConfirmId} />
            </div>
          )}

          {mode === "staff" && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
              <TextField label="Staff / Agent User Name:" required value={staffUserName} onChange={setStaffUserName} />
            </div>
          )}

          {mode === "refNo" && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-4">
              <TextField label="Partner User Name:" required value={refUsername} onChange={setRefUsername} />
              <TextField label="Reference No:" required value={refNo} onChange={setRefNo} />
              <TextField label="From Date:" placeholder="YYYY-MM-DD" value={fromDate} onChange={setFromDate} />
              <TextField label="To Date:" placeholder="YYYY-MM-DD" value={toDate} onChange={setToDate} />
            </div>
          )}

          {mode === "latest" && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-4">
              <TextField label="Partner User Name:" required value={latestUsername} onChange={setLatestUsername} />
              <TextField label="From Date:" placeholder="YYYY-MM-DD" value={fromDate} onChange={setFromDate} />
              <TextField label="To Date:" placeholder="YYYY-MM-DD" value={toDate} onChange={setToDate} />
            </div>
          )}

          <div className="mt-6 border-t border-border pt-5">
            {searchError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{searchError}</p>
            )}
            <button
              type="submit"
              disabled={searching}
              className="inline-flex items-center gap-2 rounded-full bg-brand-green px-8 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:opacity-70"
            >
              {searching ? <Spinner className="h-4 w-4" /> : <Search size={15} />}
              {searching ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
      </div>

      {searched && (
        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="bg-panel p-6 sm:p-8">
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                      <th className="px-4 py-3">Reference No</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Sender</th>
                      <th className="px-4 py-3">Receiver</th>
                      <th className="px-4 py-3">Destination</th>
                      <th className="px-4 py-3">Payout Amount</th>
                      <th className="px-4 py-3">Payment Type</th>
                      <th className="px-4 py-3">Confirm ID</th>
                      <th className="px-4 py-3">Txn Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((txn) => (
                      <tr key={txn.id} className="border-b border-border bg-panel last:border-b-0">
                        <td className="px-4 py-3 font-medium text-heading">{txn.referenceNo}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              STATUS_STYLES[txn.status] ?? "bg-surface text-heading/70"
                            }`}
                          >
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-heading/80">
                          {txn.senderName}
                          <div className="text-xs text-muted">{txn.senderCountry}</div>
                        </td>
                        <td className="px-4 py-3 text-heading/80">
                          {txn.receiverName}
                          <div className="text-xs text-muted">{txn.receiverCountry}</div>
                        </td>
                        <td className="px-4 py-3 text-heading/80">{txn.destCountry}</td>
                        <td className="px-4 py-3 text-heading/80">
                          {txn.payoutAmount.toLocaleString()} {txn.payoutCurrency}
                        </td>
                        <td className="px-4 py-3 text-heading/80">{txn.paymentType}</td>
                        <td className="px-4 py-3 text-heading/80">{txn.confirmId}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-heading/80">
                          {txn.txnDate ? txn.txnDate.slice(0, 10) : "-"}
                        </td>
                      </tr>
                    ))}

                    {results.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted">
                          No matching transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
