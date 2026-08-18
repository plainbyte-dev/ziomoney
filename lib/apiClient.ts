import { getAccessToken, getRefreshToken, setStoredTokens, clearStoredAuthState } from "./authToken";
import { refreshToken as requestTokenRefresh } from "./authApi";

// Shared response envelope every lib/*Api.ts wrapper resolves to — the
// remittance/auth API returns this exact shape on every route, proxied
// through unchanged (see app/api/remittance-proxy.ts).
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
  timestamp: string;
}

const SESSION_EXPIRED_EVENT = "zio:session-expired";
const SESSION_EXPIRED_FLAG_KEY = "zio-session-expired";

let refreshPromise: Promise<string | null> | null = null;

// Coalesces concurrent 401s (e.g. several panels loading in parallel) into a
// single refresh call rather than firing one refresh request per in-flight
// API call.
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refresh = getRefreshToken();
      if (!refresh) return null;
      const response = await requestTokenRefresh(refresh);
      if (!response.success || !response.data) return null;
      setStoredTokens(response.data);
      return response.data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// AuthContext (a React context, sitting above every screen) listens for this
// to clear its own in-memory user/tokens state — which in turn trips
// AppShell's existing "no user -> redirect to /login" effect. Also drops a
// one-shot flag LoginForm reads to show a "session expired" notice.
function endSession() {
  clearStoredAuthState();
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_EXPIRED_FLAG_KEY, "1");
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export function consumeSessionExpiredFlag(): boolean {
  if (typeof window === "undefined") return false;
  const flagged = window.sessionStorage.getItem(SESSION_EXPIRED_FLAG_KEY) === "1";
  if (flagged) window.sessionStorage.removeItem(SESSION_EXPIRED_FLAG_KEY);
  return flagged;
}

export { SESSION_EXPIRED_EVENT };

// Shared fetch primitive for every lib/*Api.ts wrapper: attaches the bearer
// token, and on a 401 attempts exactly one silent token refresh + retry
// before giving up and ending the session — rather than every screen
// independently failing on an expired token with no recovery (this app had
// no refresh flow at all before this).
export async function fetchWithAuth(
  url: string,
  init: { method: string; headers?: Record<string, string>; body?: string }
): Promise<Response> {
  const attempt = (token: string | null) =>
    fetch(url, {
      method: init.method,
      headers: { ...init.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: init.body,
    });

  const token = getAccessToken();
  const res = await attempt(token);

  if (res.status !== 401) return res;

  // No token at all just means "not logged in" — a refresh can't fix that,
  // and there's nothing to end that isn't already ended.
  if (!token) {
    endSession();
    return res;
  }

  const newToken = await refreshAccessToken();
  if (!newToken) {
    endSession();
    return res;
  }
  return attempt(newToken);
}
