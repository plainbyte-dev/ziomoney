"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import Button from "./Button";
import { highRiskBranches, riskScoreOptions } from "@/data/riskProfilingData";

export default function HighRiskBranchesPanel() {
  const [rows, setRows] = useState(highRiskBranches);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);

  function updateScore(index: number, value: string) {
    const riskScore = value === "" ? null : Number(value);
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, riskScore } : row)));
  }

  function handleUpdate(index: number) {
    setSavedIndex(index);
    setTimeout(() => setSavedIndex((current) => (current === index ? null : current)), 1200);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">High Risk Branches</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-brand-blue-light text-[11px] uppercase tracking-wide text-heading/70">
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Agent Code</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Country</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Branch Name</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Risk Score</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Update</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.agentCode} className={index % 2 === 0 ? "bg-panel" : "bg-brand-green-light/30"}>
                  <td className="whitespace-nowrap px-4 py-2.5 font-medium text-brand-green-dark">{row.agentCode}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.country}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.branchName}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <select
                      value={row.riskScore ?? ""}
                      onChange={(event) => updateScore(index, event.target.value)}
                      className="w-28 appearance-none rounded-lg border border-border bg-panel px-2 py-1.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                    >
                      <option value="">--Select--</option>
                      {riskScoreOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdate(index)}
                      icon={<Pencil size={12} />}
                    >
                      {savedIndex === index ? "Updated" : "Update"}
                    </Button>
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
