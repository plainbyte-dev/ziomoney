import { describe, expect, it } from "vitest";
import { calculateTransfer, resolveCommissionRate, resolveMargin } from "./transferMath";
import type { PartnerOfferRateRecord } from "@/data/partnerOfferRateData";
import type { ServiceChargeRecord } from "@/data/serviceChargeData";
import type { CommissionRecord } from "@/data/partnerCommissionData";
import type { MarginRecord } from "@/data/marginSetupData";

// Both worked examples below use fully local, self-contained inputs — not
// the app's real seeded /data/*.ts records — so the two tests can pin
// opposite WHOLESALE_RETAIL_SPLIT_CONFIRMED states without touching the
// shared config module. See config/businessRules.ts for what each flag
// actually gates.

function confirmedOfferRate(rate: number): PartnerOfferRateRecord {
  return {
    id: 1,
    uniqueId: "POR-TEST-0001",
    remittancePartner: "TEST PARTNER",
    sendCurrency: "USD",
    receiveCurrency: "NPR",
    destCountry: "Nepal",
    sendCurrencyPerUsd: 1,
    receiveCurrencyPerUsd: rate,
    directQuote: rate,
    rate,
    quoteType: "DIRECT",
    status: "CONFIRMED",
    makerUser: "maker",
    checkerUser: "checker",
    createdDateTime: "2026-08-01T00:00:00Z",
    updatedDateTime: "2026-08-01T00:00:00Z",
  };
}

function serviceCharge(feeAmountMOCKONLY: number): ServiceChargeRecord {
  return {
    id: 1,
    countrySymbol: "NPR",
    agentName: "TEST AGENT",
    deliveryOption: "Bank Deposit",
    active: true,
    feeAmountMOCKONLY,
    createdDate: "2026-08-01",
    updatedDate: "2026-08-01",
  };
}

describe("calculateTransfer", () => {
  it("computes the wholesale/retail split breakdown when WHOLESALE_RETAIL_SPLIT_CONFIRMED=true", () => {
    const result = calculateTransfer({
      amount: 500,
      sourceCurrency: "USD",
      destinationCurrency: "NPR",
      destinationCountry: "Nepal",
      agentName: "TEST AGENT",
      deliveryOption: "Bank Deposit",
      commissionRate: 0.002,
      rates: { USD: { unit: 1, buying: 140, selling: 140 } },
      partnerOfferRates: [confirmedOfferRate(141)],
      serviceCharges: [serviceCharge(5)],
      wholesaleRetailSplitConfirmed: true,
      serviceFeeSourceConfirmed: false,
    });

    expect(result.retailRate).toBe(140);
    expect(result.wholesaleRate).toBe(141);
    expect(result.fee).toBe(5);
    expect(result.totalToPay).toBe(505);
    expect(result.receiverAmount).toBe(70000);
    expect(result.commission).toBeCloseTo(1, 5);
    expect(result.fxSpread).toBeCloseTo(3.5461, 3);
    expect(result.netEarning).toBeCloseTo(7.55, 2);
  });

  it("uses the plain exchange rate directly when WHOLESALE_RETAIL_SPLIT_CONFIRMED=false", () => {
    const result = calculateTransfer({
      amount: 500,
      sourceCurrency: "USD",
      destinationCurrency: "NPR",
      destinationCountry: "Nepal",
      agentName: "TEST AGENT",
      deliveryOption: "Bank Deposit",
      commissionRate: 0.002,
      rates: { USD: { unit: 1, buying: 133.2, selling: 134.1 } },
      partnerOfferRates: [confirmedOfferRate(141)],
      serviceCharges: [serviceCharge(5)],
      wholesaleRetailSplitConfirmed: false,
      serviceFeeSourceConfirmed: false,
    });

    expect(result.receiverAmount).toBe(66600);
    expect(result.wholesaleRate).toBeNull();
    expect(result.fxSpread).toBeNull();
    expect(result.netEarning).toBeNull();
  });

  it("derives retailRate from wholesale minus a matching PERCENT margin, and keeps receiverAmount consistent", () => {
    const margin: MarginRecord = {
      id: 1,
      targetPartner: "TEST AGENT",
      service: "Bank Deposit",
      remittanceType: "Agent",
      marginRate: 1,
      marginRateWrtParent: 0,
      marginType: "PERCENT",
      marginBindString: "NPR-BANK",
      expiryDate: "2027-01-01",
      status: "ACTIVE",
      createdDate: "2026-08-01",
    };

    const result = calculateTransfer({
      amount: 500,
      sourceCurrency: "USD",
      destinationCurrency: "NPR",
      destinationCountry: "Nepal",
      agentName: "TEST AGENT",
      deliveryOption: "Bank Deposit",
      commissionRate: 0,
      rates: { USD: { unit: 1, buying: 999, selling: 999 } },
      partnerOfferRates: [confirmedOfferRate(100)],
      serviceCharges: [],
      margins: [margin],
      wholesaleRetailSplitConfirmed: true,
    });

    // wholesale 100 minus a 1% margin -> retail 99, not the plain rates-table
    // buying rate (999), and receiverAmount follows the same 99 rate.
    expect(result.retailRate).toBe(99);
    expect(result.receiverAmount).toBe(500 * 99);
  });
});

