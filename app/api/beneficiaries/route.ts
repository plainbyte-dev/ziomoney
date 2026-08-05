import { NextResponse } from "next/server";

const UPSTREAM_PATH = "/api/remittance/beneficiaries";

function upstreamConfig() {
  const baseUrl = process.env.REMIT_API_BASE_URL;
  const user = process.env.REMIT_API_USER;
  const pass = process.env.REMIT_API_PASS;
  if (!baseUrl || !user || !pass) return null;
  return { baseUrl, auth: Buffer.from(`${user}:${pass}`).toString("base64") };
}

async function forward(upstream: Response) {
  const rawBody = await upstream.text();
  let data: unknown;
  try {
    data = JSON.parse(rawBody);
  } catch {
    console.error(`[remittance] beneficiaries upstream ${upstream.status}:`, rawBody);
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

export async function GET() {
  const config = upstreamConfig();
  if (!config) {
    return NextResponse.json(
      { success: false, message: "Remittance API is not configured on the server." },
      { status: 500 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${config.baseUrl}${UPSTREAM_PATH}`, {
      headers: { Authorization: `Basic ${config.auth}` },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not reach the remittance API." },
      { status: 502 }
    );
  }

  return forward(upstream);
}

export async function POST(request: Request) {
  const config = upstreamConfig();
  if (!config) {
    return NextResponse.json(
      { success: false, message: "Remittance API is not configured on the server." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));

  let upstream: Response;
  try {
    upstream = await fetch(`${config.baseUrl}${UPSTREAM_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${config.auth}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not reach the remittance API." },
      { status: 502 }
    );
  }

  return forward(upstream);
}
