"use client";

import { partnerSummaryRows } from "@/data/correspondenceReportData";

interface PartnerSummaryTableProps {
  fromDate: string;
  toDate: string;
  onSelectPartner: (partnerName: string) => void;
}

const columns = [
  { key: "generate", label: "Generate" },
  { key: "partnerName", label: "Partner Name" },
  { key: "nos", label: "Nos" },
  { key: "currency", label: "Cur" },
  { key: "collected", label: "Collected" },
  { key: "charge", label: "Charge" },
  { key: "partnerComm", label: "Partner Comm" },
  { key: "agentExGain", label: "Agent Ex-Gain" },
  { key: "settlementAmt", label: "Settlement Amt" },
  { key: "hoComm", label: "HO Comm" },
  { key: "payPartnerComm", label: "Pay Partner Comm" },
  { key: "avgRate", label: "Avg Rate" },
] as const;

function toNumber(value: string) {
  return Number(value.replace(/[(),]/g, (m) => (m === "(" ? "-" : m === ")" ? "" : "")));
}

export default function PartnerSummaryTable({
  fromDate,
  toDate,
  onSelectPartner,
}: PartnerSummaryTableProps) {
  const totals = partnerSummaryRows.reduce(
    (acc, row) => {
      acc.nos += row.nos;
      acc.collected += toNumber(row.collected);
      acc.partnerComm += toNumber(row.partnerComm);
      acc.settlementAmt += toNumber(row.settlementAmt);
      acc.hoComm += toNumber(row.hoComm);
      return acc;
    },
    { nos: 0, collected: 0, partnerComm: 0, settlementAmt: 0, hoComm: 0 }
  );

  return (
    <div>
      <p className="text-xs text-muted">
        From {fromDate} To {toDate}
      </p>
      <p className="mt-1 text-sm font-semibold text-red-600">
        Transaction Summary by Sending Partner wise : Partner: BENF Partner: By Confirm Date From{" "}
        {fromDate} To {toDate}
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="bg-surface text-[11px] uppercase tracking-wide text-muted">
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partnerSummaryRows.map((row, index) => (
              <tr
                key={`${row.partnerName}-${index}`}
                className={index % 2 === 0 ? "bg-white" : "bg-surface/50"}
              >
                <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.generate}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <button
                    onClick={() => onSelectPartner(row.partnerName)}
                    className="font-medium text-brand-blue hover:underline"
                  >
                    {row.partnerName}
                  </button>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-heading/80">{row.nos}</td>
                <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.currency}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-heading/80">{row.collected}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-heading/80">{row.charge}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-heading/80">{row.partnerComm}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-heading/80">{row.agentExGain}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-heading/80">{row.settlementAmt}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-heading/80">{row.hoComm}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-heading/80">{row.payPartnerComm}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right text-heading/80">{row.avgRate}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-surface font-semibold text-heading">
              <td className="whitespace-nowrap px-3 py-2" colSpan={2}>
                Total
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right">{totals.nos}</td>
              <td className="whitespace-nowrap px-3 py-2" />
              <td className="whitespace-nowrap px-3 py-2 text-right">
                {totals.collected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="whitespace-nowrap px-3 py-2" />
              <td className="whitespace-nowrap px-3 py-2 text-right">
                {totals.partnerComm.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="whitespace-nowrap px-3 py-2" />
              <td className="whitespace-nowrap px-3 py-2 text-right">
                {totals.settlementAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right">
                {totals.hoComm.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="whitespace-nowrap px-3 py-2" colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
