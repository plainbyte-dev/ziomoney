"use client";

import { useState } from "react";
import { Download, Lock, Unlock } from "lucide-react";
import { headOfficeUserRows } from "@/data/userManagementData";

const columns = [
  "No",
  "Name",
  "User ID",
  "Last Login",
  "Lock/Unlock",
  "Status",
  "Created By",
  "Created Date",
  "Modified By",
  "Modified Date",
];

export default function HeadOfficeUserStatusPanel() {
  const [rows, setRows] = useState(headOfficeUserRows);

  function toggleLock(no: number) {
    setRows((prev) =>
      prev.map((row) =>
        row.no === no ? { ...row, lockStatus: row.lockStatus === "Locked" ? "Unlocked" : "Locked" } : row
      )
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="bg-brand-blue px-6 py-4">
        <h1 className="text-lg font-bold text-white">Head Office User Status</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <button className="mb-3 flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline">
          <Download size={14} />
          Export To Excel
        </button>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr className="bg-brand-blue-light text-[11px] uppercase tracking-wide text-heading/70">
                {columns.map((col) => (
                  <th key={col} className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.no} className={index % 2 === 0 ? "bg-white" : "bg-brand-green-light/30"}>
                  <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.no}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-heading">{row.name}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.userId}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.lastLogin}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <button
                      onClick={() => toggleLock(row.no)}
                      className="flex items-center gap-1 text-heading/70 hover:text-brand-blue"
                    >
                      {row.lockStatus === "Locked" ? <Lock size={12} /> : <Unlock size={12} />}
                      {row.lockStatus}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <span className={`font-semibold italic ${row.status === "Online" ? "text-brand-green" : "text-red-500"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.createdBy}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.createdDate}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.modifiedBy}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.modifiedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
