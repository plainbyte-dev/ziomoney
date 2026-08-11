"use client";

import UnconfirmedQueuePanel from "./UnconfirmedQueuePanel";
import { getAllUnapprovedRemittances } from "@/lib/transactionApi";
import { unapprovedRemittanceRecords } from "@/data/transactionData";

// Track B — GET /getAllUnapprovedRemittances (admin-inserted queue).
export default function UnconfirmedListPanel() {
  return (
    <UnconfirmedQueuePanel
      title="Un-Confirmed List"
      sourceBadge="Admin-Inserted"
      sourceBadgeClass="bg-brand-blue-light text-brand-blue"
      description="transactions inserted by admin/staff, awaiting confirmation."
      fetcher={getAllUnapprovedRemittances}
      demoSeed={unapprovedRemittanceRecords}
    />
  );
}
