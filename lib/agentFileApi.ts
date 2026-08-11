import { getAccessToken } from "./authToken";
import type { AgentFileLine } from "@/data/agentFileData";

export interface AgentFileApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode: string | null;
  timestamp: string;
}

async function callAgentFileAction<T>(action: string, body: unknown): Promise<AgentFileApiResponse<T>> {
  try {
    const token = getAccessToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`/api/agent-files/${action}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body ?? {}),
    });

    const data = await res.json().catch(() => null);
    if (!data) {
      return {
        success: false,
        message: `Unexpected response from server (HTTP ${res.status}).`,
        data: null,
        errorCode: null,
        timestamp: new Date().toISOString(),
      };
    }
    return data as AgentFileApiResponse<T>;
  } catch {
    return {
      success: false,
      message: "Network error while calling the agent file API.",
      data: null,
      errorCode: null,
      timestamp: new Date().toISOString(),
    };
  }
}

export function obtainFileUploadedByAgent(agentUserName: string) {
  return callAgentFileAction<string[]>("list", { agentUserName });
}

export function obtainFileContentByFileName(fileName: string) {
  return callAgentFileAction<AgentFileLine[]>("content", { fileName });
}
