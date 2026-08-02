"use client";

import { ChevronRight, ShieldCheck, FileBarChart2 } from "lucide-react";
import { useTabs } from "@/contexts/TabsContext";

const reportLinks = [
  {
    key: "correspondence-report",
    title: "Correspondence Report",
    description:
      "Money-transfer correspondence between sending and payout partners, tracked from customer collection through to head-office settlement.",
    icon: FileBarChart2,
  },
  {
    key: "credit-limit",
    title: "Define Credit Limit",
    description: "Manage partner credit allocation and top-up limits by country.",
    icon: ShieldCheck,
  },
];

export default function ReportsIndexPanel() {
  const { openTab } = useTabs();

  return (
    <div className="rounded-2xl border border-border bg-panel p-6 shadow-card sm:p-8">
      <h1 className="text-2xl font-bold text-heading">Reports</h1>
      <p className="mt-1 text-sm text-muted">
        Choose a report to view partner and transaction data.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {reportLinks.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.key}
              onClick={() => openTab({ key: report.key, title: report.title })}
              className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-white px-5 py-4 text-left hover:border-brand-green"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-green-light text-brand-green-dark">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-heading">{report.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{report.description}</p>
                </div>
              </div>
              <ChevronRight size={18} className="shrink-0 text-muted" />
            </button>
          );
        })}
      </div>
    </div>
  );
}