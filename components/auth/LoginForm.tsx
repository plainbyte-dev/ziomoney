"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthField from "./AuthField";
import Button from "../Button";
import { useAuth } from "@/contexts/AuthContext";
import { consumeSessionExpiredFlag } from "@/lib/apiClient";

export default function LoginForm() {
  const router = useRouter();
  const { user, hydrated, login } = useAuth();
  const [rememberMe, setRememberMe] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (hydrated && user) {
      router.replace("/");
    }
  }, [hydrated, user, router]);

  // Set by lib/apiClient.ts when a token refresh fails and the session gets
  // force-ended — a one-shot flag so this notice only shows immediately
  // after landing here from that redirect, not on every future visit.
  useEffect(() => {
    setSessionExpired(consumeSessionExpiredFlag());
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    setSigningIn(true);
    const success = await login(username, password);
    if (success) {
      router.push("/");
    } else {
      setSigningIn(false);
      setError("Invalid username or password.");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-panel p-8 shadow-card">
      <h1 className="text-2xl font-bold text-heading">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">
        Sign in to your Zio Money admin account.
      </p>

      {sessionExpired && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Your session expired. Please sign in again.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <AuthField
          label="Username"
          name="username"
          placeholder="Enter your username"
          autoComplete="username"
          required
        />
        <AuthField
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <label className="flex items-center gap-2 text-sm text-heading/70">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe((v) => !v)}
            className="h-4 w-4 rounded border-border accent-brand-green"
          />
          Remember me
        </label>

        <Button type="submit" loading={signingIn} className="mt-2">
          {signingIn ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
