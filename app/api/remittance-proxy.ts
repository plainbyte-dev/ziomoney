import { NextResponse } from "next/server";

interface ProxyOptions {
  method: "GET" | "POST" | "DELETE";
  body?: string;
  // The signed-in user's own bearer token, forwarded as-is — the remittance
  // API validates Bearer JWTs issued by the auth service on every route.
  authorization?: string | null;
}

export async function proxyRemittanceRequest(path: string, options: ProxyOptions): Promise<NextResponse> {
  const baseUrl = process.env.REMIT_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { success: false, message: "Remittance API is not configured on the server." },
      { status: 500 }
    );
  }

  if (!options.authorization) {
    return NextResponse.json(
      {
        success: false,
        message: "Not authenticated.",
        data: null,
        errorCode: "MISSING_BEARER_TOKEN",
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  const headers: Record<string, string> = { Authorization: options.authorization };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}${path}`, {
      method: options.method,
      headers,
      body: options.body,
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
    data = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    console.error(`[remittance] ${path} upstream ${upstream.status}:`, rawBody);
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
