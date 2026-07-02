// ─── Raw Sheet Row ────────────────────────────────────────────────────────────

export interface SheetRow {
  company: string;
  month: string;
  service: string;
  platform: string;
  type: string;
  deliverables: number;
  delivered: number;
  extra: number;
  hDeliverables: number;
  hDelivered: number;
  hExtra: number;
  // derived
  monthIndex: number;   // 0-based sort index
  year: number;
  monthKey: string;     // "2025-01"
}

// ─── Filter State ─────────────────────────────────────────────────────────────

export interface FilterState {
  months: string[]; // monthKeys, e.g. ["2025-08", "2025-07"]
  brands: string[];
  platforms: string[];
  services: string[];
  searchQuery: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface KPIData {
  totalRows: number;
  totalDeliverables: number;
  totalDelivered: number;
  totalExtra: number;
  completionRate: number;
  overDeliveryRate: number;
  totalHPlanned: number;
  totalHDelivered: number;
  totalHExtra: number;
  hoursEfficiency: number;
  activeBrands: number;
  activePlatforms: number;
  activeServices: number;
  activeMonths: number;
}

export interface BrandMetric {
  brand: string;
  deliverables: number;
  delivered: number;
  extra: number;
  completionRate: number;
  overDeliveryRate: number;
  hPlanned: number;
  hDelivered: number;
  hoursEfficiency: number;
  platforms: number;
  services: number;
  rows: number;
}

export interface PlatformMetric {
  platform: string;
  deliverables: number;
  delivered: number;
  extra: number;
  completionRate: number;
  overDeliveryRate: number;
  hPlanned: number;
  hDelivered: number;
  brands: number;
  rows: number;
}

export interface ServiceMetric {
  service: string;
  deliverables: number;
  delivered: number;
  extra: number;
  completionRate: number;
  overDeliveryRate: number;
  hPlanned: number;
  hDelivered: number;
  brands: number;
  platforms: number;
  rows: number;
}

export interface MonthlyMetric {
  monthKey: string;
  month: string;
  year: number;
  deliverables: number;
  delivered: number;
  extra: number;
  completionRate: number;
  hPlanned: number;
  hDelivered: number;
  brands: number;
  rows: number;
}

export interface TrendMetric {
  monthKey: string;
  month: string;
  deliverables: number;
  delivered: number;
  completionRate: number;
  hEfficiency: number;
  momDeliverables: number | null;  // month-over-month %
  momDelivered: number | null;
  movingAvgDeliverables: number;
  movingAvgDelivered: number;
}

export interface Insight {
  type: "success" | "warning" | "info" | "danger";
  title: string;
  description: string;
  metric?: string | number;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type DashboardView =
  | "overview"
  | "performance"
  | "brands"
  | "platforms"
  | "services"
  | "financial"
  | "trends"
  | "data";

export interface NavItem {
  id: DashboardView;
  label: string;
  icon: string;
  description: string;
}
