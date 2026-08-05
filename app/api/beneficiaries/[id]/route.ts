import { NextResponse } from "next/server";

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
    console.error(`[remittance] beneficiaries/:id upstream ${upstream.status}:`, rawBody);
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

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const config = upstreamConfig();
  if (!config) {
    return NextResponse.json(
      { success: false, message: "Remittance API is not configured on the server." },
      { status: 500 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${config.baseUrl}/api/remittance/beneficiaries/${params.id}`, {
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

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const config = upstreamConfig();
  if (!config) {
    return NextResponse.json(
      { success: false, message: "Remittance API is not configured on the server." },
      { status: 500 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${config.baseUrl}/api/remittance/beneficiaries/${params.id}`, {
      method: "DELETE",
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
