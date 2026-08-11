import { NextResponse } from "next/server";
import { proxyRemittanceRequest } from "../../remittance-proxy";

const POST_ACTIONS: Record<string, string> = {
  "view-transaction": "/viewTransaction",
  "by-staff": "/getTransactionByStaff",
  "by-ref-no": "/getRemittanceByrefno",
  "latest-by-username": "/getRemittanceByUsernamefrompartners",
};

const GET_ACTIONS: Record<string, string> = {
  "compliance-holds": "/getAllCompileHoldRemittance",
  "unconfirmed-admin": "/getAllUnapprovedRemittances",
  "unconfirmed-partner": "/getAllUnapprovedRemittances2",
  confirmed: "/getAllConformedRemittances",
};

export async function POST(request: Request, { params }: { params: { action: string } }) {
  const path = POST_ACTIONS[params.action];
  if (!path) {
    return NextResponse.json(
      { success: false, message: `Unknown transaction action "${params.action}".` },
      { status: 404 }
    );
  }

  const body = await request.text();
  return proxyRemittanceRequest(path, {
    method: "POST",
    body,
    authorization: request.headers.get("authorization"),
  });
}

export async function GET(request: Request, { params }: { params: { action: string } }) {
  const path = GET_ACTIONS[params.action];
  if (!path) {
    return NextResponse.json(
      { success: false, message: `Unknown transaction action "${params.action}".` },
      { status: 404 }
    );
  }

  return proxyRemittanceRequest(path, {
    method: "GET",
    authorization: request.headers.get("authorization"),
  });
}
