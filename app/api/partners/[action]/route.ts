import { NextResponse } from "next/server";
import { proxyRemittanceRequest } from "../../remittance-proxy";

const ACTIONS: Record<string, { path: string; method: "GET" | "POST" }> = {
  register: { path: "/insertRemittancePartner", method: "POST" },
  list: { path: "/obtainAllRemittancePartner", method: "GET" },
  lookup: { path: "/obtainRemittancePartner", method: "POST" },
  info: { path: "/getRemittancePartnerInfo", method: "POST" },
  "update-credit-limit": { path: "/updateCreditLimit", method: "POST" },
  "add-actual-balance": { path: "/addActualBalance", method: "POST" },
};

function proxy(action: string, body: string | undefined, authorization: string | null) {
  const config = ACTIONS[action];
  if (!config) {
    return NextResponse.json(
      { success: false, message: `Unknown partner action "${action}".` },
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
