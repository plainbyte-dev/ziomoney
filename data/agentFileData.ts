// A single parsed line from a previously uploaded agent file.
export interface AgentFileLine {
  id: number;
  agentUserName: string;
  fileName: string;
  lineNo: number;
  payload: string;
  remark: string;
  fileDateTime: string;
}
