"use client";

import { useState } from "react";
import { useRates } from "@/contexts/RatesContext";
import { useDataMode } from "@/contexts/DataModeContext";
import PartnerOfferRateLookupForm from "./PartnerOfferRateLookupForm";
import type { PartnerOfferRateLookupPayload, PartnerOfferRateRecord } from "@/data/partnerOfferRateData";

export default function PartnerOfferRateCurrent() {
  const { isLive } = useDataMode();
  const { lookupCurrentPartnerOfferRate } = useRates();

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<PartnerOfferRateRecord | null>(null);

  async function handleLookup(payload: PartnerOfferRateLookupPayload) {
    setLoading(true);
    setSearched(true);
    const record = await lookupCurrentPartnerOfferRate(payload);
    setResult(record);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Current Offer Rate</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — latest confirmed rate for a partner/corridor.
          </p>
        </div>
        <div className="bg-panel p-6 sm:p-8">
          <PartnerOfferRateLookupForm onSubmit={handleLookup} loading={loading} submitLabel="Look Up" />
        </div>
      </div>

      {searched && (
        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-bold text-heading">Latest Confirmed Rate</h2>
          </div>
          <div className="bg-panel p-6 sm:p-8">
            {result ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Unique ID</p>
                  <p className="mt-1 font-medium text-heading">{result.uniqueId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Partner</p>
                  <p className="mt-1 font-medium text-heading">{result.remittancePartner}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Destination</p>
                  <p className="mt-1 font-medium text-heading">{result.destCountry}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Send → Receive</p>
                  <p className="mt-1 font-medium text-heading">
                    {result.sendCurrency} → {result.receiveCurrency}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Rate</p>
                  <p className="mt-1 font-medium text-heading">{result.rate || result.directQuote}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Quote Type</p>
                  <p className="mt-1 font-medium text-heading">{result.quoteType}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Maker / Checker</p>
                  <p className="mt-1 font-medium text-heading">
                    {result.makerUser}
                    {result.checkerUser ? ` / ${result.checkerUser}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Updated</p>
                  <p className="mt-1 font-medium text-heading">{result.updatedDateTime.slice(0, 10)}</p>
                </div>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted">
                No confirmed rate found for this partner/corridor in the selected date range.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
