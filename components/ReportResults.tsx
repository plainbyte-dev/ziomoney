"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import ReportToolbar from "./ReportToolbar";
import StageLegend from "./StageLegend";
import TransactionCard from "./TransactionCard";
import CancelledTransactionCard from "./CancelledTransactionCard";
import {
  activeTransactions,
  cancelledTransactions,
  columnViews,
  type ReportSectionKey,
} from "@/data/transactionsData";

export default function ReportResults() {
  const [activeView, setActiveView] = useState<string>(columnViews[0]);
  const [visibleSections, setVisibleSections] = useState<
    Record<ReportSectionKey, boolean>
  >({
    collection: true,
    payout: true,
    settlementAgent: true,
    settlementPartner: true,
    headOffice: true,
  });

  function toggleSection(key: ReportSectionKey) {
    setVisibleSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div>
      <ReportToolbar
        activeView={activeView}
        onViewChange={setActiveView}
        visibleSections={visibleSections}
        onToggleSection={toggleSection}
      />

      <StageLegend />

      <section className="mt-2">
        <h2 className="mb-3 text-sm font-semibold text-heading">Active transactions</h2>
        <div className="flex flex-col gap-3">
          {activeTransactions.map((transaction, index) => (
            <TransactionCard
              key={`${transaction.refCode}-${index}`}
              transaction={transaction}
              visibleSections={visibleSections}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <button className="mb-3 flex items-center gap-1 text-sm font-semibold text-heading">
          Cancelled transactions
          <ChevronRight size={16} className="text-muted" />
        </button>
        <div className="flex flex-col gap-3">
          {cancelledTransactions.map((transaction, index) => (
            <CancelledTransactionCard
              key={`${transaction.refCode}-${index}`}
              transaction={transaction}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
