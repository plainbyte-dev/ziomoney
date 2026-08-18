import { fetchWithAuth } from "./apiClient";
import type { ApiResponse } from "./apiClient";

function parseErrorEnvelope<T>(status: number): ApiResponse<T> {
  return {
    success: false,
    message: `Unexpected response from server (HTTP ${status}).`,
    data: null,
    errorCode: null,
    timestamp: new Date().toISOString(),
  };
}

function networkErrorEnvelope<T>(message: string): ApiResponse<T> {
  return { success: false, message, data: null, errorCode: null, timestamp: new Date().toISOString() };
}

async function request<T>(
  url: string,
  init: { method: string; headers?: Record<string, string>; body?: string },
  networkErrorMessage: string
): Promise<ApiResponse<T>> {
  try {
    const res = await fetchWithAuth(url, init);
    const data = await res.json().catch(() => null);
    return data ? (data as ApiResponse<T>) : parseErrorEnvelope<T>(res.status);
  } catch {
    return networkErrorEnvelope<T>(networkErrorMessage);
  }
}

// For the action-name-style resources (kyc, rates, partners, compliance-rules,
// agent-files, transactions): POST/GET dispatched to /<basePath>/<action>.
export function createActionApi(basePath: string, networkErrorMessage: string) {
  return function callAction<T>(
    action: string,
    options: { method: "GET" | "POST"; body?: unknown }
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {};
    if (options.method === "POST") headers["Content-Type"] = "application/json";
    return request<T>(
      `${basePath}/${action}`,
      {
        method: options.method,
        headers,
        body: options.method === "POST" ? JSON.stringify(options.body ?? {}) : undefined,
      },
      networkErrorMessage
    );
  };
}

// For the path-suffix-style resources (beneficiaries, transfers): a REST path
// appended straight to /<basePath>, e.g. "", "/{id}", "?page=1".
export function createPathApi(basePath: string, networkErrorMessage: string) {
  return function callPath<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {};
    if (init?.body) headers["Content-Type"] = "application/json";
    return request<T>(
      `${basePath}${path}`,
      {
        method: init?.method ?? "GET",
        headers,
        body: typeof init?.body === "string" ? init.body : undefined,
      },
      networkErrorMessage
    );
  };
}
