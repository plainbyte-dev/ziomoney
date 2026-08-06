export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
  timestamp: string;
}

function envelopeError<T>(status: number): ApiEnvelope<T> {
  return {
    success: false,
    message: `Unexpected response from server (HTTP ${status}).`,
    data: null,
    errorCode: null,
    timestamp: new Date().toISOString(),
  };
}

async function postJson<T>(path: string, body?: unknown, accessToken?: string): Promise<ApiEnvelope<T>> {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  return (data as ApiEnvelope<T>) ?? envelopeError<T>(res.status);
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export function login(username: string, password: string) {
  return postJson<TokenPair>("/api/auth/login", { username, password });
}

export function refreshToken(refreshTokenValue: string) {
  return postJson<TokenPair>("/api/auth/refresh", { refreshToken: refreshTokenValue });
}

export function logout(accessToken: string) {
  return postJson<Record<string, never>>("/api/auth/logout", undefined, accessToken);
}

export function sendOtp(recipient: string) {
  return postJson<Record<string, never>>("/api/auth/otp/send", { recipient });
}

export function verifyOtp(recipient: string, otp: string) {
  return postJson<boolean>("/api/auth/otp/verify", { recipient, otp });
}

export interface ValidateResult {
  valid: boolean;
  username: string;
  roles: string[];
  error: string | null;
}

// Unlike the other auth endpoints this one isn't wrapped in ApiEnvelope — it's
// meant to be called by the API Gateway, not the client, but we expose it for
// pulling username/roles right after login.
export async function validateToken(accessToken: string): Promise<ValidateResult | null> {
  const res = await fetch("/api/auth/validate", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => null);
  return data as ValidateResult | null;
}
