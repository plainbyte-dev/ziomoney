import { NextResponse } from "next/server";

interface ProxyOptions {
  method: "GET" | "POST";
  body?: string;
  // Forwarded as-is — the caller's own bearer token for logout/validate.
  // Login/refresh/otp take no auth header at all; credentials travel in the body.
  authorization?: string | null;
}

export async function proxyAuthRequest(path: string, options: ProxyOptions): Promise<NextResponse> {
  const baseUrl = process.env.AUTH_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { success: false, message: "Auth API is not configured on the server." },
      { status: 500 }
    );
  }

  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.authorization) headers.Authorization = options.authorization;

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}${path}`, {
      method: options.method,
      headers,
      body: options.body,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not reach the auth API." },
      { status: 502 }
    );
  }

  const rawBody = await upstream.text();
  let data: unknown;
  try {
    data = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    console.error(`[auth] ${path} upstream ${upstream.status}:`, rawBody);
    data = {
      success: false,
      message: `Auth API returned HTTP ${upstream.status}.`,
      data: null,
      errorCode: String(upstream.status),
      timestamp: new Date().toISOString(),
    };
  }
  return NextResponse.json(data, { status: upstream.status });
}
