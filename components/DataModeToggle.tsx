"use client";

import { Database, Wifi } from "lucide-react";
import { useDataMode, DATA_MODE_TOGGLE_ALLOWED } from "@/contexts/DataModeContext";

export default function DataModeToggle() {
  const { mode, isLive, toggle } = useDataMode();

  // Dev-only convenience — a production build always talks to the live API,
  // so there's nothing to toggle.
  if (!DATA_MODE_TOGGLE_ALLOWED) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title="Toggle between static demo data and the live remittance API"
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        isLive
          ? "border-brand-green bg-brand-green-light text-brand-green-dark"
          : "border-border bg-surface text-heading/70"
      }`}
    >
      {isLive ? <Wifi size={13} /> : <Database size={13} />}
      {isLive ? "Live API" : "Static Data"}
      <span
        className={`ml-1 flex h-4 w-8 items-center rounded-full p-0.5 transition-colors ${
          isLive ? "bg-brand-green" : "bg-border"
        }`}
      >
        <span
          className={`h-3 w-3 rounded-full bg-panel shadow transition-transform ${
            isLive ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
      <span className="sr-only">Current mode: {mode}</span>
    </button>
  );
}
