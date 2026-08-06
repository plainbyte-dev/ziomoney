"use client";

import { useState } from "react";
import { Save, Trash2, Plus } from "lucide-react";
import {
  reportGroupOptions,
  columnDataTypeOptions,
  savedReports,
  type ReportColumn,
} from "@/data/reportWriterData";

export default function ReportWriterPanel() {
  const [reportId, setReportId] = useState<number | null>(null);
  const [reportName, setReportName] = useState("");
  const [reportGroup, setReportGroup] = useState(reportGroupOptions[0]);
  const [enablePaging, setEnablePaging] = useState(false);
  const [tsql, setTsql] = useState("");
  const [advancePassword, setAdvancePassword] = useState("");

  const [columns, setColumns] = useState<ReportColumn[]>([]);
  const [clmNameId, setClmNameId] = useState("");
  const [clmLabel, setClmLabel] = useState("");
  const [dataType, setDataType] = useState(columnDataTypeOptions[0]);
  const [clmSource, setClmSource] = useState("");
  const [clmSequence, setClmSequence] = useState("");
  const [allowNull, setAllowNull] = useState("");

  function handleNew() {
    setReportId(null);
    setReportName("");
    setReportGroup(reportGroupOptions[0]);
    setEnablePaging(false);
    setTsql("");
    setColumns([]);
    setAdvancePassword("");
  }

  function handleSave() {
    if (!reportName.trim()) return;
    const nextId =
      reportId ?? Math.max(...savedReports.map((r) => r.id), 0) + 1;
    setReportId(nextId);
  }

  function handleDelete() {
    if (reportId === null) return;
    handleNew();
  }

  function handleAddColumn() {
    if (!clmNameId.trim()) return;
    setColumns((prev) => [
      ...prev,
      {
        clmNameId,
        clmLabel,
        dataType,
        clmSource,
        clmSequence: Number(clmSequence) || prev.length + 1,
        allowNull: allowNull.trim().toLowerCase() === "true" || allowNull.trim() === "1",
      },
    ]);
    setClmNameId("");
    setClmLabel("");
    setDataType(columnDataTypeOptions[0]);
    setClmSource("");
    setClmSequence("");
    setAllowNull("");
  }

  function handleRemoveColumn(index: number) {
    setColumns((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="bg-brand-blue px-6 py-4">
        <h1 className="text-lg font-bold text-white">Report Writer</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="mb-2 text-sm text-heading/70">
          Report ID: <span className="font-semibold text-heading">{reportId ?? "—"}</span>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[240px] flex-1">
            <label className="mb-1 block text-sm text-heading/70">Report Name:</label>
            <input
              value={reportName}
              onChange={(event) => setReportName(event.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-heading/70">Report Group:</label>
            <select
              value={reportGroup}
              onChange={(event) => setReportGroup(event.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              {reportGroupOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-1.5 text-sm text-heading/70">
            Enable Paging
            <input
              type="checkbox"
              checked={enablePaging}
              onChange={(event) => setEnablePaging(event.target.checked)}
              className="h-4 w-4 rounded border-border text-brand-blue focus:ring-brand-blue"
            />
          </label>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm text-heading/70">T-SQL</label>
          <textarea
            value={tsql}
            onChange={(event) => setTsql(event.target.value)}
            rows={8}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-mono text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-1.5 text-sm font-semibold text-heading/80 hover:bg-border"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={handleDelete}
            disabled={reportId === null}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-1.5 text-sm font-semibold text-heading/80 hover:bg-border disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-1.5 text-sm font-semibold text-heading/80 hover:bg-border"
          >
            <Plus size={14} />
            New
          </button>
          <input
            type="password"
            value={advancePassword}
            onChange={(event) => setAdvancePassword(event.target.value)}
            className="w-48 rounded-lg border border-border bg-white px-3 py-1.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
          <span className="text-xs text-red-500">* [Enter Password for Advance Report Writer]</span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-5">
          <input
            value={reportId ?? ""}
            readOnly
            placeholder="Report ID"
            className="w-24 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-heading/60"
          />
          <input
            value={clmNameId}
            onChange={(event) => setClmNameId(event.target.value)}
            placeholder="Clm Name ID"
            className="w-32 rounded-lg border border-border bg-white px-2 py-1.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
          <input
            value={clmLabel}
            onChange={(event) => setClmLabel(event.target.value)}
            placeholder="Clm Label"
            className="w-32 rounded-lg border border-border bg-white px-2 py-1.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
          <select
            value={dataType}
            onChange={(event) => setDataType(event.target.value)}
            className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          >
            {columnDataTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            value={clmSource}
            onChange={(event) => setClmSource(event.target.value)}
            placeholder="Clm Source"
            className="min-w-[220px] flex-1 rounded-lg border border-border bg-white px-2 py-1.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
          <input
            value={clmSequence}
            onChange={(event) => setClmSequence(event.target.value)}
            placeholder="Seq"
            className="w-16 rounded-lg border border-border bg-white px-2 py-1.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
          <input
            value={allowNull}
            onChange={(event) => setAllowNull(event.target.value)}
            placeholder="Allow Null"
            className="w-20 rounded-lg border border-border bg-white px-2 py-1.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
          <button
            onClick={handleAddColumn}
            className="rounded-lg bg-heading px-4 py-1.5 text-sm font-semibold text-white hover:bg-heading/90"
          >
            Add
          </button>
        </div>

        <div className="mt-3 overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr className="bg-brand-blue-light text-[11px] uppercase tracking-wide text-heading/70">
                <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Report ID</th>
                <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Clm Name ID</th>
                <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Clm Label</th>
                <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Data Type</th>
                <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Clm Source</th>
                <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">ClmSequence</th>
                <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">AllowNull</th>
                <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Remove</th>
              </tr>
            </thead>
            <tbody>
              {columns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-3 text-xs text-muted">
                    Column Filter Not Defined !
                  </td>
                </tr>
              ) : (
                columns.map((column, index) => (
                  <tr key={`${column.clmNameId}-${index}`} className="bg-white">
                    <td className="whitespace-nowrap px-3 py-2 text-heading/80">{reportId ?? "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-heading/80">{column.clmNameId}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-heading/80">{column.clmLabel}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-heading/80">{column.dataType}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-heading/80">{column.clmSource}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-heading/80">{column.clmSequence}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-heading/80">{column.allowNull ? "Yes" : "No"}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <button
                        onClick={() => handleRemoveColumn(index)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
