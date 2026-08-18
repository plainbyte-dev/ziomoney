"use client";

import { useCallback, useState } from "react";
import type { ApiResponse } from "./apiClient";

// Standardizes the "refresh a list/record from the API" shape that used to be
// hand-written per resource in each contexts/*Context.tsx: no-op in demo mode
// (the local state already reflects whatever the user has done locally),
// otherwise wipe local state and fetch before replacing it — demo data must
// never linger on screen while a live fetch is in flight.
//
// Migration recipe for a context not yet on this hook: find its
// `refreshX`-style function. If it fetches one endpoint, its body becomes the
// `fetch` closure and its state setters become `clear`/`onSuccess`. If it fans
// out to several endpoints (e.g. KycContext.refreshLists did, via
// Promise.all), do the fan-out *inside* `fetch` and synthesize one combined
// ApiResponse (first failing response wins the error message) — see
// KycContext.tsx for the reference shape. If a response needs a runtime shape
// check (e.g. an endpoint documented with an ambiguous/bare-string schema),
// do the check inside `fetch` too and return a synthesized failure envelope
// on mismatch — the hook's normal error path then handles it with no special
// casing at the call site.
export interface AsyncQueryOptions<D> {
  isLive: boolean;
  clear: () => void;
  fetch: () => Promise<ApiResponse<D>>;
  onSuccess: (data: D) => void;
  fallbackErrorMessage: string;
}

export function useAsyncQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <D,>(options: AsyncQueryOptions<D>): Promise<void> => {
    if (!options.isLive) return;

    options.clear();
    setLoading(true);
    setError(null);

    const response = await options.fetch();
    setLoading(false);

    if (!response.success) {
      setError(response.message || options.fallbackErrorMessage);
      return;
    }
    options.onSuccess((response.data ?? null) as D);
  }, []);

  return { loading, error, run };
}
