"use client";

import { useCallback, useState } from "react";
import type { ApiResponse } from "./apiClient";

// Standardizes the "demo fake-latency path vs. live API call" shape that used
// to be hand-written per action in each contexts/*Context.tsx: an optional
// pre-flight `guard` (e.g. the offer-rate maker-checker self-approval check)
// runs before either branch; demo mode never touches the network; live mode
// calls the API and treats `success: false` (or missing `data`, unless
// `requireData: false`) as a failure.
//
// Migration recipe for a context not yet on this hook: find its `setXxxLoading
// /setXxxError` + `if (!isLive) {...} else {...}` block for a single action.
// The demo branch's body becomes `demo`, the live branch's API call becomes
// `live`, and whatever it does with a successful response becomes
// `onLiveSuccess`. `failValue` is whatever the function already returns on
// failure today (usually `false`, `null`, or nothing). Anything that loops
// over N payloads with partial success (CSV-import-style) does NOT fit this
// hook — leave it hand-written; see RatesContext.importCountryCurrencyCsv for
// the reference shape of that pattern instead.
export interface AsyncMutationOptions<TResult> {
  isLive: boolean;
  guard?: () => string | null;
  demo: () => Promise<TResult> | TResult;
  live: () => Promise<ApiResponse<unknown>>;
  onLiveSuccess: (response: ApiResponse<unknown>) => TResult | Promise<TResult>;
  failValue: TResult;
  fallbackErrorMessage: string;
  /** Default true: a `success: true` response with `data == null` still counts as a failure. */
  requireData?: boolean;
}

export function useAsyncMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <TResult,>(options: AsyncMutationOptions<TResult>): Promise<TResult> => {
    setError(null);

    if (options.guard) {
      const guardError = options.guard();
      if (guardError) {
        setError(guardError);
        return options.failValue;
      }
    }

    setLoading(true);
    try {
      if (!options.isLive) return await options.demo();

      const response = await options.live();
      const requireData = options.requireData ?? true;
      if (!response.success || (requireData && response.data == null)) {
        setError(response.message || options.fallbackErrorMessage);
        return options.failValue;
      }
      return options.onLiveSuccess(response);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, run };
}
