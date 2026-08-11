"use client";

import { useCallback, useEffect, useState } from "react";
import { useDataMode } from "@/contexts/DataModeContext";
import { listTransfers } from "./transferApi";
import type { PagedTransfers, TransferRecord } from "@/data/transferData";

const DEMO_PAGE_SIZE = 10;

function emptyPage(page: number, size: number): PagedTransfers<TransferRecord> {
  return { content: [], totalPages: 0, totalElements: 0, number: page, size, first: page === 0, last: true, empty: true };
}

// Shared Track A (/transfers) paginated-fetch logic — any list view backed
// by that endpoint (My Transactions, or a future filtered view) should use
// this instead of reimplementing pagination per screen.
export function usePaginatedTransfers(demoRecords: TransferRecord[], pageSize = DEMO_PAGE_SIZE) {
  const { isLive } = useDataMode();
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState<PagedTransfers<TransferRecord>>(() => emptyPage(0, pageSize));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isLive) {
      const start = page * pageSize;
      const content = demoRecords.slice(start, start + pageSize);
      setPageData({
        content,
        totalPages: Math.max(1, Math.ceil(demoRecords.length / pageSize)),
        totalElements: demoRecords.length,
        number: page,
        size: pageSize,
        first: page === 0,
        last: start + pageSize >= demoRecords.length,
        empty: content.length === 0,
      });
      return;
    }
    setLoading(true);
    setError(null);
    const response = await listTransfers({ page, size: pageSize });
    setLoading(false);
    if (!response.success || !response.data) {
      setError(response.message || "Could not load transfers.");
      return;
    }
    setPageData(response.data);
  }, [isLive, page, pageSize, demoRecords]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, page]);

  return {
    entries: pageData.content,
    page,
    setPage,
    totalPages: pageData.totalPages,
    totalElements: pageData.totalElements,
    first: pageData.first,
    last: pageData.last,
    loading,
    error,
    refresh,
  };
}
