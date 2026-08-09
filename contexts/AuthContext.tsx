"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { loadState, saveState } from "@/lib/persist";
import { findUserByCredentials, type MockUser } from "@/data/authData";
import { useDataMode } from "./DataModeContext";
import * as authApi from "@/lib/authApi";
import type { TokenPair } from "@/lib/authApi";

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
}

const STORAGE_KEY = "zio-auth-state";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLive } = useDataMode();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [tokens, setTokens] = useState<TokenPair | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadState<AuthState>(STORAGE_KEY);
    if (saved) {
      setUser(saved.user);
      setTokens(saved.tokens);
    }
    setHydrated(true);
  }, []);

  // Skip the very first save (still holds the pre-restore default state) so it
  // can't race the restore effect above and clobber what's in localStorage.
  const skipNextSave = useRef(true);
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveState<AuthState | null>(STORAGE_KEY, user ? { user, tokens } : null);
  }, [user, tokens]);

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

      setTokens(nextTokens);
      setUser({
        id: validation.username,
        name: validation.username,
        role: validation.roles[0] ?? "User",
        username: validation.username,
        avatarUrl:
          "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop&crop=faces",
      });
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
    () => ({ user, hydrated, login, logout }),
    [user, hydrated, login, logout]
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
