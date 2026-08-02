export function downloadHtmlTableAsExcel(filename: string, tableHtml: string): void {
  const document = window.document;
  const source = `<html><head><meta charset="utf-8"></head><body>${tableHtml}</body></html>`;
  const blob = new Blob(["﻿", source], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
