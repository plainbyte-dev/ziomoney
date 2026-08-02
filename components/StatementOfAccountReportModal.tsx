"use client";

import { X, Download } from "lucide-react";
import { formatAmount } from "@/lib/format";
import { downloadHtmlTableAsExcel } from "@/lib/exportExcel";
import { forexCompanyHeader, type SoaReportDetail } from "@/data/statementOfAccountReportData";

function amt(value: number): string {
  return formatAmount(value);
}

export function buildSoaReportTableHtml(detail: SoaReportDetail): string {
  const rows = detail.transactions
    .map(
      (txn) => `
        <tr>
          <td>${txn.date} ${txn.time}</td>
          <td>${txn.txnType}</td>
          <td>${txn.description}</td>
          <td align="right">${amt(txn.dr)}</td>
          <td align="right">${amt(txn.cr)}</td>
          <td align="right">${amt(txn.comm)}</td>
          <td align="right">${amt(txn.settleAmt)}</td>
          <td align="right">${amt(txn.balance)} ${detail.currency}</td>
        </tr>`
    )
    .join("");

  return `
    <table border="1" cellspacing="0" cellpadding="4">
      <tr><td colspan="8"><b>${detail.partner} - STATEMENT OF ACCOUNT</b></td></tr>
      <tr><td colspan="8">Detail Report: from ${detail.reportRangeLabel}</td></tr>
      <tr>
        <th>Date</th><th>Txn Type</th><th>Descriptions</th><th>Dr</th><th>Cr</th>
        <th>Comm</th><th>Settle.Amt</th><th>Balance</th>
      </tr>
      <tr>
        <td>${detail.openingBalanceDate}</td><td></td><td>Opening Balance</td>
        <td></td><td></td><td></td><td></td>
        <td align="right">${amt(detail.openingBalance)} ${detail.currency}</td>
      </tr>
      ${rows}
      <tr>
        <td colspan="3"><b>Total ${detail.currency}</b></td>
        <td align="right"><b>${amt(detail.totals.dr)}</b></td>
        <td align="right"><b>${amt(detail.totals.cr)}</b></td>
        <td align="right"><b>${amt(detail.totals.comm)}</b></td>
        <td align="right"><b>${amt(detail.totals.settleAmt)}</b></td>
        <td align="right"><b>${amt(detail.closingBalance)} ${detail.currency}</b></td>
      </tr>
      <tr><td colspan="8"></td></tr>
      <tr><td colspan="8"><b>SUMMARY REPORT</b></td></tr>
      <tr><td colspan="2">Opening Balance</td><td colspan="6" align="right">(+) ${amt(detail.openingBalance)} ${detail.currency}</td></tr>
      <tr><td colspan="2">Send Principle</td><td colspan="6" align="right">${amt(detail.sendPrinciple)} ${detail.currency}</td></tr>
      <tr><td colspan="2">Send Commission</td><td colspan="6" align="right">${amt(detail.sendCommission)} ${detail.currency}</td></tr>
      <tr><td colspan="2"><b>Closing Balance</b></td><td colspan="6" align="right"><b>${amt(detail.closingBalance)} ${detail.currency}</b></td></tr>
      <tr><td colspan="2">Voucher Not Approved</td><td colspan="6" align="right">${amt(detail.voucherNotApproved)} ${detail.currency}</td></tr>
      <tr><td colspan="2">Total Un-approve TRN (${detail.totalUnapproveTrn})</td><td colspan="6" align="right">(+) ${amt(detail.totalUnapproveTrn)} ${detail.currency}</td></tr>
      <tr><td colspan="8" align="right">${detail.netPosition}</td></tr>
      <tr><td colspan="8" align="right">${detail.netClosingNote} ${amt(detail.closingBalance)} ${detail.currency}</td></tr>
    </table>`;
}

