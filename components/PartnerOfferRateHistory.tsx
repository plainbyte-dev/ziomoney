"use client";

import { useState } from "react";
import { useRates } from "@/contexts/RatesContext";
import { useDataMode } from "@/contexts/DataModeContext";
import PartnerOfferRateLookupForm from "./PartnerOfferRateLookupForm";
import { formatDate } from "@/lib/format";
import type { PartnerOfferRateLookupPayload, PartnerOfferRateRecord } from "@/data/partnerOfferRateData";

// Badge colors here are inlined per-component, matching this app's existing
// convention (e.g. HighRiskManagementPanel's riskBandClasses) — there's no
// shared StatusBadge component in this codebase to reuse.
const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-brand-green-light text-brand-green-dark",
  CANCELLED: "bg-red-50 text-red-600",
};

export default function PartnerOfferRateHistory() {
  const { isLive } = useDataMode();
  const { lookupPartnerOfferRateHistory } = useRates();

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<PartnerOfferRateRecord[]>([]);

  async function handleLookup(payload: PartnerOfferRateLookupPayload) {
    setLoading(true);
    setSearched(true);
    const records = await lookupPartnerOfferRateHistory(payload);
    setResults(records);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Offer Rate History</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — every proposed rate for a partner/corridor,
            regardless of status.
          </p>
        </div>
        <div className="bg-panel p-6 sm:p-8">
          <PartnerOfferRateLookupForm onSubmit={handleLookup} loading={loading} submitLabel="Search History" />
        </div>
      </div>

      {searched && (
        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-bold text-heading">Results ({results.length})</h2>
          </div>
          <div className="bg-panel p-6 sm:p-8">
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                      <th className="px-4 py-3">Unique ID</th>
                      <th className="px-4 py-3">Send / Receive</th>
                      <th className="px-4 py-3">Dest. Country</th>
                      <th className="px-4 py-3">Rate</th>
                      <th className="px-4 py-3">Quote Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Maker</th>
                      <th className="px-4 py-3">Checker</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((entry) => (
                      <tr key={entry.id} className="border-b border-border bg-panel last:border-b-0">
                        <td className="px-4 py-3 font-medium text-heading">{entry.uniqueId}</td>
                        <td className="px-4 py-3 text-heading/80">
                          {entry.sendCurrency} → {entry.receiveCurrency}
                        </td>
                        <td className="px-4 py-3 text-heading/80">{entry.destCountry}</td>
                        <td className="px-4 py-3 text-heading/80">{entry.rate || entry.directQuote}</td>
                        <td className="px-4 py-3 text-heading/80">{entry.quoteType}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              STATUS_STYLES[entry.status] ?? "bg-surface text-heading/70"
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-heading/80">{entry.makerUser}</td>
                        <td className="px-4 py-3 text-heading/80">{entry.checkerUser || "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-heading/80">
                          {formatDate(entry.createdDateTime)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-heading/80">
                          {formatDate(entry.updatedDateTime)}
                        </td>
                      </tr>
                    ))}

                    {results.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-4 py-10 text-center text-sm text-muted">
                          No offer rates found for this partner/corridor in the selected date range.
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
