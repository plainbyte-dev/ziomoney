import { loadState, saveState } from "./persist";
import type { TokenPair } from "./authApi";

const STORAGE_KEY = "zio-auth-state";

interface StoredAuthState {
  user: unknown;
  tokens: TokenPair | null;
}

// Client-side helpers for the plain fetch() wrappers in lib/*Api.ts, which
// run outside React and can't call useAuth(). Read/write the same
// localStorage entry AuthContext persists to (see contexts/AuthContext.tsx).
export function getAccessToken(): string | null {
  return loadState<StoredAuthState>(STORAGE_KEY)?.tokens?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return loadState<StoredAuthState>(STORAGE_KEY)?.tokens?.refreshToken ?? null;
}

// Called after a successful POST /api/auth/refresh — writes the new token
// pair into the same storage entry AuthContext owns, so getAccessToken()
// picks it up immediately on the very next API call. AuthContext's own
// in-memory `tokens` state goes stale until it next reads storage, which
// only matters for the accessToken sent on manual logout — tolerable, since
// the important path (every subsequent API call reading via getAccessToken)
// is correct immediately.
export function setStoredTokens(tokens: TokenPair): void {
  const current = loadState<StoredAuthState>(STORAGE_KEY);
  if (!current) return;
  saveState<StoredAuthState>(STORAGE_KEY, { ...current, tokens });
}

// Called when a refresh attempt fails (invalid/expired refresh token) —
// wipes the session outright rather than leaving a dead access token that
// would just 401 again on the next call. Same "null clears it" convention
// AuthContext's own logout uses.
export function clearStoredAuthState(): void {
  saveState<StoredAuthState | null>(STORAGE_KEY, null);
}
