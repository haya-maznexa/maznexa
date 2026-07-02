import type { SheetRow } from "@/types";

function toCSV(rows: SheetRow[]): string {
  const headers = [
    "Company", "Month", "Year", "Service", "Platform", "Type",
    "Deliverables", "Delivered", "Extra", "H Planned", "H Delivered", "H Extra",
    "Completion %",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        `"${r.company}"`, `"${r.month}"`, r.year, `"${r.service}"`,
        `"${r.platform}"`, `"${r.type}"`,
        r.deliverables, r.delivered, r.extra,
        r.hDeliverables, r.hDelivered, r.hExtra,
        r.deliverables > 0
          ? ((r.delivered / r.deliverables) * 100).toFixed(1)
          : "0",
      ].join(",")
    ),
  ];
  return lines.join("\n");
}

export function exportCSV(rows: SheetRow[], filename = "mazinxsa-data"): void {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

export async function exportExcel(rows: SheetRow[], filename = "mazinxsa-data"): Promise<void> {
  const XLSX = await import("xlsx");
  const wsData = rows.map((r) => ({
    Company: r.company, Month: r.month, Year: r.year,
    Service: r.service, Platform: r.platform, Type: r.type,
    Deliverables: r.deliverables, Delivered: r.delivered, Extra: r.extra,
    "H Planned": r.hDeliverables, "H Delivered": r.hDelivered, "H Extra": r.hExtra,
    "Completion %": r.deliverables > 0
      ? +((r.delivered / r.deliverables) * 100).toFixed(1)
      : 0,
  }));
  const ws = XLSX.utils.json_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportPDF(): void {
  window.print();
}

function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
