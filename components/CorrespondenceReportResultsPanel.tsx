"use client";

import { useState } from "react";
import PartnerSummaryTable from "./PartnerSummaryTable";
import DailyTransactionTable from "./DailyTransactionTable";
import { reportDefaults } from "@/data/staticData";

type ReportView = "summary" | "daily";

interface CorrespondenceReportResultsPanelProps {
  defaultView?: ReportView;
}

export default function CorrespondenceReportResultsPanel({
  defaultView = "summary",
}: CorrespondenceReportResultsPanelProps) {
  const [view, setView] = useState<ReportView>(defaultView);
  const [selectedPartner, setSelectedPartner] = useState<string | undefined>(undefined);

  function handleSelectPartner(partnerName: string) {
    setSelectedPartner(partnerName);
    setView("daily");
  }

  function handleBackToSummary() {
    setView("summary");
    setSelectedPartner(undefined);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">
          {view === "summary" ? "Summary Report" : "Daily Report"}
        </h1>
        <div className="flex gap-2 rounded-full bg-surface p-1">
          <button
            onClick={handleBackToSummary}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              view === "summary"
                ? "bg-panel text-brand-blue shadow-card"
                : "text-heading/60 hover:text-heading"
            }`}
          >
            Summary Report
          </button>
          <button
            onClick={() => setView("daily")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              view === "daily"
                ? "bg-panel text-brand-blue shadow-card"
                : "text-heading/60 hover:text-heading"
            }`}
          >
            Daily Report
          </button>
        </div>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        {view === "summary" ? (
          <PartnerSummaryTable
            fromDate={reportDefaults.fromDate}
            toDate={reportDefaults.toDate}
            onSelectPartner={handleSelectPartner}
          />
        ) : (
          <DailyTransactionTable
            fromDate={reportDefaults.fromDate}
            toDate={reportDefaults.toDate}
            partnerFilter={selectedPartner}
            onBack={handleBackToSummary}
          />
        )}
      </div>
    </div>
  );
}
