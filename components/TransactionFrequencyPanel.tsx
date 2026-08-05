"use client";

import { useState } from "react";
import { Circle } from "lucide-react";
import { transactionFrequencyRules, type TransactionFrequencyRule } from "@/data/riskProfilingData";

const emptyDraft = {
  sendCountry: "",
  ruleName: "",
  payoutPartner: "",
  paymentType: "",
  applyIfAmtMore: "",
  requiredField1: "",
  requiredField2: "",
  requiredField3: "",
  validationMsg: "",
};

export default function TransactionFrequencyPanel() {
  const [rows, setRows] = useState(transactionFrequencyRules);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);

  function handleDelete(sno: number) {
    setRows((prev) => prev.filter((row) => row.sno !== sno));
  }

  function startAdd() {
    setDraft(emptyDraft);
    setIsAdding(true);
  }

  function cancelAdd() {
    setIsAdding(false);
    setDraft(emptyDraft);
  }

  function saveAdd() {
    if (!draft.ruleName.trim()) return;
    const nextSno = rows.reduce((max, row) => Math.max(max, row.sno), 0) + 1;
    const newRule: TransactionFrequencyRule = {
      sno: nextSno,
      sendCountry: draft.sendCountry || "All",
      ruleName: draft.ruleName,
      payoutPartner: draft.payoutPartner || "All Payout Agent",
      paymentType: draft.paymentType || "All Type",
      applyIfAmtMore: draft.applyIfAmtMore,
      requiredField1: draft.requiredField1,
      requiredField2: draft.requiredField2,
      requiredField3: draft.requiredField3,
      validationMsg: draft.validationMsg,
    };
    setRows((prev) => [...prev, newRule]);
    setIsAdding(false);
    setDraft(emptyDraft);
  }

  function updateDraft(field: keyof typeof emptyDraft, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="bg-brand-blue px-6 py-4">
        <h1 className="text-lg font-bold text-white">Transaction Frequency</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-brand-blue-light text-[11px] uppercase tracking-wide text-heading/70">
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Sno</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Send Country</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Rule Name</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Payout Partner</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Payment Type</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Apply If Amt More</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Required Field1</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Required Field2</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Required Field3</th>
                <th className="border-b border-border px-4 py-2.5 text-left font-semibold">Validation Msg</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.sno} className={index % 2 === 0 ? "bg-white" : "bg-brand-green-light/30"}>
                  <td className="whitespace-nowrap px-4 py-2.5 font-medium text-brand-blue">{row.sno}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">
                    <div className="flex items-center gap-1.5">
                      {row.flagged && <Circle size={10} className="fill-orange-500 text-orange-500" />}
                      {row.sendCountry}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-heading">{row.ruleName}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.payoutPartner}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.paymentType}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.applyIfAmtMore}</td>
                  <td className="px-4 py-2.5 text-heading/80">{row.requiredField1}</td>
                  <td className="px-4 py-2.5 text-heading/80">{row.requiredField2}</td>
                  <td className="px-4 py-2.5 text-heading/80">{row.requiredField3}</td>
                  <td className="px-4 py-2.5 text-heading/80">{row.validationMsg}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <button
                      onClick={() => handleDelete(row.sno)}
                      className="text-sm font-medium text-brand-blue hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {isAdding && (
                <tr className="bg-brand-blue-light/40">
                  <td className="px-4 py-2.5 text-heading/50">New</td>
                  {(
                    [
                      "sendCountry",
                      "ruleName",
                      "payoutPartner",
                      "paymentType",
                      "applyIfAmtMore",
                      "requiredField1",
                      "requiredField2",
                      "requiredField3",
                      "validationMsg",
                    ] as (keyof typeof emptyDraft)[]
                  ).map((field) => (
                    <td key={field} className="px-2 py-2">
                      <input
                        type="text"
                        value={draft[field]}
                        onChange={(event) => updateDraft(field, event.target.value)}
                        className="w-full min-w-[110px] rounded-lg border border-border px-2 py-1 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                      />
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveAdd}
                        className="rounded-lg bg-brand-green px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-green-dark"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelAdd}
                        className="rounded-lg bg-surface px-2.5 py-1 text-xs font-semibold text-heading/70 hover:bg-border"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isAdding && (
          <button
            onClick={startAdd}
            className="mt-4 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-heading/80 hover:bg-border"
          >
            Add New
          </button>
        )}
      </div>
    </div>
  );
}
