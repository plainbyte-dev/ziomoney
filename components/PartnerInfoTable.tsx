"use client";

import { formatAccounting } from "@/lib/format";
import { partnerCountryOptions, type PartnerEntry } from "@/data/partnerData";

interface PartnerInfoTableProps {
  entries: PartnerEntry[];
  countryFilter: string;
  onCountryChange: (country: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PartnerInfoTable({
  entries,
  countryFilter,
  onCountryChange,
  selectedId,
  onSelect,
}: PartnerInfoTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[1200px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Partner Name</th>
            <th className="px-4 py-3">Partner ID</th>
            <th className="px-4 py-3">Country</th>
            <th className="px-4 py-3">Agent Function</th>
            <th className="px-4 py-3">Partner Type</th>
            <th className="px-4 py-3 text-right">Credit Limit</th>
            <th className="px-4 py-3">Corridor</th>
            <th className="px-4 py-3">Banks</th>
            <th className="px-4 py-3">Branch Detail</th>
            <th className="px-4 py-3">Summary</th>
            <th className="px-4 py-3">Delete</th>
          </tr>
          <tr className="border-b border-border bg-panel text-xs normal-case tracking-normal text-heading/70">
            <th className="px-4 py-2" colSpan={2}>
              <div className="flex items-center gap-2 font-normal">
                <span>Select Country</span>
                <select
                  value={countryFilter}
                  onChange={(event) => onCountryChange(event.target.value)}
                  className="rounded-lg border border-border bg-panel px-2 py-1.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                >
                  {partnerCountryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </th>
            <th colSpan={10} />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              onClick={() => onSelect(entry.id)}
              className={`cursor-pointer border-b border-border last:border-b-0 ${
                selectedId === entry.id ? "bg-brand-green-light/40" : "bg-panel"
              }`}
            >
              <td className="px-4 py-3 font-medium text-brand-blue">{entry.id}</td>
              <td className="px-4 py-3 text-heading/80">
                {entry.partnerName}
                {entry.blocked && (
                  <span className="ml-2 text-xs font-semibold text-red-500">BLOCK</span>
                )}
              </td>
              <td className="px-4 py-3 text-heading/80">{entry.partnerId}</td>
              <td className="px-4 py-3 text-heading/80">{entry.country}</td>
              <td className="px-4 py-3">
                <span className="font-medium text-brand-blue">Agent Function</span>
              </td>
              <td className="px-4 py-3 text-heading/80">{entry.partnerType}</td>
              <td className="px-4 py-3 text-right text-heading/80">
                {entry.creditLimit === null ? "" : formatAccounting(entry.creditLimit)}
              </td>
              <td className="px-4 py-3">
                <span className="font-medium text-brand-blue">Corridor</span>
              </td>
              <td className="px-4 py-3">
                {entry.hasBank && <span className="font-medium text-brand-blue">Bank</span>}
              </td>
              <td className="px-4 py-3">
                <span className="font-medium text-brand-blue">Detail</span>
              </td>
              <td className="px-4 py-3">
                <span className="font-medium text-brand-blue">View Summary</span>
              </td>
              <td className="px-4 py-3">
                <input
                  type="radio"
                  name="partner-delete-select"
                  checked={selectedId === entry.id}
                  onChange={() => {}}
                  onClick={(event) => {
                    // Radios don't fire onChange when clicking an already-checked
                    // one again, so toggle-off has to happen here instead.
                    event.stopPropagation();
                    onSelect(entry.id);
                  }}
                  className="h-4 w-4 accent-red-500"
                />
              </td>
            </tr>
          ))}

          {entries.length === 0 && (
            <tr>
              <td colSpan={12} className="px-4 py-10 text-center text-sm text-muted">
                No partners match the selected country.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
