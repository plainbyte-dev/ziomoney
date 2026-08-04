import { NextResponse } from "next/server";

const ACTIONS: Record<string, { path: string; method: "GET" | "POST" }> = {
  "update-customer": { path: "/updateCustomer", method: "POST" },
  approve: { path: "/InsertApprovedKYC", method: "POST" },
  "compliance-approve": { path: "/InsertApprovedCompilenceKYC", method: "POST" },
  approved: { path: "/getAllapprovedKycs", method: "GET" },
  pending: { path: "/getAllUnapprovedKycs", method: "GET" },
  "compliance-hold": { path: "/getAllCompilenceHoldKycs", method: "GET" },
};

async function proxy(action: string, body: unknown) {
  const config = ACTIONS[action];
  if (!config) {
    return NextResponse.json(
      { success: false, message: `Unknown KYC action "${action}".` },
      { status: 404 }
    );
  }

  const baseUrl = process.env.REMIT_API_BASE_URL;
  const user = process.env.REMIT_API_USER;
  const pass = process.env.REMIT_API_PASS;

  if (!baseUrl || !user || !pass) {
    return NextResponse.json(
      { success: false, message: "Remittance API is not configured on the server." },
      { status: 500 }
    );
  }

  const auth = Buffer.from(`${user}:${pass}`).toString("base64");

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}${config.path}`, {
      method: config.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: config.method === "POST" ? JSON.stringify(body ?? {}) : undefined,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not reach the remittance API." },
      { status: 502 }
    );
  }

  const rawBody = await upstream.text();
  let data: unknown;
  try {
    data = JSON.parse(rawBody);
  } catch {
    console.error(`[remittance] ${action} upstream ${upstream.status}:`, rawBody);
    data = {
      success: false,
      message: `Remittance API returned HTTP ${upstream.status}.`,
      data: null,
      errorCode: String(upstream.status),
      timestamp: new Date().toISOString(),
    };
  }
  return NextResponse.json(data, { status: upstream.status });
}

export async function POST(request: Request, { params }: { params: { action: string } }) {
  const body = await request.json().catch(() => ({}));
  return proxy(params.action, body);
}

export async function GET(_request: Request, { params }: { params: { action: string } }) {
  return proxy(params.action, undefined);
}
