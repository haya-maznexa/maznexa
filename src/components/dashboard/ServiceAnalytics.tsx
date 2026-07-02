"use client";
import { motion } from "framer-motion";
import { useSheetData } from "@/hooks/useSheetData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from "@/components/charts/ChartCard";
import { CustomTooltip } from "@/components/charts/CustomTooltip";
import { fmt, fmtPct, fmtHours, rateColor, getColor, CHART_COLORS, shortMonthLabel } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area, ComposedChart, Line,
} from "recharts";
import { Clock } from "lucide-react";

const SERVICE_ICONS: Record<string, string> = {
  "Social Media Management": "📱",
  "Design": "🎨",
  "Video/Photo session": "🎬",
  "SEO": "🔍",
  "CRM": "🤝",
  "Campaigns": "📣",
};

export function ServiceAnalytics() {
  const { isLoading, byService, filtered } = useSheetData();

  // ── Per-service monthly hours (only services that logged hours) ──
  const hoursServices = byService.filter((s) => s.hDelivered > 0);
  const perServiceMonthly = hoursServices.map((s) => {
    const rows = filtered.filter((r) => r.service === s.service);
    const byMonthMap = new Map<string, { planned: number; actual: number }>();
    for (const r of rows) {
      if (!r.monthKey || r.monthKey === "0000-00") continue;
      const cur = byMonthMap.get(r.monthKey) ?? { planned: 0, actual: 0 };
      cur.planned += r.hDeliverables;
      cur.actual += r.hDelivered;
      byMonthMap.set(r.monthKey, cur);
    }
    const series = Array.from(byMonthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, v]) => ({
        name: shortMonthLabel(key),
        Planned: Math.round(v.planned),
        Actual: Math.round(v.actual),
      }));
    return { service: s.service, hPlanned: s.hPlanned, hDelivered: s.hDelivered, series };
  });

  const data = byService.map((s, i) => ({
    name: s.service.length > 14 ? s.service.slice(0, 14) + "…" : s.service,
    fullName: s.service,
    Planned: s.deliverables,
    Delivered: s.delivered,
    Extra: s.extra,
    Rate: s.completionRate,
    HPlanned: s.hPlanned,
    HDelivered: s.hDelivered,
    Brands: s.brands,
    Platforms: s.platforms,
    color: CHART_COLORS[i],
  }));

  // Hours-based services → hours charts; deliverable-based → deliverables chart
  const hoursData = data.filter((d) => d.HDelivered > 0);
  const deliverableData = data.filter((d) => d.Delivered > 0 || d.Planned > 0);

  const pieData = byService
    .filter((s) => s.hDelivered > 0)
    .map((s, i) => ({
      name: s.service, value: s.hDelivered, color: CHART_COLORS[i],
    }));

  const radarData = [
    { metric: "Completion %" },
    { metric: "Hours %" },
    { metric: "Brands" },
    { metric: "Deliverables" },
  ].map(({ metric }) => {
    const entry: Record<string, string | number> = { metric };
    byService.forEach((s, i) => {
      const maxD = Math.max(...byService.map((x) => x.deliverables), 1);
      const maxH = Math.max(...byService.map((x) => x.hDelivered), 1);
      const maxB = Math.max(...byService.map((x) => x.brands), 1);
      entry[s.service] =
        metric === "Completion %" ? s.completionRate
        : metric === "Hours %" ? (s.hDelivered / maxH) * 100
        : metric === "Brands" ? (s.brands / maxB) * 100
        : (s.deliverables / maxD) * 100;
    });
    return entry;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Service cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {byService.map((s, i) => {
          // Hours-based services (CRM, SEO …) have no deliverables — show hours
          // efficiency instead of a misleading 0% deliverable completion.
          const isHoursBased = s.deliverables === 0 && s.hDelivered > 0;
          const displayRate = isHoursBased
            ? (s.hPlanned > 0 ? (s.hDelivered / s.hPlanned) * 100 : 100)
            : s.completionRate;
          return (
          <motion.div
            key={s.service}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="hover:shadow-card-hover transition-all duration-300">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{SERVICE_ICONS[s.service] ?? "⚙️"}</span>
                    <div>
                      <p className="text-sm font-bold leading-tight">{s.service}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.brands} brand{s.brands !== 1 ? "s" : ""} · {s.platforms} platform{s.platforms !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    style={{ borderColor: rateColor(displayRate), color: rateColor(displayRate) }}
                    className="text-[10px]"
                    title={isHoursBased ? "Hours efficiency" : "Deliverable completion"}
                  >
                    {fmtPct(displayRate)}
                  </Badge>
                </div>

                {/* Hours-based services (CRM, SEO, Design, Video/Photo) → hours only.
                    Deliverable-based services (Social Media, Campaigns) → deliverables only. */}
                {isHoursBased ? (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 mb-1.5">
                      Hours <span className="text-muted-foreground/50 normal-case">(counted hourly)</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: "Planned", value: fmtHours(s.hPlanned) },
                        { label: "Actual", value: fmtHours(s.hDelivered) },
                        {
                          label: "Variance",
                          value: `${s.hDelivered - s.hPlanned >= 0 ? "+" : ""}${fmtHours(s.hDelivered - s.hPlanned)}`,
                        },
                      ].map((m, idx) => (
                        <div
                          key={m.label}
                          className="rounded-lg py-1.5 px-1"
                          style={{ background: "rgba(80,83,200,0.08)" }}
                        >
                          <p
                            className="text-sm font-bold"
                            style={{
                              color:
                                idx === 2
                                  ? s.hDelivered > s.hPlanned
                                    ? "#F59E0B"
                                    : "#10B981"
                                  : "#5053C8",
                            }}
                          >
                            {m.value}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 mb-1.5">
                      Deliverables
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: "Planned", value: fmt(s.deliverables) },
                        { label: "Delivered", value: fmt(s.delivered) },
                        { label: "Extra", value: fmt(s.extra) },
                      ].map((m) => (
                        <div key={m.label} className="bg-muted rounded-lg py-1.5 px-1">
                          <p className="text-sm font-bold text-foreground">{m.value}</p>
                          <p className="text-[10px] text-muted-foreground">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Hours by Service" subtitle="Planned vs actual hours" height={280} loading={isLoading}>
          <ResponsiveContainer>
            <BarChart data={hoursData} layout="vertical" margin={{ top: 0, right: 16, left: 100, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={98} />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}h`, ""]} />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="HPlanned" name="Planned h" fill="#B5B9FE" radius={[0, 3, 3, 0]} />
              <Bar dataKey="HDelivered" name="Actual h" fill="#5053C8" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hours Distribution" subtitle="Share of total hours worked" height={280} loading={isLoading}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip formatter={(v, n) => [`${v}h`, n]} />} />
              <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Deliverables by Service" subtitle="Planned vs Delivered (count-based services)" height={260} loading={isLoading}>
          <ResponsiveContainer>
            <BarChart data={deliverableData} margin={{ top: 4, right: 8, bottom: 30, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Planned" fill="#B5B9FE" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Delivered" radius={[3, 3, 0, 0]}>
                {deliverableData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Service Radar" subtitle="Multi-dimension performance" height={260} loading={isLoading}>
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              {byService.map((s, i) => (
                <Radar
                  key={s.service}
                  name={s.service}
                  dataKey={s.service}
                  stroke={CHART_COLORS[i]}
                  fill={CHART_COLORS[i]}
                  fillOpacity={0.1}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Separate hours chart per service ── */}
      <div>
        <div className="flex items-center gap-2 mb-4 mt-2">
          <Clock className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Hours by Service — Monthly Breakdown
          </h2>
          <span className="text-xs text-muted-foreground">
            Planned vs actual hours per month, one chart per service
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {perServiceMonthly.map((svc, idx) => {
            const color = CHART_COLORS[idx % CHART_COLORS.length];
            const variance = svc.hDelivered - svc.hPlanned;
            return (
              <ChartCard
                key={svc.service}
                title={`${SERVICE_ICONS[svc.service] ?? "⚙️"}  ${svc.service}`}
                subtitle={`${fmtHours(svc.hPlanned)} planned · ${fmtHours(svc.hDelivered)} actual · ${variance >= 0 ? "+" : ""}${fmtHours(variance)} variance`}
                height={240}
                loading={isLoading}
                action={
                  <Badge
                    variant="outline"
                    style={{ borderColor: color, color }}
                    className="text-[10px]"
                  >
                    {fmtHours(svc.hDelivered)}
                  </Badge>
                }
              >
                {svc.series.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    No hours in selected period
                  </div>
                ) : (
                  <ResponsiveContainer>
                    <ComposedChart data={svc.series} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                      <defs>
                        <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.22} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip formatter={(v, n) => [`${fmtHours(Number(v))}`, n]} />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area
                        type="monotone"
                        dataKey="Actual"
                        stroke={color}
                        fill={`url(#grad-${idx})`}
                        strokeWidth={2.5}
                      />
                      <Line
                        type="monotone"
                        dataKey="Planned"
                        stroke="#94A3B8"
                        strokeWidth={2}
                        strokeDasharray="5 3"
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
