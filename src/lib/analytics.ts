import type {
  SheetRow, KPIData, BrandMetric, PlatformMetric,
  ServiceMetric, MonthlyMetric, TrendMetric, Insight,
} from "@/types";

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export function computeKPIs(rows: SheetRow[]): KPIData {
  const totalDeliverables = sum(rows, "deliverables");
  const totalDelivered = sum(rows, "delivered");
  const totalExtra = sum(rows, "extra");
  const totalHPlanned = sum(rows, "hDeliverables");
  const totalHDelivered = sum(rows, "hDelivered");
  const totalHExtra = sum(rows, "hExtra");

  return {
    totalRows: rows.length,
    totalDeliverables,
    totalDelivered,
    totalExtra,
    completionRate: pct(totalDelivered, totalDeliverables),
    overDeliveryRate: pct(totalDelivered + totalExtra, totalDeliverables),
    totalHPlanned,
    totalHDelivered,
    totalHExtra,
    hoursEfficiency: pct(totalHPlanned, totalHDelivered),
    activeBrands: unique(rows, "company"),
    activePlatforms: unique(rows, "platform"),
    activeServices: unique(rows, "service"),
    activeMonths: unique(rows, "monthKey"),
  };
}

// ─── By Brand ─────────────────────────────────────────────────────────────────

export function computeByBrand(rows: SheetRow[]): BrandMetric[] {
  const map = new Map<string, SheetRow[]>();
  for (const r of rows) {
    if (!map.has(r.company)) map.set(r.company, []);
    map.get(r.company)!.push(r);
  }
  return Array.from(map.entries())
    .map(([brand, rs]) => ({
      brand,
      deliverables: sum(rs, "deliverables"),
      delivered: sum(rs, "delivered"),
      extra: sum(rs, "extra"),
      completionRate: pct(sum(rs, "delivered"), sum(rs, "deliverables")),
      overDeliveryRate: pct(sum(rs, "delivered") + sum(rs, "extra"), sum(rs, "deliverables")),
      hPlanned: sum(rs, "hDeliverables"),
      hDelivered: sum(rs, "hDelivered"),
      hoursEfficiency: pct(sum(rs, "hDeliverables"), sum(rs, "hDelivered")),
      platforms: unique(rs, "platform"),
      services: unique(rs, "service"),
      rows: rs.length,
    }))
    .sort((a, b) => b.delivered - a.delivered);
}

// ─── By Platform ──────────────────────────────────────────────────────────────

export function computeByPlatform(rows: SheetRow[]): PlatformMetric[] {
  const map = new Map<string, SheetRow[]>();
  for (const r of rows) {
    if (!map.has(r.platform)) map.set(r.platform, []);
    map.get(r.platform)!.push(r);
  }
  return Array.from(map.entries())
    .map(([platform, rs]) => ({
      platform,
      deliverables: sum(rs, "deliverables"),
      delivered: sum(rs, "delivered"),
      extra: sum(rs, "extra"),
      completionRate: pct(sum(rs, "delivered"), sum(rs, "deliverables")),
      overDeliveryRate: pct(sum(rs, "delivered") + sum(rs, "extra"), sum(rs, "deliverables")),
      hPlanned: sum(rs, "hDeliverables"),
      hDelivered: sum(rs, "hDelivered"),
      brands: unique(rs, "company"),
      rows: rs.length,
    }))
    .filter((p) => p.platform !== "-")
    .sort((a, b) => b.delivered - a.delivered);
}

// ─── By Service ───────────────────────────────────────────────────────────────

export function computeByService(rows: SheetRow[]): ServiceMetric[] {
  const map = new Map<string, SheetRow[]>();
  for (const r of rows) {
    if (!map.has(r.service)) map.set(r.service, []);
    map.get(r.service)!.push(r);
  }
  return Array.from(map.entries())
    .map(([service, rs]) => ({
      service,
      deliverables: sum(rs, "deliverables"),
      delivered: sum(rs, "delivered"),
      extra: sum(rs, "extra"),
      completionRate: pct(sum(rs, "delivered"), sum(rs, "deliverables")),
      overDeliveryRate: pct(sum(rs, "delivered") + sum(rs, "extra"), sum(rs, "deliverables")),
      hPlanned: sum(rs, "hDeliverables"),
      hDelivered: sum(rs, "hDelivered"),
      brands: unique(rs, "company"),
      platforms: unique(rs, "platform"),
      rows: rs.length,
    }))
    .sort((a, b) => b.hDelivered - a.hDelivered);
}

// ─── By Month ─────────────────────────────────────────────────────────────────

