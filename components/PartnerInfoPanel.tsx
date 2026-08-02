"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, FileBarChart2 } from "lucide-react";
import Logo from "./Logo";
import PartnerInfoTable from "./PartnerInfoTable";
import { usePartners } from "@/contexts/PartnersContext";
import { useTabs } from "@/contexts/TabsContext";

export default function PartnerInfoPanel() {
  const { entries, removeEntry } = usePartners();
  const { openTab } = useTabs();
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    if (countryFilter === "ALL") return entries;
    return entries.filter((entry) => entry.country === countryFilter);
  }, [entries, countryFilter]);

  function handleDelete() {
    if (!selectedId) return;
    removeEntry(selectedId);
    setSelectedId(null);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4 bg-white px-6 py-4">
        <Logo size="md" />
        <h1 className="text-lg font-bold text-heading">Partner Info</h1>
      </div>

      <div className="border-t border-border bg-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={() => openTab({ key: "partner-create", title: "New Partner" })}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark"
          >
            <Plus size={16} />
            New
          </button>
          <button
            onClick={handleDelete}
            disabled={!selectedId}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-heading hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} />
            Delete
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-heading hover:bg-surface">
            <FileBarChart2 size={16} />
            Reports
          </button>
        </div>

        <div className="mt-4">
          <PartnerInfoTable
            entries={filteredEntries}
            countryFilter={countryFilter}
            onCountryChange={setCountryFilter}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>
    </div>
  );
}
