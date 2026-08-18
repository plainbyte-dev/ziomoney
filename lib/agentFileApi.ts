import { createActionApi } from "./apiResource";
import type { AgentFileLine } from "@/data/agentFileData";

const callAction = createActionApi("/api/agent-files", "Network error while calling the agent file API.");
function callAgentFileAction<T>(action: string, body: unknown) {
  return callAction<T>(action, { method: "POST", body });
}

export function obtainFileUploadedByAgent(agentUserName: string) {
  return callAgentFileAction<string[]>("list", { agentUserName });
}

export function obtainFileContentByFileName(fileName: string) {
  return callAgentFileAction<AgentFileLine[]>("content", { fileName });
}