describe("resolveCommissionRate", () => {
  const commissions: CommissionRecord[] = [
    {
      id: 1,
      remittancePartner: "PERCENT PARTNER",
      commissionRate: 1.5,
      commissionType: "PERCENT",
      service: "Cash Pickup",
      sendCurrency: "USD",
      destinationCountry: "Nepal",
      remittanceType: "Individual",
    },
    {
      id: 2,
      remittancePartner: "FLAT PARTNER",
      commissionRate: 5,
      commissionType: "FLAT",
      service: "Bank Deposit",
      sendCurrency: "AUD",
      destinationCountry: "India",
      remittanceType: "Agent",
    },
  ];

  it("converts a PERCENT commission to a decimal rate", () => {
    expect(resolveCommissionRate("USD", "Nepal", 500, commissions)).toBeCloseTo(0.015, 6);
  });

  it("converts a FLAT commission to an equivalent decimal rate for the given amount", () => {
    // 5 flat on a 250 transfer = 2% equivalent rate.
    expect(resolveCommissionRate("AUD", "India", 250, commissions)).toBeCloseTo(0.02, 6);
  });

  it("returns 0 when no corridor matches", () => {
    expect(resolveCommissionRate("GBP", "Nepal", 500, commissions)).toBe(0);
  });
});

describe("resolveMargin", () => {
  const margins: MarginRecord[] = [
    {
      id: 1,
      targetPartner: "P1",
      service: "Cash Pickup",
      remittanceType: "Individual",
      marginRate: 0.25,
      marginRateWrtParent: 0.1,
      marginType: "PERCENT",
      marginBindString: "INR-CASH",
      expiryDate: "2027-01-01",
      status: "ACTIVE",
      createdDate: "2026-06-01",
    },
  ];

  it("matches by targetPartner + parsed {CURRENCY}-{CODE} bind string when the split is confirmed", () => {
    const match = resolveMargin({
      targetPartner: "P1",
      destinationCurrency: "INR",
      deliveryOption: "Cash Pickup",
      margins,
      wholesaleRetailSplitConfirmed: true,
    });
    expect(match?.id).toBe(1);
  });

  it("returns null when the split is not confirmed, even with a matching row", () => {
    const match = resolveMargin({
      targetPartner: "P1",
      destinationCurrency: "INR",
      deliveryOption: "Cash Pickup",
      margins,
      wholesaleRetailSplitConfirmed: false,
    });
    expect(match).toBeNull();
  });

  it("returns null when no row matches the partner/currency/delivery-option combination", () => {
    const match = resolveMargin({
      targetPartner: "P1",
      destinationCurrency: "NPR",
      deliveryOption: "Bank Deposit",
      margins,
      wholesaleRetailSplitConfirmed: true,
    });
    expect(match).toBeNull();
  });
});
