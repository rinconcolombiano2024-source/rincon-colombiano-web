"use client";

import { analyticsCsv } from "@/lib/analytics/export";
import type { AnalyticsResult } from "@/lib/analytics/reports";

export function AnalyticsExport({ report, days }: { report: Extract<AnalyticsResult, { status: "ready" }>; days: number }) {
  function download() {
    const url = URL.createObjectURL(new Blob([analyticsCsv(report, days)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `rincon-estadisticas-${days}-dias-${report.updatedAt.slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Give the browser time to start the download before releasing the blob.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <button type="button" onClick={download} className="min-h-11 rounded-xl border-2 border-[#123d73] bg-white px-5 py-3 font-bold text-[#123d73] hover:bg-[#f4f1eb] focus-visible:outline-2 focus-visible:outline-offset-2">Descargar estadísticas (CSV)</button>;
}
