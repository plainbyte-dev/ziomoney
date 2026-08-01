"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import {
  columnViews,
  reportSections,
  type ReportSectionKey,
} from "@/data/transactionsData";

interface ReportToolbarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  visibleSections: Record<ReportSectionKey, boolean>;
  onToggleSection: (key: ReportSectionKey) => void;
}

export default function ReportToolbar({
  activeView,
  onViewChange,
  visibleSections,
  onToggleSection,
}: ReportToolbarProps) {
  const [customizeOpen, setCustomizeOpen] = useState(false);

  return (
    <div className="relative flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
        <Search size={16} className="text-muted" />
        <input
          type="text"
          placeholder="Search by payout country, agent or reference..."
          className="w-full bg-transparent text-sm text-heading placeholder:text-muted focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted">Columns:</span>
        {columnViews.map((view) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
              activeView === view
                ? "bg-brand-green-light text-brand-green-dark"
                : "text-heading/70 hover:bg-surface"
            }`}
          >
            {view}
          </button>
        ))}

        <div className="relative">
          <button
            onClick={() => setCustomizeOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 font-medium text-heading/70 hover:bg-surface"
          >
            Customize
            <ChevronDown size={14} />
          </button>

          {customizeOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-xl border border-border bg-white p-4 shadow-card">
              <p className="text-sm font-semibold text-heading">Show sections</p>
              <p className="mt-1 text-xs text-muted">
                Turn whole stages on or off — no need to hunt through 25 individual
                columns.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                {reportSections.map((section) => (
                  <div
                    key={section.key}
                    className="flex items-center justify-between text-sm text-heading/80"
                  >
                    {section.label}
                    <button
                      onClick={() => onToggleSection(section.key)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        visibleSections[section.key] ? "bg-brand-green" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                          visibleSections[section.key]
                            ? "translate-x-4"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
