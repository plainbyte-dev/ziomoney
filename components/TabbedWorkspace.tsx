"use client";

import { useTabs } from "@/contexts/TabsContext";
import { tabRegistry, parsePayoutPartnerWiseTabKey } from "@/data/tabRegistry";
import TabBar from "./TabBar";
import Breadcrumbs from "./Breadcrumbs";
import PayoutPartnerOfferRatePanel from "./PayoutPartnerOfferRatePanel";

export default function TabbedWorkspace() {
  const { activeKey } = useTabs();
  const entry = tabRegistry[activeKey];
  // Payout Partner Wise is scoped per-partner, so it can't live in the
  // static tabRegistry above (one entry per key, no room for a partner
  // param) — see data/tabRegistry.tsx's payoutPartnerWiseTabKey.
  const payoutPartnerWise = parsePayoutPartnerWiseTabKey(activeKey);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <TabBar />
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
        {payoutPartnerWise ? (
          <>
            <div className="mb-4">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "#" },
                  { label: "Exchange Rate & Commission", href: "#" },
                  { label: payoutPartnerWise.kind === "rate" ? "Exchange Rates" : "Service Charges", href: "#" },
                  {
                    label:
                      payoutPartnerWise.kind === "rate"
                        ? `Payout Partner Wise — ${payoutPartnerWise.partnerName}`
                        : `Service Charge — ${payoutPartnerWise.partnerName}`,
                    href: "#",
                    active: true,
                  },
                ]}
              />
            </div>
            <PayoutPartnerOfferRatePanel partnerName={payoutPartnerWise.partnerName} mode={payoutPartnerWise.kind} />
          </>
        ) : entry ? (
          <>
            <div className="mb-4">
              <Breadcrumbs items={entry.breadcrumb} />
            </div>
            <entry.component />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted">
            <p className="text-sm">Select an item from the sidebar to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}