export function computeByMonth(rows: SheetRow[]): MonthlyMetric[] {
  const map = new Map<string, SheetRow[]>();
  for (const r of rows) {
    if (!map.has(r.monthKey)) map.set(r.monthKey, []);
    map.get(r.monthKey)!.push(r);
  }
  return Array.from(map.entries())
    .map(([monthKey, rs]) => ({
      monthKey,
      month: rs[0].month,
      year: rs[0].year,
      deliverables: sum(rs, "deliverables"),
      delivered: sum(rs, "delivered"),
      extra: sum(rs, "extra"),
      completionRate: pct(sum(rs, "delivered"), sum(rs, "deliverables")),
      hPlanned: sum(rs, "hDeliverables"),
      hDelivered: sum(rs, "hDelivered"),
      brands: unique(rs, "company"),
      rows: rs.length,
    }))
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

// ─── Trends ───────────────────────────────────────────────────────────────────

export function computeTrends(monthly: MonthlyMetric[]): TrendMetric[] {
  return monthly.map((m, i) => {
    const prev = i > 0 ? monthly[i - 1] : null;
    const window = monthly.slice(Math.max(0, i - 2), i + 1);

    return {
      monthKey: m.monthKey,
      month: `${m.month.slice(0, 3)} ${m.year}`,
      deliverables: m.deliverables,
      delivered: m.delivered,
      completionRate: m.completionRate,
      hEfficiency: pct(m.hPlanned, m.hDelivered),
      momDeliverables: prev
        ? pctChange(m.deliverables, prev.deliverables)
        : null,
      momDelivered: prev ? pctChange(m.delivered, prev.delivered) : null,
      movingAvgDeliverables:
        window.reduce((s, x) => s + x.deliverables, 0) / window.length,
      movingAvgDelivered:
        window.reduce((s, x) => s + x.delivered, 0) / window.length,
    };
  });
}

// ─── Insights ─────────────────────────────────────────────────────────────────

export function generateInsights(
  rows: SheetRow[],
  kpis: KPIData,
  byBrand: BrandMetric[],
  byPlatform: PlatformMetric[],
  byService: ServiceMetric[],
  trends: TrendMetric[]
): Insight[] {
  const insights: Insight[] = [];

  // Top brand
  if (byBrand[0]) {
    insights.push({
      type: "success",
      title: "Top Performing Brand",
      description: `${byBrand[0].brand} leads with ${byBrand[0].delivered.toLocaleString()} deliverables delivered`,
      metric: `${byBrand[0].completionRate.toFixed(0)}% completion`,
    });
  }

  // Completion rate
  if (kpis.completionRate >= 95) {
    insights.push({
      type: "success",
      title: "Excellent Delivery Rate",
      description: `Overall completion rate is ${kpis.completionRate.toFixed(1)}% — exceeding targets`,
      metric: `${kpis.completionRate.toFixed(1)}%`,
    });
  } else if (kpis.completionRate < 80) {
    insights.push({
      type: "danger",
      title: "Low Completion Rate",
      description: `Completion rate is ${kpis.completionRate.toFixed(1)}% — below the 80% threshold`,
      metric: `${kpis.completionRate.toFixed(1)}%`,
    });
  }

  // Hours over-run
  if (kpis.hoursEfficiency < 85) {
    insights.push({
      type: "warning",
      title: "Hours Over-Budget",
      description: `Hours efficiency is ${kpis.hoursEfficiency.toFixed(1)}% — actual hours exceeded plan`,
      metric: `+${(kpis.totalHDelivered - kpis.totalHPlanned).toFixed(0)}h over`,
    });
  }

  // Best platform
  const bestPlatform = byPlatform.reduce(
    (best, p) => (p.completionRate > best.completionRate ? p : best),
    byPlatform[0] ?? { platform: "", completionRate: 0 }
  );
  if (bestPlatform.platform) {
    insights.push({
      type: "info",
      title: "Best Platform",
      description: `${bestPlatform.platform} has the highest completion rate`,
      metric: `${bestPlatform.completionRate.toFixed(0)}%`,
    });
  }

  // Top service by hours
  if (byService[0]) {
    insights.push({
      type: "info",
      title: "Most Active Service",
      description: `${byService[0].service} consumed the most hours this period`,
      metric: `${byService[0].hDelivered.toFixed(0)}h`,
    });
  }

  // MoM trend
  const lastTrend = trends[trends.length - 1];
  if (lastTrend?.momDelivered !== null && lastTrend?.momDelivered !== undefined) {
    const dir = lastTrend.momDelivered >= 0 ? "up" : "down";
    insights.push({
      type: lastTrend.momDelivered >= 0 ? "success" : "warning",
      title: "Month-over-Month Trend",
      description: `Deliverables are ${dir} ${Math.abs(lastTrend.momDelivered).toFixed(1)}% compared to last month`,
      metric: `${lastTrend.momDelivered >= 0 ? "+" : ""}${lastTrend.momDelivered.toFixed(1)}%`,
    });
  }

  // Over-delivery bonus
  if (kpis.overDeliveryRate > 110) {
    insights.push({
      type: "success",
      title: "Over-Delivery Bonus",
      description: `Team delivered ${kpis.totalExtra.toLocaleString()} extra items beyond contracted scope`,
      metric: `+${kpis.totalExtra.toLocaleString()} extras`,
    });
  }

  // Underperforming brand
  const worst = byBrand[byBrand.length - 1];
  if (worst && worst.completionRate < 70) {
    insights.push({
      type: "warning",
      title: "Needs Attention",
      description: `${worst.brand} has the lowest completion rate — requires review`,
      metric: `${worst.completionRate.toFixed(0)}%`,
    });
  }

  return insights;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sum<K extends keyof SheetRow>(rows: SheetRow[], key: K): number {
  return rows.reduce((acc, r) => acc + ((r[key] as number) || 0), 0);
}

function unique<K extends keyof SheetRow>(rows: SheetRow[], key: K): number {
  return new Set(rows.map((r) => r[key])).size;
}

function pct(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function pctChange(current: number, previous: number): number {
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
