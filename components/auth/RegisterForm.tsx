"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthField from "./AuthField";

export default function RegisterForm() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (
      form.elements.namedItem("confirmPassword") as HTMLInputElement
    ).value;

    if (password !== confirmPassword) {
      setError("Passwords don't match. Check both fields and try again.");
      return;
    }

    if (!agreed) {
      setError("Accept the Terms of Service to create an account.");
      return;
    }

    setCreating(true);
    // Static demo: no real auth backend — simulate account creation, then enter the app.
    setTimeout(() => {
      router.push("/");
    }, 500);
  }

  return (
    <div className="rounded-2xl border border-border bg-panel p-8 shadow-card">
      <h1 className="text-2xl font-bold text-heading">Create your account</h1>
      <p className="mt-1 text-sm text-muted">
        Set up admin access to the Zio Money panel.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <AuthField label="Full Name" placeholder="John Doe" autoComplete="name" required />
        <AuthField
          label="Work Email"
          type="email"
          placeholder="you@ziomoney.com"
          autoComplete="email"
          required
        />
        <AuthField label="Company Name" placeholder="e.g. Transcash Sydney" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthField
            label="Password"
            type="password"
            name="password"
            placeholder="Create a password"
            autoComplete="new-password"
            required
          />
          <AuthField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <label className="flex items-start gap-2 text-sm text-heading/70">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed((v) => !v)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-brand-green"
          />
          I agree to the Terms of Service and Privacy Policy.
        </label>

        <button
          type="submit"
          disabled={creating}
          className="mt-2 rounded-full bg-brand-green px-6 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:opacity-70"
        >
          {creating ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-blue hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
