import {
  WHOLESALE_RETAIL_SPLIT_CONFIRMED,
  SERVICE_FEE_SOURCE_CONFIRMED,
  ALLOW_CROSS_CURRENCY_CONVERSION,
} from "@/config/businessRules";
import type { PartnerOfferRateRecord } from "@/data/partnerOfferRateData";
import type { ServiceChargeRecord } from "@/data/serviceChargeData";
import type { CommissionRecord } from "@/data/partnerCommissionData";
import type { MarginRecord } from "@/data/marginSetupData";
import type { ExchangeRateRecord } from "@/data/exchangeRateData";
import type { TransferRecord, TransferRateBreakdown } from "@/data/transferData";

export const HOME_CURRENCY = "NPR";

// Rate shape returned by getCountryWiseExRate (ExchangeRateItemResponse),
// keyed by currency code. Never keyed by NPR — the home currency has no
// meaningful buying/selling row of its own.
export type RateEntry = { unit: number; buying: number; selling: number };

let feeStubWarned = false;

/**
 * Converts an amount from sourceCurrency to destinationCurrency using the
 * home-currency-quoted rate table. Handles all three corridor shapes:
 *
 *   1. Foreign -> NPR   : buy the source currency        (amount / unit) * buying
 *   2. NPR -> Foreign    : sell the destination currency   (amount / selling) * unit
 *   3. Foreign -> Foreign: triangulate through NPR, buying the source leg
 *                          and selling the destination leg
 *
 * Returns null if the required rate(s) aren't available yet, or if the
 * foreign-to-foreign case is hit while ALLOW_CROSS_CURRENCY_CONVERSION is
 * false (caller should show a "corridor not supported" message in that case
 * rather than treating null as "still loading").
 */
export function convertAmount(
  amount: number,
  sourceCurrency: string,
  destinationCurrency: string,
  rates: Record<string, RateEntry>,
  allowCrossCurrency: boolean = ALLOW_CROSS_CURRENCY_CONVERSION
): number | null {
  if (!sourceCurrency || !destinationCurrency || amount <= 0) return null;

  if (sourceCurrency === destinationCurrency) return amount;

  if (destinationCurrency === HOME_CURRENCY) {
    const rate = rates[sourceCurrency];
    if (!rate || rate.unit <= 0) return null;
    return (amount / rate.unit) * rate.buying;
  }

  if (sourceCurrency === HOME_CURRENCY) {
    const rate = rates[destinationCurrency];
    if (!rate || rate.selling <= 0) return null;
    return (amount / rate.selling) * rate.unit;
  }

  // Foreign -> Foreign
  if (!allowCrossCurrency) return null;
  const sourceRate = rates[sourceCurrency];
  const destRate = rates[destinationCurrency];
  if (!sourceRate || !destRate || sourceRate.unit <= 0 || destRate.selling <= 0) return null;
  const nprIntermediate = (amount / sourceRate.unit) * sourceRate.buying;
  return (nprIntermediate / destRate.selling) * destRate.unit;
}

export function isCrossCurrencyCorridor(sourceCurrency: string, destinationCurrency: string): boolean {
  return (
    Boolean(sourceCurrency) &&
    Boolean(destinationCurrency) &&
    sourceCurrency !== destinationCurrency &&
    sourceCurrency !== HOME_CURRENCY &&
    destinationCurrency !== HOME_CURRENCY
  );
}

interface ResolveRateInput {
  sourceCurrency: string;
  destinationCountry: string;
  rates: Record<string, RateEntry>;
  partnerOfferRates?: PartnerOfferRateRecord[];
  wholesaleRetailSplitConfirmed?: boolean;
}

/**
 * Resolves the wholesale rate for a corridor, when known.
 *
 * The retail-facing number the sender is quoted (RateEntry.buying/selling
 * from exchangeRateData) is NEVER overridden by this — a confirmed Partner
 * Offer Rate only ever *adds* wholesale/spread information for the admin
 * view; it is deliberately not wired to change what the agent sees at quote
 * time until that's confirmed as the intended architecture. Margin Setup is
 * intentionally not consulted here yet either: none of the currently seeded
 * margin rows cleanly map onto a specific offer-rate corridor, so applying
 * one would be a guess rather than a confirmed rule — revisit once backend
 * clarifies how a margin row binds to a rate corridor.
 */
