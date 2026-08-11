"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRates } from "@/contexts/RatesContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useAuth } from "@/contexts/AuthContext";
import Button from "./Button";
import { formatDate } from "@/lib/format";

// TEMPORARY — real roles aren't confirmed against the live auth service yet,
// so the maker-checker self-approval block is loosened for testing: anyone
// can approve/cancel their own proposal, not just admins. Flip this back to
// true once roles are confirmed to restore the real restriction (the isAdmin
// exception below stays as the permanent, narrower bypass at that point).
const SELF_APPROVAL_RESTRICTION_ENABLED = false;

export default function PartnerOfferRateApprovals() {
  const { isLive } = useDataMode();
  const { user } = useAuth();
  const {
    partnerOfferRates,
    partnerOfferRatesLoading,
    partnerOfferRateActionError,
    refreshPartnerOfferRates,
    confirmOfferRate,
    cancelOfferRate,
  } = useRates();

  const [actioningId, setActioningId] = useState<string | null>(null);

  // Admins are the one deliberate exception to the maker-checker rule —
  // everyone else is still hard-blocked from approving/cancelling their own
  // proposal. Role names vary between the demo mock users ("System Admin",
  // "Admin") and whatever the live auth service returns, so this matches
  // loosely rather than against a fixed list.
  const isAdmin = !!user?.role && user.role.toLowerCase().includes("admin");
  const bypassesSelfApproval = !SELF_APPROVAL_RESTRICTION_ENABLED || isAdmin;

  useEffect(() => {
    refreshPartnerOfferRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  function isOwnProposal(makerUser: string) {
    return !!user?.name && makerUser.trim().toLowerCase() === user.name.trim().toLowerCase();
  }

  async function handleConfirm(uniqueId: string, makerUser: string) {
    // Re-checked here, not just relied on via the disabled attribute — the
    // context-level guard is the real backstop, but a click handler that
    // fires the request without checking first is still a bug waiting to
    // happen if this button is ever re-enabled by a future edit.
    if (isOwnProposal(makerUser) && !bypassesSelfApproval) return;
    setActioningId(uniqueId);
    await confirmOfferRate(
      { uniqueId, checkerUser: user?.name || "" },
      { allowSelfApproval: bypassesSelfApproval }
    );
    setActioningId(null);
  }

  async function handleCancel(uniqueId: string, makerUser: string) {
    if (isOwnProposal(makerUser) && !bypassesSelfApproval) return;
    setActioningId(uniqueId);
    await cancelOfferRate(
      { uniqueId, checkerUser: user?.name || "" },
      { allowSelfApproval: bypassesSelfApproval }
    );
    setActioningId(null);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-heading">Partner Offer Rate Approvals</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"}
            {" — "}
            {SELF_APPROVAL_RESTRICTION_ENABLED
              ? "a proposer can never approve or reject their own rate, except an admin acting as checker."
              : "self-approval restriction is temporarily disabled for testing — roles aren't confirmed yet."}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refreshPartnerOfferRates}
          disabled={partnerOfferRatesLoading}
          icon={<RefreshCw size={13} className={partnerOfferRatesLoading ? "animate-spin" : undefined} />}
        >
          Refresh
        </Button>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        {partnerOfferRateActionError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{partnerOfferRateActionError}</p>
        )}

        <div className="overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                  <th className="px-4 py-3">Unique ID</th>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Send / Receive</th>
                  <th className="px-4 py-3">Dest. Country</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Quote Type</th>
                  <th className="px-4 py-3">Maker</th>
                  <th className="px-4 py-3">Proposed</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {partnerOfferRates.map((entry) => {
                  const ownProposal = isOwnProposal(entry.makerUser);
                  const blocked = ownProposal && !bypassesSelfApproval;
                  const title = blocked
                    ? "You proposed this rate — a different approver is required."
                    : ownProposal
                      ? SELF_APPROVAL_RESTRICTION_ENABLED
                        ? "You proposed this rate — approving as admin overrides the usual maker-checker rule."
                        : "You proposed this rate — self-approval is temporarily allowed for testing."
                      : undefined;
                  return (
                    <tr key={entry.id} className="border-b border-border bg-panel last:border-b-0">
                      <td className="px-4 py-3 font-medium text-heading">{entry.uniqueId}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.remittancePartner}</td>
                      <td className="px-4 py-3 text-heading/80">
                        {entry.sendCurrency} → {entry.receiveCurrency}
                      </td>
                      <td className="px-4 py-3 text-heading/80">{entry.destCountry}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.rate || entry.directQuote}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.quoteType}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.makerUser}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-heading/80">
                        {formatDate(entry.createdDateTime)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleConfirm(entry.uniqueId, entry.makerUser)}
                              disabled={actioningId === entry.uniqueId || blocked}
                              title={title}
                              className="rounded-lg border border-brand-green bg-brand-green-light px-3 py-1.5 text-xs font-semibold text-brand-green-dark hover:bg-brand-green/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleCancel(entry.uniqueId, entry.makerUser)}
                              disabled={actioningId === entry.uniqueId || blocked}
                              title={title}
                            >
                              Cancel
                            </Button>
                          </div>
                          {blocked && (
                            <span className="text-[11px] text-muted">Awaiting a different approver</span>
                          )}
                          {ownProposal && bypassesSelfApproval && (
                            <span className="text-[11px] font-medium text-amber-600">
                              {SELF_APPROVAL_RESTRICTION_ENABLED ? "Admin override" : "Self-approval (testing)"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {partnerOfferRates.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted">
                      No pending partner offer rates.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
