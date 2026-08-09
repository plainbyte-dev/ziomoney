"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthField from "./AuthField";
import Spinner from "../Spinner";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const { user, hydrated, login } = useAuth();
  const [rememberMe, setRememberMe] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && user) {
      router.replace("/");
    }
  }, [hydrated, user, router]);

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

        <button
          type="submit"
          disabled={signingIn}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:opacity-70"
        >
          {signingIn && <Spinner className="h-4 w-4" />}
          {signingIn ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
