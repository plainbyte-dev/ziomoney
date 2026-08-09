"use client";

import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import Button from "./Button";
import { savedReports } from "@/data/reportWriterData";

export default function ReportListPanel() {
  const [selectedId, setSelectedId] = useState(savedReports[1]?.id ?? savedReports[0].id);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [viewed, setViewed] = useState(false);

  const selectedReport = savedReports.find((r) => r.id === selectedId) ?? savedReports[0];

  function selectReport(id: number) {
    setSelectedId(id);
    setParamValues({});
    setViewed(false);
  }

  function updateParam(label: string, value: string) {
    setParamValues((prev) => ({ ...prev, [label]: value }));
    setViewed(false);
  }

  const missingRequired = selectedReport.params.some(
    (param) => param.required && !paramValues[param.label]?.trim()
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="grid grid-cols-1 sm:grid-cols-[280px_1fr]">
        <div className="border-b border-border bg-panel p-4 sm:border-b-0 sm:border-r">
          <p className="mb-2 text-sm font-bold text-heading">Report List</p>
          <button className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline">
            <Plus size={14} />
            Add New Report
          </button>
          <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1 text-sm">
            {savedReports.map((report) => (
              <button
                key={report.id}
                onClick={() => selectReport(report.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left ${
                  report.id === selectedId
                    ? "bg-brand-blue-light font-semibold text-brand-blue"
                    : "text-brand-blue hover:bg-surface"
                }`}
              >
                <span className="text-heading/50">[{report.id}]</span>
                <span className="truncate">» {report.name}</span>
                <FileText size={12} className="ml-auto shrink-0 text-heading/40" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="border-b border-border px-6 py-3">
            <h2 className="text-sm font-bold text-heading">{selectedReport.name}</h2>
          </div>
          <div className="bg-panel p-6 sm:p-8">
            {selectedReport.params.length === 0 ? (
              <p className="text-sm text-muted">This report has no input parameters.</p>
            ) : (
              <div className="max-w-md space-y-4">
                {selectedReport.params.map((param) => (
                  <div key={param.label} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 text-sm text-heading/80">{param.label}</span>
                    <input
                      value={paramValues[param.label] ?? ""}
                      onChange={(event) => updateParam(param.label, event.target.value)}
                      className="flex-1 rounded-lg border border-border bg-panel px-3 py-1.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                    />
                    {param.required && <span className="text-red-500">*</span>}
                  </div>
                ))}
              </div>
            )}

            <Button
              size="md"
              className="mt-5"
              onClick={() => setViewed(true)}
              disabled={missingRequired}
              icon={<FileText size={14} />}
            >
              View Detail
            </Button>

            {viewed && (
              <p className="mt-4 rounded-lg bg-brand-green-light/40 px-3 py-2 text-sm text-brand-green-dark">
                Running &ldquo;{selectedReport.name}&rdquo;
                {selectedReport.params.length > 0 &&
                  " with " + selectedReport.params.map((p) => `${p.label} ${paramValues[p.label] ?? ""}`).join(", ")}
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
