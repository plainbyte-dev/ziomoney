import { NextResponse } from "next/server";
import { proxyRemittanceRequest } from "../../remittance-proxy";

const ACTIONS: Record<string, { path: string; method: "GET" | "POST" }> = {
  "update-customer": { path: "/updateCustomer", method: "POST" },
  approve: { path: "/InsertApprovedKYC", method: "POST" },
  "compliance-approve": { path: "/InsertApprovedCompilenceKYC", method: "POST" },
  approved: { path: "/getAllapprovedKycs", method: "GET" },
  pending: { path: "/getAllUnapprovedKycs", method: "GET" },
  "compliance-hold": { path: "/getAllCompilenceHoldKycs", method: "GET" },
};

function proxy(action: string, body: string | undefined) {
  const config = ACTIONS[action];
  if (!config) {
    return NextResponse.json(
      { success: false, message: `Unknown KYC action "${action}".` },
      { status: 404 }
    );
  }
  return proxyRemittanceRequest(config.path, { method: config.method, body });
}

export async function POST(request: Request, { params }: { params: { action: string } }) {
  const body = await request.text();
  return proxy(params.action, body);
}

export async function GET(_request: Request, { params }: { params: { action: string } }) {
  return proxy(params.action, undefined);
}
