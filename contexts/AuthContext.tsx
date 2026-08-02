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

type SessionUser = Omit<MockUser, "password">;

interface AuthContextValue {
  user: SessionUser | null;
  hydrated: boolean;
  login: (email: string, password: string) => boolean;
  registerAndLogin: (name: string, email: string) => void;
  logout: () => void;
}

const STORAGE_KEY = "zio-auth-state";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadState<SessionUser>(STORAGE_KEY);
    if (saved) setUser(saved);
    setHydrated(true);
  }, []);

  // Skip the very first save (still holds the pre-restore default state) so it
  // can't race the restore effect above and clobber what's in localStorage.
  const skipNextSave = useRef(true);
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
    } else if (user) {
      saveState(STORAGE_KEY, user);
    } else {
      saveState(STORAGE_KEY, null);
    }
    return () => {
      skipNextSave.current = true;
    };
  }, [user]);

  const login = useCallback((email: string, password: string) => {
    const match = findUserByCredentials(email, password);
    if (!match) return false;
    const { password: _password, ...sessionUser } = match;
    setUser(sessionUser);
    return true;
  }, []);

  // Static demo: no real backend to persist a new account against, so a
  // freshly "registered" user is just dropped straight into a session.
  const registerAndLogin = useCallback((name: string, email: string) => {
    setUser({
      id: `U-${Date.now()}`,
      name: name || "New User",
      role: "Admin",
      email,
      avatarUrl:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop&crop=faces",
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, hydrated, login, registerAndLogin, logout }),
    [user, hydrated, login, registerAndLogin, logout]
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
