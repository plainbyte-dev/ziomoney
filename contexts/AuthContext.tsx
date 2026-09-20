"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadState, saveState } from "@/lib/persist";
import { findUserByCredentials, type MockUser } from "@/data/authData";
import { useDataMode } from "./DataModeContext";
import * as authApi from "@/lib/authApi";
import type { TokenPair } from "@/lib/authApi";
import { SESSION_EXPIRED_EVENT } from "@/lib/apiClient";
import { lookupRemittancePartner, type RemittancePartnerRecord } from "@/lib/partnersApi";

type SessionUser = Omit<MockUser, "password">;

interface AuthState {
  user: SessionUser | null;
  tokens: TokenPair | null;
}

interface AuthContextValue {
  user: SessionUser | null;
  hydrated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  // The logged-in agent's own remittance partner record — its
  // settlementCurrency is what a transaction the agent creates now sends
  // FROM, replacing the old "infer from the sender's nationality" behavior.
  agentPartner: RemittancePartnerRecord | null;
  agentPartnerLoading: boolean;
  agentPartnerError: string | null;
}

const STORAGE_KEY = "zio-auth-state";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLive } = useDataMode();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [tokens, setTokens] = useState<TokenPair | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [agentPartner, setAgentPartner] = useState<RemittancePartnerRecord | null>(null);
  const [agentPartnerLoading, setAgentPartnerLoading] = useState(false);
  const [agentPartnerError, setAgentPartnerError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadState<AuthState>(STORAGE_KEY);
    if (saved) {
      setUser(saved.user);
      setTokens(saved.tokens);
    }
    setHydrated(true);
  }, []);

  // Fired by lib/apiClient.ts (outside React, from any lib/*Api.ts call) once
  // a token refresh fails — clears this context's own state so AppShell's
  // existing "no user -> redirect to /login" effect takes over. localStorage
  // is already cleared by that point; this just brings React state in sync.
  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
      setTokens(null);
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  // Resolve the logged-in agent's own partner record (for its
  // settlementCurrency) once a user is present. Not meaningful in demo mode
  // — there's no partner record backing a mock user — so it's left null
  // there and callers fall back to a fixed home currency.
  useEffect(() => {
    // Also requires a real access token: switching the app into Live mode
    // doesn't by itself mean this session ever logged in against the live
    // API (e.g. you can log in under static/demo mode, which stores
    // tokens: null, then flip to Live without logging in again). Calling out
    // with no token would 401 and, since there's no token to refresh,
    // immediately end the session — a spurious forced logout for a session
    // that was never live-authenticated in the first place, not an expired one.
    if (!isLive || !user?.username || !tokens?.accessToken) {
      setAgentPartner(null);
      setAgentPartnerError(null);
      return;
    }
    let cancelled = false;
    setAgentPartnerLoading(true);
    setAgentPartnerError(null);
    lookupRemittancePartner(user.username).then((response) => {
      if (cancelled) return;
      setAgentPartnerLoading(false);
      if (response.success && response.data) {
        setAgentPartner(response.data);
      } else {
        setAgentPartner(null);
        setAgentPartnerError(response.message || "Could not resolve your agent profile.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isLive, user?.username, tokens?.accessToken]);

  // Gated on `hydrated` state (not a ref-based "skip the first run" flag) so
  // this can't fire before the restore effect above has actually committed.
  // A ref flip is NOT enough: React 18 Strict Mode double-invokes every
  // effect on mount in dev (mount -> cleanup -> mount again) using the SAME
  // pre-restore render's closure, so a ref consumed by the first invocation
  // lets the second one straight through — calling saveState with the
  // still-null pre-restore user/tokens and wiping out whatever this exact
  // effect (and the restore effect) had just written, moments before the
  // real state change re-fires it correctly. `hydrated` only ever flips via
  // a real committed render, so both Strict Mode invocations on the initial
  // (pre-restore) render see it as false and skip.
  useEffect(() => {
    if (!hydrated) return;
    saveState<AuthState | null>(STORAGE_KEY, user ? { user, tokens } : null);
  }, [hydrated, user, tokens]);

  const login = useCallback(
    async (username: string, password: string) => {
      if (!isLive) {
        // Static demo: no real backend — check against the mock user list, with
        // a small artificial delay so the UX matches a real network round trip.
        await new Promise((resolve) => setTimeout(resolve, 400));
        const match = findUserByCredentials(username, password);
        if (!match) return false;
        const { password: _password, ...sessionUser } = match;
        setUser(sessionUser);
        setTokens(null);
        return true;
      }

      const loginResponse = await authApi.login(username, password);
      if (!loginResponse.success || !loginResponse.data) return false;

      const nextTokens = loginResponse.data;
      const validation = await authApi.validateToken(nextTokens.accessToken);
      if (!validation || !validation.valid) return false;

      const nextUser: SessionUser = {
        id: validation.username,
        name: validation.username,
        role: validation.roles[0] ?? "User",
        username: validation.username,
        avatarUrl:
          "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop&crop=faces",
      };

      // Write-through to localStorage immediately, rather than relying only
      // on the persist effect below: the moment `user` state goes non-null,
      // AppShell mounts every resource provider/panel for the first time in
      // the same commit, and their mount-time API calls read the access
      // token synchronously via lib/authToken.ts's getAccessToken() — which
      // reads localStorage, not React state. Since a parent's effects (this
      // component's persist effect) run after its newly-mounted children's
      // effects in the same commit, that first wave of calls would otherwise
      // race ahead of the persist effect and go out with no Authorization
      // header at all.
      saveState<AuthState>(STORAGE_KEY, { user: nextUser, tokens: nextTokens });

      setTokens(nextTokens);
      setUser(nextUser);
      return true;
    },
    [isLive]
  );

  const logout = useCallback(async () => {
    // Clear local session immediately — the API call is best-effort and
    // shouldn't block the UI from signing the user out.
    const accessToken = tokens?.accessToken;
    setUser(null);
    setTokens(null);
    if (isLive && accessToken) {
      await authApi.logout(accessToken).catch(() => null);
    }
  }, [isLive, tokens]);

  const value = useMemo(
    () => ({ user, hydrated, login, logout, agentPartner, agentPartnerLoading, agentPartnerError }),
    [user, hydrated, login, logout, agentPartner, agentPartnerLoading, agentPartnerError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
