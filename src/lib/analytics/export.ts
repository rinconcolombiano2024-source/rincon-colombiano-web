type ExportReport = {
  totals: number[];
  orderClicks: number;
  days: { label: string; values: number[] }[];
  pages: { label: string; values: number[] }[];
  sources: { label: string; values: number[] }[];
  updatedAt: string;
  timeZone: string;
};

/** Quote every field and neutralize spreadsheet formulas in external labels. */
function cell(value: string | number): string {
  const text = String(value);
  const safe = /^[\s\uFEFF]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function analyticsCsv(report: ExportReport, period: number): string {
  const rows: (string | number)[][] = [
    ["Rincón Colombiano", "Estadísticas medidas con consentimiento"],
    ["Periodo (días)", period], ["Consultado", report.updatedAt], ["Zona horaria", report.timeZone],
    ["Indicador", "Valor"],
    ["Visitantes medidos", report.totals[0] ?? 0], ["Sesiones", report.totals[1] ?? 0],
    ["Páginas vistas", report.totals[2] ?? 0], ["Clics para pedir (no pedidos confirmados)", report.orderClicks],
  ];
  for (const [label, metric, entries] of [
    ["Fecha", "Vistas", report.days], ["Página", "Vistas", report.pages], ["Canal", "Sesiones", report.sources],
  ] as const) {
    rows.push([], [label, metric]);
    for (const entry of entries) { rows.push([entry.label, entry.values[0] ?? 0]); }
  }
  return "\uFEFF" + rows.map(row => row.map(cell).join(",")).join("\r\n") + "\r\n";
}