export default function StatementOfAccountReportModal({
  detail,
  onClose,
}: {
  detail: SoaReportDetail | null;
  onClose: () => void;
}) {
  if (!detail) return null;
  const report = detail;

  function handleExport() {
    downloadHtmlTableAsExcel(
      `SOA-${report.partner.replace(/\s+/g, "-")}.xls`,
      buildSoaReportTableHtml(report)
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-heading/40 px-4 py-6">
      <div className="flex max-h-full w-full max-w-4xl flex-col rounded-2xl bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <p className="text-sm font-semibold text-heading">Statement of Account</p>
          <button onClick={onClose} className="text-muted hover:text-heading">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="flex flex-col justify-between gap-4 border-b-4 border-brand-blue pb-4 sm:flex-row">
            <div>
              <p className="text-xl font-extrabold tracking-tight text-brand-blue">
                {forexCompanyHeader.name}
              </p>
              <p className="text-xs text-heading/70">{forexCompanyHeader.regNo}</p>
              <p className="text-xs text-heading/70">{forexCompanyHeader.postalCode}</p>
              <p className="text-xs text-heading/70">{forexCompanyHeader.address}</p>
              <p className="text-xs text-heading/70">{forexCompanyHeader.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold uppercase text-heading underline">
                {detail.partner}
              </p>
              <p className="text-sm font-bold uppercase text-heading underline">
                Statement of Account
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm font-semibold text-red-600">
            Detail Report: from{" "}
            <span className="italic">{detail.reportRangeLabel}</span>
          </p>

          <div className="mt-3 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[820px] border-collapse text-left text-xs">
              <thead>
                <tr className="bg-brand-green-light/60 text-heading/80">
                  <th className="border border-border px-3 py-2">Date</th>
                  <th className="border border-border px-3 py-2">Txn Type</th>
                  <th className="border border-border px-3 py-2">Descriptions</th>
                  <th className="border border-border px-3 py-2 text-right">Dr</th>
                  <th className="border border-border px-3 py-2 text-right">Cr</th>
                  <th className="border border-border px-3 py-2 text-right">Comm</th>
                  <th className="border border-border px-3 py-2 text-right">Settle.Amt</th>
                  <th className="border border-border px-3 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-3 py-2 text-heading/80">
                    {detail.openingBalanceDate}
                  </td>
                  <td className="border border-border px-3 py-2" />
                  <td className="border border-border px-3 py-2 text-heading/80">
                    Opening Balance
                  </td>
                  <td className="border border-border px-3 py-2" />
                  <td className="border border-border px-3 py-2" />
                  <td className="border border-border px-3 py-2" />
                  <td className="border border-border px-3 py-2" />
                  <td className="border border-border px-3 py-2 text-right text-heading/80">
                    {amt(detail.openingBalance)} {detail.currency}
                  </td>
                </tr>
                {detail.transactions.map((txn, i) => (
                  <tr key={i}>
                    <td className="border border-border px-3 py-2 text-heading/80">
                      {detail.transactions[i].date} {txn.time}
                    </td>
                    <td className="border border-border px-3 py-2 font-medium text-brand-blue">
                      {txn.txnType}
                    </td>
                    <td className="border border-border px-3 py-2 text-heading/80">
                      {txn.description}
                    </td>
                    <td className="border border-border px-3 py-2 text-right text-heading/80">
                      {amt(txn.dr)}
                    </td>
                    <td className="border border-border px-3 py-2 text-right text-heading/80">
                      {amt(txn.cr)}
                    </td>
                    <td className="border border-border px-3 py-2 text-right text-heading/80">
                      {amt(txn.comm)}
                    </td>
                    <td className="border border-border px-3 py-2 text-right text-heading/80">
                      {amt(txn.settleAmt)}
                    </td>
                    <td className="border border-border px-3 py-2 text-right text-heading/80">
                      {amt(txn.balance)} {detail.currency}
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold text-heading">
                  <td className="border border-border px-3 py-2" colSpan={3}>
                    Total {detail.currency}
                  </td>
                  <td className="border border-border px-3 py-2 text-right">
                    {amt(detail.totals.dr)}
                  </td>
                  <td className="border border-border px-3 py-2 text-right">
                    {amt(detail.totals.cr)}
                  </td>
                  <td className="border border-border px-3 py-2 text-right">
                    {amt(detail.totals.comm)}
                  </td>
                  <td className="border border-border px-3 py-2 text-right">
                    {amt(detail.totals.settleAmt)}
                  </td>
                  <td className="border border-border px-3 py-2 text-right">
                    {amt(detail.closingBalance)} {detail.currency}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-5 max-w-md overflow-hidden rounded-lg border border-border">
            <p className="bg-brand-green-light/60 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-heading/80">
              Summary Report
            </p>
            <SummaryRow label="Opening Balance" value={`(+) ${amt(detail.openingBalance)} ${detail.currency}`} />
            <SummaryRow label="Send Principle" value={`${amt(detail.sendPrinciple)} ${detail.currency}`} />
            <SummaryRow label="Send Commission" value={`${amt(detail.sendCommission)} ${detail.currency}`} />
            <SummaryRow
              label="Closing Balance"
              value={`${amt(detail.closingBalance)} ${detail.currency}`}
              bold
            />
            <SummaryRow label="Voucher Not Approved" value={`${amt(detail.voucherNotApproved)} ${detail.currency}`} />
            <SummaryRow
              label={`Total Un-approve TRN (${detail.totalUnapproveTrn})`}
              value={`(+) ${amt(detail.totalUnapproveTrn)} ${detail.currency}`}
            />
          </div>

          <p className="mt-3 text-right text-sm italic text-red-600">
            {detail.netPosition}
          </p>
          <p className="mt-1 text-right text-xs italic text-red-600">
            {detail.netClosingNote}{" "}
            <span className="font-bold">
              {amt(detail.closingBalance)} {detail.currency}
            </span>
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-2.5 text-sm font-semibold text-heading hover:bg-surface"
          >
            <Download size={16} />
            Export to Excel
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-brand-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs first:border-t-0">
      <span className={bold ? "font-bold text-heading" : "text-heading/80"}>{label}</span>
      <span className={bold ? "font-bold text-heading" : "text-heading/80"}>{value}</span>
    </div>
  );
}
