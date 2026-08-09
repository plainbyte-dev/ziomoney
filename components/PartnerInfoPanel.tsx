"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, FileBarChart2, RefreshCw } from "lucide-react";
import Logo from "./Logo";
import Button from "./Button";
import PartnerInfoTable from "./PartnerInfoTable";
import { usePartners } from "@/contexts/PartnersContext";
import { useTabs } from "@/contexts/TabsContext";
import { useDataMode } from "@/contexts/DataModeContext";

export default function PartnerInfoPanel() {
  const { entries, entriesLoading, entriesError, refreshEntries, removeEntry } = usePartners();
  const { isLive } = useDataMode();
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

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4 bg-panel px-6 py-4">
        <Logo size="md" />
        <div className="text-right">
          <h1 className="text-lg font-bold text-heading">Partner Info</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"}
          </p>
        </div>
      </div>

      <div className="border-t border-border bg-panel p-6 sm:p-8">
        {entriesError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{entriesError}</p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={refreshEntries}
            disabled={entriesLoading}
            icon={<RefreshCw size={16} className={entriesLoading ? "animate-spin" : undefined} />}
          >
            Refresh
          </Button>
          <Button
            onClick={() => openTab({ key: "partner-create", title: "New Partner" })}
            icon={<Plus size={16} />}
          >
            New
          </Button>
          <Button
            variant="secondary"
            onClick={handleDelete}
            disabled={!selectedId}
            icon={<Trash2 size={16} />}
          >
            Delete
          </Button>
          <Button variant="secondary" icon={<FileBarChart2 size={16} />}>
            Reports
          </Button>
        </div>

        <div className="mt-4">
          <PartnerInfoTable
            entries={filteredEntries}
            countryFilter={countryFilter}
            onCountryChange={setCountryFilter}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}
