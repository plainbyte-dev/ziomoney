"use client";

import { useState } from "react";
import { Check, FileText } from "lucide-react";
import SelectField from "./SelectField";
import DateField from "./DateField";
import CurrencySelect from "./CurrencySelect";
import RadioPill from "./RadioPill";
import Button from "./Button";
import StatementOfAccountLogTable from "./StatementOfAccountLogTable";
import StatementOfAccountReportModal, {
  buildSoaReportTableHtml,
} from "./StatementOfAccountReportModal";
import { downloadHtmlTableAsExcel } from "@/lib/exportExcel";
import {
  soaMainPartnerOptions,
  soaLedgerHeadOptions,
  soaCurrencyOptions,
  soaReportTypeOptions,
  soaDefaults,
  soaBatchLog,
  type SoaBatchLogEntry,
  type SoaCurrency,
  type SoaReportType,
} from "@/data/statementOfAccountData";
import { buildReportDetail, type SoaReportDetail } from "@/data/statementOfAccountReportData";

function CheckboxOption({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 text-sm text-heading/80"
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded ${
          checked ? "bg-brand-green" : "border border-border bg-panel"
        }`}
      >
        {checked && <Check size={12} className="text-white" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}

export default function StatementOfAccountPanel() {
  const [currency, setCurrency] = useState<SoaCurrency>("FCY");
  const [reportType, setReportType] = useState<SoaReportType>("Summary Report");
  const [showOpeningBalance, setShowOpeningBalance] = useState(true);
  const [showBySentDateWise, setShowBySentDateWise] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeReport, setActiveReport] = useState<SoaReportDetail | null>(null);

  function handleViewReport(entry: SoaBatchLogEntry, index: number) {
    setActiveReport(buildReportDetail(entry, index));
  }

  function handleExport(entry: SoaBatchLogEntry, index: number) {
    const detail = buildReportDetail(entry, index);
    downloadHtmlTableAsExcel(
      `SOA-${detail.partner.replace(/\s+/g, "-")}.xls`,
      buildSoaReportTableHtml(detail)
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Statement of Account</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField
            label="Main Partner"
            options={soaMainPartnerOptions}
            defaultValue={soaMainPartnerOptions[0]}
          />
          <SelectField
            label="Ledger Head"
            options={soaLedgerHeadOptions}
            defaultValue={soaLedgerHeadOptions[0]}
          />

          <CurrencySelect
            options={[...soaCurrencyOptions]}
            value={currency}
            onChange={(value) => setCurrency(value as SoaCurrency)}
          />

          <div className="grid grid-cols-2 gap-3">
            <DateField label="From" defaultValue={soaDefaults.fromDate} />
            <DateField label="To" defaultValue={soaDefaults.toDate} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            {soaReportTypeOptions.map((option) => (
              <RadioPill
                key={option}
                label={option}
                checked={reportType === option}
                onSelect={() => setReportType(option)}
              />
            ))}
          </div>

          <div className="flex items-center gap-6">
            <CheckboxOption
              label="Show Opening Balance"
              checked={showOpeningBalance}
              onToggle={() => setShowOpeningBalance((v) => !v)}
            />
            <CheckboxOption
              label="Show By Sent Date Wise"
              checked={showBySentDateWise}
              onToggle={() => setShowBySentDateWise((v) => !v)}
            />
          </div>
        </div>

        <div className="mt-6">
          <Button icon={<FileText size={16} />}>View Detail</Button>
        </div>
      </div>

      <div className="border-t border-border bg-panel p-6 sm:p-8">
        <StatementOfAccountLogTable
          key={refreshKey}
          entries={soaBatchLog}
          onRefresh={() => setRefreshKey((k) => k + 1)}
          onViewReport={handleViewReport}
          onExport={handleExport}
        />
      </div>

      <StatementOfAccountReportModal
        detail={activeReport}
        onClose={() => setActiveReport(null)}
      />
    </div>
  );
}
