"use client";

import UnconfirmedQueuePanel from "./UnconfirmedQueuePanel";
import { getAllUnapprovedRemittancesPartnerApi } from "@/lib/transactionApi";
import { unapprovedRemittancePartnerApiRecords } from "@/data/transactionData";

// Track B — GET /getAllUnapprovedRemittances2 (partner-API-inserted queue).
// Deliberately a separate screen from UnconfirmedListPanel — two distinct
// source queues per the API, not two views of the same data.
export default function UnconfirmedListPartnerApiPanel() {
  return (
    <UnconfirmedQueuePanel
      title="Un-Confirmed List (Partner API)"
      sourceBadge="Partner API"
      sourceBadgeClass="bg-brand-green-light text-brand-green-dark"
      description="transactions inserted via the partner API, awaiting confirmation."
      fetcher={getAllUnapprovedRemittancesPartnerApi}
      demoSeed={unapprovedRemittancePartnerApiRecords}
    />
  );
}
