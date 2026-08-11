"use client";

import { useCallback, useEffect, useState } from "react";
import { useDataMode } from "@/contexts/DataModeContext";
import { getAllConformedRemittances } from "./transactionApi";
import { confirmedRemittanceRecords, type RemittanceTransactionRecord } from "@/data/transactionData";

// Shared data source for Pending Payout Queue and Unpaid Transactions — both
// read from GET /getAllConformedRemittances; Unpaid is just a client-side
// filter over the same list, not a separate endpoint.
export function useConfirmedRemittances() {
  const { isLive } = useDataMode();
  const [entries, setEntries] = useState<RemittanceTransactionRecord[]>(() =>
    isLive ? [] : confirmedRemittanceRecords
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isLive) {
      setEntries(confirmedRemittanceRecords);
      return;
    }
    setLoading(true);
    setError(null);
    const response = await getAllConformedRemittances();
    setLoading(false);
    if (!response.success) {
      setError(response.message || "Could not load confirmed remittances.");
      return;
    }
    if (!Array.isArray(response.data)) {
      setError("Unexpected response shape (not an array) — confirm the real response format with backend.");
      return;
    }
    setEntries(response.data);
  }, [isLive]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  return { entries, loading, error, refresh };
}
