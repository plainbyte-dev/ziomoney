"use client";

import { Check, Trash2 } from "lucide-react";
import { formatAmount } from "@/lib/format";
import { voucherCompany, type VoucherLogEntry } from "@/data/voucherEntryData";
import Logo from "./Logo";

interface VoucherApprovalTableProps {
  entries: VoucherLogEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function VoucherApprovalTable({
  entries,
  selectedId,
  onSelect,
  onApprove,
  onRemove,
}: VoucherApprovalTableProps) {
  const selected = entries.find((entry) => entry.id === selectedId) ?? null;
  const status = selected?.status ?? "Not Approved";

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4 bg-white px-6 py-4">
        <div className="flex flex-col gap-1 text-sm text-heading/80">
          <Logo size="md" />
          <p>{voucherCompany.registration}</p>
          <p>{voucherCompany.postalCode}</p>
          <p>{voucherCompany.address}</p>
          <p>{voucherCompany.tel}</p>
        </div>
        <p
          className={`text-sm font-semibold ${
            status === "Approved" ? "text-brand-green" : "text-red-500"
          }`}
        >
          Voucher {status === "Approved" ? "Approved" : "Not Approved"}
        </p>
      </div>

      <div className="border-t border-border bg-surface px-6 py-2 text-sm text-heading/70">
        Invoice {entries.length}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
              <th className="px-4 py-3">SNO</th>
              <th className="px-4 py-3">V. NO</th>
              <th className="px-4 py-3">PARTNER</th>
              <th className="px-4 py-3">DOT</th>
              <th className="px-4 py-3 text-right">USD</th>
              <th className="px-4 py-3 text-right">SETTLE.RATE</th>
              <th className="px-4 py-3 text-right">AMOUNT</th>
              <th className="px-4 py-3">REMARKS</th>
              <th className="px-4 py-3">POSTED</th>
              <th className="px-4 py-3">APPROVE</th>
              <th className="px-4 py-3">DELETE</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry.id}
                onClick={() => onSelect(entry.id)}
                className={`cursor-pointer border-b border-border last:border-b-0 ${
                  selectedId === entry.id ? "bg-brand-green-light/40" : "bg-white"
                }`}
              >
                <td className="px-4 py-3 text-heading/80">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-heading">{entry.voucherNo}</td>
                <td className="px-4 py-3 text-heading/80">{entry.partner}</td>
                <td className="whitespace-nowrap px-4 py-3 text-heading/80">{entry.dot}</td>
                <td className="px-4 py-3 text-right text-heading/80">
                  {formatAmount(entry.usd)}
                </td>
                <td className="px-4 py-3 text-right text-heading/80">
                  {entry.settleRate.toFixed(4)}
                </td>
                <td className="px-4 py-3 text-right text-heading/80">
                  {formatAmount(entry.amount)}
                </td>
                <td className="px-4 py-3 text-heading/80">{entry.remarks}</td>
                <td className="px-4 py-3 text-heading/80">{entry.posted ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-heading/80">
                  {entry.status === "Approved" ? "Yes" : "-"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemove(entry.id);
                    }}
                    aria-label="Delete voucher"
                    className="text-muted hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}

            {entries.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-sm text-muted">
                  Voucher not found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 border-t border-border bg-panel px-6 py-4">
        <button
          type="button"
          onClick={() => selected && onApprove(selected.id)}
          disabled={!selected || selected.status === "Approved"}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green px-5 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check size={15} />
          Approve
        </button>
        <button
          type="button"
          onClick={() => selected && onRemove(selected.id)}
          disabled={!selected}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-5 py-2 text-sm font-medium text-heading hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={15} />
          Remove
        </button>
      </div>
    </div>
  );
}
