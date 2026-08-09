import { loadState } from "./persist";

const STORAGE_KEY = "zio-auth-state";

interface StoredAuthState {
  tokens: { accessToken: string } | null;
}

// Client-side helper for the plain fetch() wrappers in lib/*Api.ts, which run
// outside React and can't call useAuth(). Reads the same localStorage entry
// AuthContext persists to (see contexts/AuthContext.tsx).
export function getAccessToken(): string | null {
  return loadState<StoredAuthState>(STORAGE_KEY)?.tokens?.accessToken ?? null;
}
