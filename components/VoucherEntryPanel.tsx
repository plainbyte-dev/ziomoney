"use client";

import VoucherEntryForm from "./VoucherEntryForm";
import { useVouchers } from "@/contexts/VouchersContext";
import { nextVoucherNo, type VoucherLine, type VoucherLogEntry } from "@/data/voucherEntryData";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function VoucherEntryPanel() {
  const { entries, addEntry } = useVouchers();

  function handleSave(lines: VoucherLine[], narration: string) {
    const debitLine = lines.find((line) => line.drCr === "DR") ?? lines[0];
    const usdAmount = lines
      .filter((line) => line.currency === "USD")
      .reduce((sum, line) => sum + line.amount, 0);

    const entry: VoucherLogEntry = {
      id: `${Date.now()}`,
      voucherNo: nextVoucherNo(entries),
      partner: debitLine.ledger,
      dot: todayIso(),
      usd: usdAmount || debitLine.amount,
      settleRate: 1,
      amount: debitLine.amount,
      remarks: narration || "-",
      posted: true,
      status: "Not Approved",
    };

    addEntry(entry);
  }

  return <VoucherEntryForm onSave={handleSave} />;
}
