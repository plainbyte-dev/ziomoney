"use client";

import { useState } from "react";
import { Check, CheckCircle2, Circle, Pencil, X } from "lucide-react";
import { highRiskManagementRows, riskBands, type HighRiskManagementRow } from "@/data/riskProfilingData";
import { useTabs } from "@/contexts/TabsContext";
import { tabRegistry } from "@/data/tabRegistry";

const actionLabels: Record<HighRiskManagementRow["action"], string> = {
  update: "Update",
  "country-risk": "Update Your Country Risk",
  "branch-risk": "Update Your Branch Risk",
  "update-link": "Update",
  check: "",
  "drill-in": "Update",
};

export default function HighRiskManagementPanel() {
  const { openTab } = useTabs();
  const [rows, setRows] = useState(highRiskManagementRows);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftWeight, setDraftWeight] = useState("");

  function handleDrillIn(tabKey: string, label: string) {
    const entry = tabRegistry[tabKey];
    openTab({ key: tabKey, title: entry?.title ?? label, closable: entry?.closable ?? true });
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setDraftWeight(String(rows[index].weight));
  }

  function cancelEdit() {
    setEditingIndex(null);
    setDraftWeight("");
  }

  function saveEdit(index: number) {
    const parsed = Number(draftWeight);
    setRows((prev) =>
      prev.map((row, i) => (i === index && !Number.isNaN(parsed) ? { ...row, weight: parsed } : row))
    );
    setEditingIndex(null);
  }

  function toggleEnabled(index: number) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, enabled: !row.enabled } : row))
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">High Risk Management</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-brand-blue-light text-[11px] uppercase tracking-wide text-heading/70">
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Type Name</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Weight</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.typeName} className={index % 2 === 0 ? "bg-panel" : "bg-brand-green-light/30"}>
                  <td className="px-4 py-2.5 font-medium text-brand-green-dark">{row.typeName}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        value={draftWeight}
                        onChange={(event) => setDraftWeight(event.target.value)}
                        className="w-16 rounded-lg border border-border bg-panel px-2 py-1 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                        autoFocus
                      />
                    ) : (
                      row.weight
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    {row.action === "check" ? (
                      <button
                        onClick={() => toggleEnabled(index)}
                        aria-label={row.enabled ? "Disable" : "Enable"}
                        className="text-brand-green"
                      >
                        {row.enabled ? (
                          <CheckCircle2 size={20} className="fill-brand-green text-white" />
                        ) : (
                          <Circle size={20} className="text-muted" />
                        )}
                      </button>
                    ) : editingIndex === index ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEdit(index)}
                          aria-label="Save"
                          className="rounded-lg bg-brand-green p-1.5 text-white hover:bg-brand-green-dark"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          aria-label="Cancel"
                          className="rounded-lg bg-surface p-1.5 text-heading/70 hover:bg-border"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : row.action === "update-link" ? (
                      <button
                        onClick={() => startEdit(index)}
                        className="text-sm font-medium text-brand-blue hover:underline"
                      >
                        {actionLabels[row.action]}
                      </button>
                    ) : row.action === "drill-in" ? (
                      <button
                        onClick={() => row.tabKey && handleDrillIn(row.tabKey, row.typeName)}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-heading/80 hover:bg-border"
                      >
                        <Pencil size={12} />
                        {actionLabels[row.action]}
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(index)}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-heading/80 hover:bg-border"
                      >
                        <Pencil size={12} />
                        {actionLabels[row.action]}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {riskBands.map((band) => (
            <div
              key={band.label}
              className="flex-1 rounded-lg border border-red-300 px-4 py-2 text-center text-sm font-semibold text-red-600"
            >
              {band.label}: {band.range}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
