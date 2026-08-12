"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, FileBarChart2, RefreshCw, Settings, UserPlus } from "lucide-react";
import Logo from "./Logo";
import Button from "./Button";
import PartnerInfoTable from "./PartnerInfoTable";
import PartnerManageModal from "./PartnerManageModal";
import { usePartners } from "@/contexts/PartnersContext";
import { useTabs } from "@/contexts/TabsContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { insertAgentPartner } from "@/lib/partnersApi";

export default function PartnerInfoPanel() {
  const { entries, entriesLoading, entriesError, refreshEntries, addEntry, removeEntry } = usePartners();
  const { isLive } = useDataMode();
  const { openTab } = useTabs();
  const { notify } = useNotifications();
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [registeringAgent, setRegisteringAgent] = useState(false);

  const selectedEntry = entries.find((entry) => entry.id === selectedId) ?? null;

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

  async function handleRegisterAgentPartner() {
    setRegisteringAgent(true);

    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      addEntry({
        id: String(11000000 + entries.length + 1),
        partnerName: "remitteragent",
        partnerId: "remitteragent",
        country: "—",
        partnerType: "Agent",
        creditLimit: 0,
        hasBank: false,
        blocked: false,
      });
      setRegisteringAgent(false);
      return;
    }

    const response = await insertAgentPartner();
    setRegisteringAgent(false);
    if (!response.success || !response.data) {
      notify({
        title: "Could not register agent partner",
        message: response.message || "Please try again.",
      });
      return;
    }

    addEntry({
      id: String(response.data.id),
      partnerName: response.data.userName,
      partnerId: response.data.partnerCode,
      country: response.data.partnerCountry.toUpperCase(),
      partnerType: response.data.remitterType,
      creditLimit: response.data.accountBalance,
      hasBank: false,
      blocked: false,
      email: response.data.email,
      acceptPartnerPin: response.data.acceptPartnerPin,
      description: response.data.description,
      partnerAddress: response.data.partnerAddress,
      settlementCurrency: response.data.settlementCurrency,
      apiUser: response.data.apiUser,
      balance: response.data.balance,
      registeredDate: response.data.registeredDate,
      updatedDate: response.data.updatedDate,
    });
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
          <Button
            variant="secondary"
            onClick={() => setManageOpen(true)}
            disabled={!selectedId}
            icon={<Settings size={16} />}
          >
            Manage
          </Button>
          {/* <Button
            variant="secondary"
            onClick={handleRegisterAgentPartner}
            loading={registeringAgent}
            icon={<UserPlus size={16} />}
          >
            Register Agent Partner
          </Button> */}
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

      {manageOpen && (
        <PartnerManageModal entry={selectedEntry} onClose={() => setManageOpen(false)} />
      )}
    </div>
  );
}