export function resolveWholesaleRate(
  input: ResolveRateInput
): number | null {
  const confirmed = input.wholesaleRetailSplitConfirmed ?? WHOLESALE_RETAIL_SPLIT_CONFIRMED;
  if (!confirmed) return null;

  const match = (input.partnerOfferRates ?? []).find(
    (r) =>
      r.status === "CONFIRMED" &&
      r.sendCurrency.toUpperCase() === input.sourceCurrency.toUpperCase() &&
      r.destCountry.toLowerCase() === input.destinationCountry.toLowerCase()
  );
  return match ? match.rate || match.directQuote : null;
}

interface ResolveFeeInput {
  // Despite the confirmed schema field being literally named
  // `countrySymbol`, the seeded values (INR/NPR/IDR) are currency codes,
  // not country names — pass the destination currency code here, not the
  // country name.
  destinationCurrency: string;
  agentName: string;
  deliveryOption: string;
  serviceCharges: ServiceChargeRecord[];
  serviceFeeSourceConfirmed?: boolean;
}

/**
 * Resolves the fee for a transfer. When SERVICE_FEE_SOURCE_CONFIRMED is
 * false (today), reads the mock-only feeAmountMOCKONLY field — see
 * data/serviceChargeData.ts for why that field exists at all.
 */
export function resolveFee(input: ResolveFeeInput): number {
  const confirmed = input.serviceFeeSourceConfirmed ?? SERVICE_FEE_SOURCE_CONFIRMED;

  if (confirmed) {
    // TODO(backend): wire to the real fee-amount field/endpoint once
    // confirmed. Intentionally returns 0 rather than fabricating a number.
    return 0;
  }

  if (!feeStubWarned) {
    feeStubWarned = true;
    console.warn(
      "[transferMath] resolveFee is reading the mock-only feeAmountMOCKONLY field " +
        "(SERVICE_FEE_SOURCE_CONFIRMED=false) — this is a stub, not a real fee schedule."
    );
  }

  const match = input.serviceCharges.find(
    (r) =>
      r.active &&
      r.countrySymbol.toUpperCase() === input.destinationCurrency.toUpperCase() &&
      r.agentName === input.agentName &&
      r.deliveryOption === input.deliveryOption
  );
  return match?.feeAmountMOCKONLY ?? 0;
}

/**
 * Resolves the agent's commission rate for a corridor, as a decimal
 * (e.g. 0.002 for 0.2%) so it flows through calculateTransfer's existing
 * `commissionRate * amount` formula unchanged regardless of commissionType.
 *
 * FLAT commissions (a fixed amount, not a rate) are converted to an
 * equivalent decimal rate (`flatAmount / amount`) rather than changing
 * calculateTransfer's signature — this keeps the one formula correct for
 * both types without a second code path.
 */
export function resolveCommissionRate(
  sourceCurrency: string,
  destinationCountry: string,
  amount: number,
  commissions: CommissionRecord[]
): number {
  const match = commissions.find(
    (c) =>
      c.sendCurrency.toUpperCase() === sourceCurrency.toUpperCase() &&
      c.destinationCountry.toLowerCase() === destinationCountry.toLowerCase()
  );
  if (!match) return 0;
  if (match.commissionType === "FLAT") {
    return amount > 0 ? match.commissionRate / amount : 0;
  }
  return match.commissionRate / 100;
}

// Best-effort parse of the marginBindString convention observed in the
// seeded data ("INR-CASH", "NPR-BANK": {CURRENCY}-{CODE}). UNCONFIRMED with
// backend — no documented binding rule exists between a Margin Setup row
// and a specific rate corridor/delivery option. Only consulted when
// WHOLESALE_RETAIL_SPLIT_CONFIRMED is true; treat any match as a guess.
const DELIVERY_METHOD_BIND_CODES: Record<string, string> = {
  "Cash Pickup": "CASH",
  "Bank Deposit": "BANK",
  "Mobile Wallet": "WALLET",
};

