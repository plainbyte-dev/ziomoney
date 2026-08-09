"use client";

import { useMemo, useState } from "react";
import CreditLimitBanner from "./CreditLimitBanner";
import CreditLimitTable from "./CreditLimitTable";
import CreditLimitLogModal from "./CreditLimitLogModal";
import Pagination from "./Pagination";
import {
  creditLimitEntries as initialEntries,
  creditLimitCountryOptions,
  yourTopUpLimit,
  PAGE_SIZE,
  type CreditLimitEntry,
} from "@/data/creditLimitData";

export default function DefineCreditLimitPanel() {
  const [entries, setEntries] = useState<CreditLimitEntry[]>(initialEntries);
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [addLimitValues, setAddLimitValues] = useState<Record<string, string>>({});
  const [logPartner, setLogPartner] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    if (countryFilter === "ALL") return entries;
    return entries.filter((entry) => entry.country === countryFilter);
  }, [entries, countryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const pageEntries = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEntries.slice(start, start + PAGE_SIZE);
  }, [filteredEntries, currentPage]);

  function handleCountryChange(value: string) {
    setCountryFilter(value);
    setCurrentPage(1);
  }

  function handleAddLimitChange(id: string, value: string) {
    setAddLimitValues((prev) => ({ ...prev, [id]: value }));
  }

  function handleUpdate(entry: CreditLimitEntry) {
    const raw = addLimitValues[entry.id];
    const amount = Number(raw);
    if (!raw || Number.isNaN(amount) || amount === 0) return;

    setEntries((prev) =>
      prev.map((item) =>
        item.id === entry.id
          ? { ...item, topUpLimit: item.topUpLimit + amount }
          : item
      )
    );
    setAddLimitValues((prev) => ({ ...prev, [entry.id]: "" }));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Define Credit Limit</h1>
      </div>

      <CreditLimitBanner
        topUpAmount={yourTopUpLimit.amount}
        topUpCurrency={yourTopUpLimit.currency}
        countryOptions={creditLimitCountryOptions}
        countryFilter={countryFilter}
        onCountryChange={handleCountryChange}
      />

      <div className="bg-panel p-6 sm:p-8">
        <CreditLimitTable
          entries={pageEntries}
          addLimitValues={addLimitValues}
          onAddLimitChange={handleAddLimitChange}
          onUpdate={handleUpdate}
          onViewLog={(entry) => setLogPartner(entry.partner)}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={filteredEntries.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      <CreditLimitLogModal partnerName={logPartner} onClose={() => setLogPartner(null)} />
    </div>
  );
}