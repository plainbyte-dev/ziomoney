"use client";

import { useMemo, useState } from "react";
import LedgerListHeader from "./LedgerListHeader";
import LedgerTable from "./LedgerTable";
import Pagination from "./Pagination";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import LedgerDetailModal from "./LedgerDetailModal";
import { ledgerEntries as initialEntries, PAGE_SIZE, type LedgerEntry } from "@/data/ledgerData";

type DeleteRequest = { mode: "single"; id: string } | { mode: "bulk" } | null;

export default function LedgerListPanel() {
  const [entries, setEntries] = useState<LedgerEntry[]>(initialEntries);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest>(null);
  const [viewingEntry, setViewingEntry] = useState<LedgerEntry | null>(null);

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const pageEntries = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return entries.slice(start, start + PAGE_SIZE);
  }, [entries, currentPage]);

  function startSelection() {
    setSelectionMode(true);
  }

  function cancelSelection() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    setSelectedIds((prev) => {
      const allSelected = pageEntries.every((entry) => prev.has(entry.id));
      const next = new Set(prev);
      pageEntries.forEach((entry) => {
        if (allSelected) {
          next.delete(entry.id);
        } else {
          next.add(entry.id);
        }
      });
      return next;
    });
  }

  function requestBulkDelete() {
    if (selectedIds.size === 0) return;
    setDeleteRequest({ mode: "bulk" });
  }

  function requestSingleDelete(entry: LedgerEntry) {
    setDeleteRequest({ mode: "single", id: entry.id });
  }

  function confirmDelete() {
    if (!deleteRequest) return;

    if (deleteRequest.mode === "single") {
      setEntries((prev) => prev.filter((entry) => entry.id !== deleteRequest.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteRequest.id);
        return next;
      });
    } else {
      setEntries((prev) => prev.filter((entry) => !selectedIds.has(entry.id)));
      setSelectedIds(new Set());
      setSelectionMode(false);
    }

    setDeleteRequest(null);
  }

  const deleteCount = deleteRequest?.mode === "bulk" ? selectedIds.size : 1;

  return (
    <div className="rounded-2xl border border-border bg-panel p-6 shadow-card sm:p-8">
      <LedgerListHeader
        selectionMode={selectionMode}
        selectedCount={selectedIds.size}
        onStartSelection={startSelection}
        onCancelSelection={cancelSelection}
        onRequestBulkDelete={requestBulkDelete}
      />

      <div className="mt-6">
        <LedgerTable
          entries={pageEntries}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAllOnPage}
          onView={setViewingEntry}
          onDeleteSingle={requestSingleDelete}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={entries.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmDeleteModal
        open={deleteRequest !== null}
        count={deleteCount}
        onCancel={() => setDeleteRequest(null)}
        onConfirm={confirmDelete}
      />

      <LedgerDetailModal entry={viewingEntry} onClose={() => setViewingEntry(null)} />
    </div>
  );
}
