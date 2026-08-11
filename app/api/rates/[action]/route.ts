import { NextResponse } from "next/server";
import { proxyRemittanceRequest } from "../../remittance-proxy";

const ACTIONS: Record<string, { path: string; method: "GET" | "POST" }> = {
  "get-all-countries": { path: "/getAllCountries", method: "GET" },
  "get-country-wise-ex-rate": { path: "/getCountryWiseExRate", method: "POST" },
  "update-rate": { path: "/UpdateRate", method: "POST" },
  "update-csv-rate": { path: "/UpdateCsvRate", method: "POST" },
  "get-service-charge": { path: "/getServiceCharge", method: "GET" },
  "get-se-rate": { path: "/GetSeRate", method: "GET" },
  "service-charges-save": { path: "/Service_Charges_save", method: "POST" },
  "service-charges-insert": { path: "/Service_Charges_Insert", method: "POST" },
  "update-csv-file-for-countries": { path: "/UpdateCsvfileForCountries", method: "POST" },
  "obtain-partner-commission": { path: "/obtainRemittancePartnerCommission", method: "POST" },
  "insert-or-update-partner-commission": { path: "/insertOrUpdateRemittancePartnerCommission", method: "POST" },
  "obtain-all-pending-partner-offer-rates": { path: "/obtainAllPendingPartnerOfferRates", method: "GET" },
  "add-or-update-margin": { path: "/addOrUpdateMargin", method: "POST" },
  "obtain-partner-rates": { path: "/obtainRemittancePartnerRates", method: "POST" },
  "obtain-partner-all-rates": { path: "/obtainRemittancePartnerAllRates", method: "POST" },
  "insert-partner-rates": { path: "/insertRemittancePartnerRates", method: "POST" },
  "confirm-partner-rate": { path: "/confirmRemittancePartnerRate", method: "POST" },
  "cancel-partner-rate": { path: "/cancelRemittancePartnerRate", method: "POST" },
};

function proxy(action: string, body: string | undefined, authorization: string | null) {
  const config = ACTIONS[action];
  if (!config) {
    return NextResponse.json(
      { success: false, message: `Unknown rate action "${action}".` },
      { status: 404 }
    );
  }
  return proxyRemittanceRequest(config.path, { method: config.method, body, authorization });
}

export async function POST(request: Request, { params }: { params: { action: string } }) {
  const body = await request.text();
  return proxy(params.action, body, request.headers.get("authorization"));
}

export async function GET(request: Request, { params }: { params: { action: string } }) {
  return proxy(params.action, undefined, request.headers.get("authorization"));
}
