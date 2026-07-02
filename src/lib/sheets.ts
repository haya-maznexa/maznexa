import type { SheetRow } from "@/types";

const SHEET_ID =
  process.env.NEXT_PUBLIC_SHEET_ID ||
  "1MC35b4aooXQNZJL4NVFZUtHz2sjtQV-impyRVpFqH4Q";
const SHEET_GID = process.env.NEXT_PUBLIC_SHEET_GID || "656440254";

// Maps full names AND 3-letter abbreviations to a month number.
const MONTH_NAMES: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

// Parses a Month cell into { month: 1-12, year }. Handles formats like:
//   "01 / Nov /2024", "1/11/2024", "Nov 2024", "November 2024",
//   "2024-11-01", "11/2024"
function parseMonthCell(raw: string): { month: number; year: number } | null {
  if (!raw) return null;
  const s = raw.trim();

  // Find a 4-digit year anywhere in the string
  const yearMatch = s.match(/\b(20\d{2})\b/);

  // 1) Named month (Nov, November, …)
  const nameMatch = s.toLowerCase().match(/[a-z]+/);
  if (nameMatch && MONTH_NAMES[nameMatch[0]] !== undefined) {
    const month = MONTH_NAMES[nameMatch[0]];
    const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();
    return { month, year };
  }

  // 2) Numeric date: pull all number groups
  const nums = s.match(/\d+/g);
  if (nums && nums.length >= 2) {
    const parts = nums.map(Number);
    // ISO-ish: 2024-11-01
    if (parts[0] > 1900) {
      return { month: clampMonth(parts[1]), year: parts[0] };
    }
    // DD/MM/YYYY or MM/YYYY  → find the year, the other 1-12 value is month
    const year = yearMatch ? Number(yearMatch[1]) : parts[parts.length - 1];
    // Prefer the part that looks like a month (1-12) and isn't the year
    const candidates = parts.filter((p) => p !== year);
    const month = candidates.find((p) => p >= 1 && p <= 12) ?? candidates[candidates.length - 1] ?? 1;
    return { month: clampMonth(month), year };
  }

  return null;
}

function clampMonth(m: number): number {
  return Math.min(12, Math.max(1, m));
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

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);

    const company = get(cols, colIdx.company);
    const monthRaw = get(cols, colIdx.month);
    const service = get(cols, colIdx.service);

    // Skip empty rows
    if (!company && !monthRaw && !service) continue;

    const parsed = parseMonthCell(monthRaw);
    const monthNum = parsed?.month ?? 0;
    const year = parsed?.year ?? 0;

    const monthKey = parsed
      ? `${year}-${String(monthNum).padStart(2, "0")}`
      : "0000-00";

    // Clean, human-readable month label e.g. "November 2024"
    const monthLabel = parsed
      ? new Date(year, monthNum - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : (monthRaw || "Unknown");

    rows.push({
      company: company || "Unknown",
      month: monthLabel,
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
