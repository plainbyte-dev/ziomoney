"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthField from "./AuthField";
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
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    setSigningIn(true);
    const success = await login(email, password);
    if (success) {
      router.push("/");
    } else {
      setSigningIn(false);
      setError("Invalid email or password.");
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
          label="Email"
          name="email"
          placeholder="you@ziomoney.com"
          autoComplete="email"
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

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-heading/70">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe((v) => !v)}
              className="h-4 w-4 rounded border-border accent-brand-green"
            />
            Remember me
          </label>
          <a href="#" className="font-medium text-brand-blue hover:underline">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={signingIn}
          className="mt-2 rounded-full bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:opacity-70"
        >
          {signingIn ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-brand-blue hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