interface ResolveMarginInput {
  targetPartner: string;
  destinationCurrency: string;
  deliveryOption: string;
  margins?: MarginRecord[];
  wholesaleRetailSplitConfirmed?: boolean;
}

export function resolveMargin(input: ResolveMarginInput): MarginRecord | null {
  const confirmed = input.wholesaleRetailSplitConfirmed ?? WHOLESALE_RETAIL_SPLIT_CONFIRMED;
  if (!confirmed) return null;

  const code = DELIVERY_METHOD_BIND_CODES[input.deliveryOption];
  if (!code) return null;
  const expectedBind = `${input.destinationCurrency.toUpperCase()}-${code}`;

  return (
    (input.margins ?? []).find(
      (m) =>
        m.status === "ACTIVE" &&
        m.targetPartner === input.targetPartner &&
        m.marginBindString.toUpperCase() === expectedBind
    ) ?? null
  );
}

export interface CalculateTransferInput {
  amount: number;
  sourceCurrency: string;
  destinationCurrency: string;
  destinationCountry: string;
  agentName: string;
  deliveryOption: string;
  commissionRate: number; // decimal, e.g. 0.002 for 0.2%
  rates: Record<string, RateEntry>;
  partnerOfferRates?: PartnerOfferRateRecord[];
  serviceCharges: ServiceChargeRecord[];
  margins?: MarginRecord[];
  wholesaleRetailSplitConfirmed?: boolean;
  serviceFeeSourceConfirmed?: boolean;
  allowCrossCurrency?: boolean;
}

export interface CalculateTransferResult {
  retailRate: number | null;
  wholesaleRate: number | null;
  fee: number;
  totalToPay: number;
  receiverAmount: number | null;
  // Only computed when a wholesale rate is known — never fabricated.
  fxSpread: number | null;
  commission: number;
  // The matched Margin Setup row's rate, when one was found — see
  // resolveMargin for how (unconfirmed) binding is guessed.
  marginRate: number | null;
  netEarning: number | null;
}

/**
 * Full calculation used both for the live agent-facing estimate AND the
 * admin approval breakdown (same numbers, different fields rendered per
 * role — role-based hiding happens at the component level, not here).
 */
