"use client";

import { useState } from "react";
import { FileText, Search } from "lucide-react";
import TextField from "./TextField";
import Button from "./Button";
import Spinner from "./Spinner";
import { obtainFileContentByFileName, obtainFileUploadedByAgent } from "@/lib/agentFileApi";
import type { AgentFileLine } from "@/data/agentFileData";

export default function AgentFileUploadPanel() {
  const [agentUserName, setAgentUserName] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileLines, setFileLines] = useState<AgentFileLine[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!agentUserName.trim()) return;

    setListLoading(true);
    setListError(null);
    setSearched(true);
    setSelectedFile(null);
    setFileLines([]);

    const response = await obtainFileUploadedByAgent(agentUserName.trim());
    setListLoading(false);
    if (!response.success) {
      setListError(response.message || "Could not load files for this agent.");
      setFileNames([]);
      return;
    }
    setFileNames(response.data ?? []);
  }

  async function handleSelectFile(fileName: string) {
    setSelectedFile(fileName);
    setContentLoading(true);
    setContentError(null);
    setFileLines([]);

    const response = await obtainFileContentByFileName(fileName);
    setContentLoading(false);
    if (!response.success) {
      setContentError(response.message || "Could not load this file's content.");
      return;
    }
    setFileLines(response.data ?? []);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Upload Files</h1>
          <p className="mt-0.5 text-sm text-muted">
            Browse files previously uploaded by an agent.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3 bg-panel p-6 sm:p-8">
          <div className="w-full max-w-xs">
            <TextField
              label="Agent Username"
              required
              value={agentUserName}
              onChange={setAgentUserName}
              placeholder="Enter agent username"
            />
          </div>
          <Button type="submit" loading={listLoading} icon={<Search size={15} />}>
            {listLoading ? "Loading..." : "Load Files"}
          </Button>
        </form>
      </div>

      {searched && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <div className="overflow-hidden rounded-2xl border border-border shadow-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-sm font-bold uppercase text-heading">Files</h2>
            </div>
            <div className="bg-panel p-3">
              {listError && (
                <p className="m-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{listError}</p>
              )}

              {!listError && listLoading && (
                <p className="flex items-center gap-2 px-3 py-4 text-sm text-muted">
                  <Spinner className="h-4 w-4" />
                  Loading files...
                </p>
              )}

              {!listError && !listLoading && fileNames.length === 0 && (
                <p className="px-3 py-4 text-sm text-muted">
                  No files found for &ldquo;{agentUserName}&rdquo;.
                </p>
              )}

              <div className="flex flex-col gap-0.5">
                {fileNames.map((fileName) => (
                  <button
                    key={fileName}
                    type="button"
                    onClick={() => handleSelectFile(fileName)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface ${
                      selectedFile === fileName
                        ? "bg-brand-green-light font-semibold text-brand-green-dark"
                        : "text-heading/80"
                    }`}
                  >
                    <FileText size={14} className="shrink-0" />
                    <span className="truncate">{fileName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border shadow-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-sm font-bold uppercase text-heading">
                {selectedFile ?? "File Content"}
              </h2>
            </div>
            <div className="overflow-x-auto bg-panel">
              {!selectedFile && (
                <p className="px-6 py-10 text-center text-sm text-muted">
                  Select a file to view its content.
                </p>
              )}

              {selectedFile && contentError && (
                <p className="m-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{contentError}</p>
              )}

              {selectedFile && !contentError && (
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                      <th className="px-4 py-3">Line</th>
                      <th className="px-4 py-3">Payload</th>
                      <th className="px-4 py-3">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contentLoading && (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-sm text-muted">
                          <span className="inline-flex items-center gap-2">
                            <Spinner className="h-4 w-4" />
                            Loading content...
                          </span>
                        </td>
                      </tr>
                    )}

                    {!contentLoading && fileLines.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center text-sm text-muted">
                          This file has no parsed content.
                        </td>
                      </tr>
                    )}

                    {!contentLoading &&
                      fileLines.map((line) => (
                        <tr key={line.id} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3 text-heading/70">{line.lineNo}</td>
                          <td className="px-4 py-3 font-mono text-xs text-heading/80">{line.payload}</td>
                          <td className="px-4 py-3 text-heading/70">{line.remark || "-"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
