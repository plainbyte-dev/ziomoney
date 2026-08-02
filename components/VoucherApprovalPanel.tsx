"use client";

import { useState } from "react";
import VoucherApprovalTable from "./VoucherApprovalTable";
import { useVouchers } from "@/contexts/VouchersContext";

export default function VoucherApprovalPanel() {
  const { entries, approveEntry, removeEntry } = useVouchers();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleRemove(id: string) {
    removeEntry(id);
    setSelectedId((prev) => (prev === id ? null : prev));
  }

  return (
    <VoucherApprovalTable
      entries={entries}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onApprove={approveEntry}
      onRemove={handleRemove}
    />
  );
}
