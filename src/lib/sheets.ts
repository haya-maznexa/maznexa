import type { SheetRow } from "@/types";

const SHEET_ID =
  process.env.NEXT_PUBLIC_SHEET_ID ||
  "1MC35b4aooXQNZJL4NVFZUtHz2sjtQV-impyRVpFqH4Q";
const SHEET_GID = process.env.NEXT_PUBLIC_SHEET_GID || "656440254";

const MONTH_ORDER: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4,
  may: 5, june: 6, july: 7, august: 8,
  september: 9, october: 10, november: 11, december: 12,
};

function inferYear(monthNum: number, prevMonthNum: number | null, prevYear: number): number {
  if (prevMonthNum === null) {
    // First row: if month is late in year (Oct-Dec) assume 2024, else 2025
    return monthNum >= 10 ? 2024 : 2025;
  }
  // Crossed year boundary going forward
  if (monthNum < prevMonthNum) return prevYear + 1;
  return prevYear;
}

function parseNum(val: string | undefined): number {
  if (!val || val.trim() === "" || val.trim() === "-") return 0;
  const n = parseFloat(val.replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

export function csvUrl(): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
}

export function parseCSV(raw: string): SheetRow[] {
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header row to find column indices
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));

  const colIdx = {
    company: findCol(headers, ["compeny", "company", "client", "brand"]),
    month: findCol(headers, ["month"]),
    service: findCol(headers, ["service"]),
    platform: findCol(headers, ["platform"]),
    type: findCol(headers, ["type"]),
    deliverables: findCol(headers, ["deliverbles", "deliverables", "planned"]),
    delivered: findCol(headers, ["delivered"]),
    extra: findCol(headers, ["extra"]),
    hDeliverables: findCol(headers, ["h deliverbles", "h deliverables", "hdeliverbles", "hdeliverables"]),
    hDelivered: findCol(headers, ["h delivered", "hdelivered"]),
    hExtra: findCol(headers, ["h extra", "hextra"]),
  };

  const rows: SheetRow[] = [];
  let prevMonthNum: number | null = null;
  let prevYear = 2024;

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);

    const company = get(cols, colIdx.company);
    const monthRaw = get(cols, colIdx.month);
    const service = get(cols, colIdx.service);

    // Skip empty rows
    if (!company && !monthRaw && !service) continue;

    const monthLower = monthRaw.toLowerCase().trim();
    const monthNum = MONTH_ORDER[monthLower] ?? 0;

    const year = monthNum > 0
      ? inferYear(monthNum, prevMonthNum, prevYear)
      : prevYear;

    if (monthNum > 0) {
      prevMonthNum = monthNum;
      prevYear = year;
    }

    const monthKey = monthNum > 0
      ? `${year}-${String(monthNum).padStart(2, "0")}`
      : "0000-00";

    rows.push({
      company: company || "Unknown",
      month: monthRaw || "Unknown",
      service: service || "Unknown",
      platform: get(cols, colIdx.platform) || "-",
      type: get(cols, colIdx.type) || "-",
      deliverables: parseNum(get(cols, colIdx.deliverables)),
      delivered: parseNum(get(cols, colIdx.delivered)),
      extra: parseNum(get(cols, colIdx.extra)),
      hDeliverables: parseNum(get(cols, colIdx.hDeliverables)),
      hDelivered: parseNum(get(cols, colIdx.hDelivered)),
      hExtra: parseNum(get(cols, colIdx.hExtra)),
      monthIndex: monthNum,
      year,
      monthKey,
    });
  }

  return rows.sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey) || a.company.localeCompare(b.company)
  );
}

function findCol(headers: string[], candidates: string[]): number {
  for (const c of candidates) {
    const idx = headers.findIndex((h) => h.includes(c));
    if (idx >= 0) return idx;
  }
  return -1;
}

function get(cols: string[], idx: number): string {
  if (idx < 0 || idx >= cols.length) return "";
  return cols[idx].replace(/^"|"$/g, "").trim();
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
