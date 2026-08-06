import type { TokenPair } from "./authApi";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// The remittance API only validates Bearer JWTs issued by the auth service —
// it has no login/Basic-auth mechanism of its own (see its OpenAPI doc: every
// route just declares `security: [{Bearer: []}]`, no auth paths). So the
// proxy logs in once as a service account and reuses the token until near
// expiry, rather than requiring a human session for server-to-server calls.
let cachedToken: { accessToken: string; expiresAt: number } | null = null;
let pendingLogin: Promise<string | null> | null = null;

async function loginServiceAccount(): Promise<string | null> {
  const baseUrl = process.env.AUTH_API_BASE_URL;
  const username = process.env.REMIT_AUTH_USER;
  const password = process.env.REMIT_AUTH_PASS;

  if (!baseUrl || !username || !password) {
    console.error("[remittance] REMIT_AUTH_USER/REMIT_AUTH_PASS/AUTH_API_BASE_URL not configured.");
    return null;
  }

  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = (await res.json().catch(() => null)) as ApiEnvelope<TokenPair> | null;
    if (!data?.success || !data.data) {
      console.error("[remittance] service-account login failed:", data?.message ?? `HTTP ${res.status}`);
      return null;
    }
    // Refresh a little early so a near-expiry token is never handed to a caller.
    cachedToken = {
      accessToken: data.data.accessToken,
      expiresAt: Date.now() + Math.max(data.data.expiresIn - 30, 0) * 1000,
    };
    return cachedToken.accessToken;
  } catch (err) {
    console.error("[remittance] service-account login error:", err);
    return null;
  }
}

export async function getServiceAccessToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.accessToken;

  // Coalesce concurrent requests during a token refresh into one login call.
  if (!pendingLogin) {
    pendingLogin = loginServiceAccount().finally(() => {
      pendingLogin = null;
    });
  }
  return pendingLogin;
}
