"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { riskScoreOptions, type RiskScoreRow } from "@/data/riskProfilingData";

export default function RiskScoreTable({
  initialRows,
  title = "High Risk Management",
  columnLabel = "Values",
}: {
  initialRows: RiskScoreRow[];
  title?: string;
  columnLabel?: string;
}) {
  const [rows, setRows] = useState(initialRows);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);

  function updateScore(index: number, score: number) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, score } : row)));
  }

  function handleUpdate(index: number) {
    setSavedIndex(index);
    setTimeout(() => setSavedIndex((current) => (current === index ? null : current)), 1200);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="bg-brand-blue px-6 py-4">
        <h1 className="text-lg font-bold text-white">{title}</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-brand-blue-light text-[11px] uppercase tracking-wide text-heading/70">
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">{columnLabel}</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Score</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Update</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.label} className={index % 2 === 0 ? "bg-white" : "bg-brand-green-light/30"}>
                  <td className="px-4 py-2.5 font-medium text-brand-green-dark">{row.label}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <select
                      value={row.score}
                      onChange={(event) => updateScore(index, Number(event.target.value))}
                      className="w-16 appearance-none rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                    >
                      {riskScoreOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <button
                      onClick={() => handleUpdate(index)}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-heading/80 hover:bg-border"
                    >
                      <Pencil size={12} />
                      {savedIndex === index ? "Updated" : "Update"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