export function calculateTransfer(input: CalculateTransferInput): CalculateTransferResult {
  const baseReceiverAmount = convertAmount(
    input.amount,
    input.sourceCurrency,
    input.destinationCurrency,
    input.rates,
    input.allowCrossCurrency
  );

  const plainRetailRate =
    input.destinationCurrency === HOME_CURRENCY
      ? input.rates[input.sourceCurrency]?.buying ?? null
      : input.sourceCurrency === HOME_CURRENCY
        ? input.rates[input.destinationCurrency]?.selling ?? null
        : null;

  const wholesaleRate = resolveWholesaleRate({
    sourceCurrency: input.sourceCurrency,
    destinationCountry: input.destinationCountry,
    rates: input.rates,
    partnerOfferRates: input.partnerOfferRates,
    wholesaleRetailSplitConfirmed: input.wholesaleRetailSplitConfirmed,
  });

  const margin = resolveMargin({
    targetPartner: input.agentName,
    destinationCurrency: input.destinationCurrency,
    deliveryOption: input.deliveryOption,
    margins: input.margins,
    wholesaleRetailSplitConfirmed: input.wholesaleRetailSplitConfirmed,
  });
  const marginRate = margin?.marginRate ?? null;

  // When a wholesale rate and a matching margin are both known, the retail
  // rate is derived from wholesale minus margin rather than read off the
  // plain exchange-rate table — see resolveMargin for the caveat that this
  // binding is a best-effort guess, not a confirmed rule.
  const marginAdjustedRetailRate =
    wholesaleRate !== null && margin
      ? margin.marginType === "FLAT"
        ? wholesaleRate - margin.marginRate
        : wholesaleRate * (1 - margin.marginRate / 100)
      : null;
  const retailRate = marginAdjustedRetailRate ?? plainRetailRate;

  // Keep receiverAmount consistent with a margin-adjusted retailRate — the
  // beneficiary is paid out at whichever rate actually applies, not
  // silently still the plain exchange-rate-table figure. Only the two
  // directly-quoted corridors have a single retailRate to substitute in;
  // the foreign->foreign triangulated corridor (retailRate always null)
  // keeps convertAmount's own result untouched.
  const receiverAmount =
    marginAdjustedRetailRate !== null && input.destinationCurrency === HOME_CURRENCY
      ? (input.amount / (input.rates[input.sourceCurrency]?.unit || 1)) * marginAdjustedRetailRate
      : marginAdjustedRetailRate !== null && input.sourceCurrency === HOME_CURRENCY
        ? (input.amount / marginAdjustedRetailRate) * (input.rates[input.destinationCurrency]?.unit || 1)
        : baseReceiverAmount;

  const fee = resolveFee({
    destinationCurrency: input.destinationCurrency,
    agentName: input.agentName,
    deliveryOption: input.deliveryOption,
    serviceCharges: input.serviceCharges,
    serviceFeeSourceConfirmed: input.serviceFeeSourceConfirmed,
  });

  const totalToPay = input.amount + fee;
  const commission = input.commissionRate * input.amount;

  // FX spread: the source-currency cost of sourcing receiverAmount at the
  // wholesale rate, vs. what the sender actually paid (input.amount).
  const fxSpread =
    wholesaleRate && wholesaleRate > 0 && receiverAmount !== null
      ? input.amount - receiverAmount / wholesaleRate
      : null;

  const netEarning = fxSpread !== null ? fee + fxSpread - commission : null;

  return {
    retailRate,
    wholesaleRate,
    fee,
    totalToPay,
    receiverAmount,
    fxSpread,
    commission,
    marginRate,
    netEarning,
  };
}

/**
 * Returns the rate/fee/commission/margin breakdown for a transfer: its own
 * creation-time snapshot if it has one (see TransferRateBreakdown), or a
 * live recompute via calculateTransfer for transfers created before this
 * feature existed (e.g. the originally-seeded demo rows). Shared by
 * TransfersPanel's detail view and the Transaction Rate Report so both
 * render from one source of truth rather than duplicating the recompute.
 */
export function getOrComputeBreakdown(
  transfer: TransferRecord,
  context: {
    exchangeRates: ExchangeRateRecord[];
    partnerOfferRates: PartnerOfferRateRecord[];
    commissions: CommissionRecord[];
    serviceCharges: ServiceChargeRecord[];
    margins: MarginRecord[];
  }
): TransferRateBreakdown {
  if (transfer.rateBreakdownMOCKONLY) return transfer.rateBreakdownMOCKONLY;

  const rates: Record<string, RateEntry> = {};
  for (const r of context.exchangeRates) {
    rates[r.symbol.toUpperCase()] = { unit: r.unit, buying: r.buying, selling: r.selling };
  }

  const commissionRate = resolveCommissionRate(
    transfer.sourceCurrency,
    transfer.destinationCountry,
    transfer.amount,
    context.commissions
  );

  const result = calculateTransfer({
    amount: transfer.amount,
    sourceCurrency: transfer.sourceCurrency,
    destinationCurrency: transfer.destinationCurrency,
    destinationCountry: transfer.destinationCountry,
    agentName: "",
    deliveryOption: "",
    commissionRate,
    rates,
    partnerOfferRates: context.partnerOfferRates,
    serviceCharges: context.serviceCharges,
    margins: context.margins,
  });

  return {
    agentName: "",
    retailRate: result.retailRate,
    wholesaleRate: result.wholesaleRate,
    fxSpread: result.fxSpread,
    commissionRate,
    commission: result.commission,
    marginRate: result.marginRate,
    netEarning: result.netEarning,
    computedAt: new Date().toISOString(),
  };
}
