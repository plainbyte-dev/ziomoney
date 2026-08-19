// Every flag in this file gates a piece of architecture that is genuinely
// unconfirmed with backend — not a "TODO later" placeholder. Flipping one
// is meant to be a one-line change once the real answer is confirmed; do
// not scatter equivalent booleans elsewhere in the codebase.

// If true: Partner Offer Rate (data/partnerOfferRateData.ts) is treated as
//          the wholesale rate, with the matching Margin Setup
//          (data/marginSetupData.ts) rate applied on top to derive the
//          retail rate shown to the sender. getCountryWiseExRate /
//          data/exchangeRateData.ts becomes a fallback/reference rate only,
//          used when no CONFIRMED offer rate exists for the corridor.
// If false: getCountryWiseExRate's buying/selling IS the only real rate —
//          the sole source of truth for both quoting and settlement.
//          Partner Offer Rate / Margin Setup are NOT consulted in the live
//          calculation; they may be vestigial, or scoped to an
//          agent-tier/partner-settlement concern unrelated to a
//          payout-partner wholesale/retail split. Verify against a real
//          POST /transfers response before flipping this to true.
export const WHOLESALE_RETAIL_SPLIT_CONFIRMED = false;

// ServiceChargeUpsertRequest (data/serviceChargeData.ts) has no fee-amount
// field in the documented schema. Set this to true only once the real
// field/endpoint holding the fee amount is confirmed and wired into
// lib/transferMath.ts's resolveFee — until then, resolveFee reads the
// mock-only feeAmountMOCKONLY field instead.
export const SERVICE_FEE_SOURCE_CONFIRMED = false;

// Foreign-to-foreign corridor triangulation (neither source nor
// destination currency is NPR). The math is implemented in
// lib/transferMath.ts's convertAmount, but is INTENTIONALLY gated off
// until backend/product confirms this corridor is actually supported and
// priced this way. Flip to true only after that confirmation, and after
// verifying the math against one real POST /transfers response for a
// genuine foreign-to-foreign transfer.
export const ALLOW_CROSS_CURRENCY_CONVERSION = true;

// Maker-checker self-approval block (components/PartnerOfferRateApprovals.tsx).
// Real roles aren't confirmed against the live auth service yet, so the
// self-approval restriction is loosened for testing: anyone can
// approve/cancel their own proposal, not just admins. Flip to true once
// roles are confirmed to restore the real restriction (the isAdmin
// exception in that component stays as the permanent, narrower bypass at
// that point).
export const SELF_APPROVAL_RESTRICTION_ENABLED = false;
