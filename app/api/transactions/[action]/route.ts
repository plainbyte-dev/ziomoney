import { NextResponse } from "next/server";

const ACTIONS: Record<string, string> = {
  "view-transaction": "/viewTransaction",
  "by-staff": "/getTransactionByStaff",
  "by-ref-no": "/getRemittanceByrefno",
  "latest-by-username": "/getRemittanceByUsernamefrompartners",
};

export async function POST(request: Request, { params }: { params: { action: string } }) {
  const path = ACTIONS[params.action];
  if (!path) {
    return NextResponse.json(
      { success: false, message: `Unknown transaction action "${params.action}".` },
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

  const body = await request.json().catch(() => ({}));
  const auth = Buffer.from(`${user}:${pass}`).toString("base64");

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(body),
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
    console.error(`[remittance] ${params.action} upstream ${upstream.status}:`, rawBody);
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
