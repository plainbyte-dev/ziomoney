import { NextResponse } from "next/server";
import { proxyRemittanceRequest } from "../../remittance-proxy";

const ACTIONS: Record<string, { path: string; method: "GET" | "POST" }> = {
  register: { path: "/insertRemittancePartner", method: "POST" },
  list: { path: "/obtainAllRemittancePartner", method: "GET" },
  lookup: { path: "/obtainRemittancePartner", method: "POST" },
  info: { path: "/getRemittancePartnerInfo", method: "POST" },
  "update-credit-limit": { path: "/updateCreditLimit", method: "POST" },
  "add-actual-balance": { path: "/addActualBalance", method: "POST" },
  "update-email": { path: "/updateRemittancePartnerEmail", method: "POST" },
  "update-accept-pin": { path: "/updateRemittancePartnerAcceptPin", method: "POST" },
  "insert-txn-currency": { path: "/insertRemittancePartnerTxnCurrency", method: "POST" },
  "insert-country": { path: "/insertRemittancePartnerCountry", method: "POST" },
  countries: { path: "/obtainRemittancePartnerCountries", method: "GET" },
  "insert-agent-partner": { path: "/insertAgentPartner", method: "POST" },
  "change-password": { path: "/changeRemittancePartnerPassword", method: "POST" },
  "insert-payout-config": { path: "/insertRemittancePayoutPartnerConfiguration", method: "POST" },
  "get-payout-config": { path: "/obtainRemittancePayoutPartnerConfiguration", method: "POST" },
  "update-payout-config": { path: "/updateRemittancePayoutPartnerConfiguration", method: "POST" },
  "payout-bank-update": { path: "/requestPayoutBankUpdate", method: "POST" },
  "payout-partner-networks": { path: "/getPayoutPartner", method: "GET" },
};

function proxy(action: string, body: string | undefined, authorization: string | null, search: string) {
  const config = ACTIONS[action];
  if (!config) {
    return NextResponse.json(
      { success: false, message: `Unknown partner action "${action}".` },
      { status: 404 }
    );
  }
  return proxyRemittanceRequest(`${config.path}${search}`, { method: config.method, body, authorization });
}

export async function POST(request: Request, { params }: { params: { action: string } }) {
  const body = await request.text();
  return proxy(params.action, body, request.headers.get("authorization"), "");
}

export async function GET(request: Request, { params }: { params: { action: string } }) {
  // Forwarded as-is — e.g. "countries" (obtainRemittancePartnerCountries)
  // takes `userName` as a query param, not a body.
  const { search } = new URL(request.url);
  return proxy(params.action, undefined, request.headers.get("authorization"), search);
}
