"use client";
import { motion } from "framer-motion";
import { useSheetData } from "@/hooks/useSheetData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from "@/components/charts/ChartCard";
import { CustomTooltip } from "@/components/charts/CustomTooltip";
import { fmt, fmtPct, fmtHours, rateColor, getColor, CHART_COLORS } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

const SERVICE_ICONS: Record<string, string> = {
  "Social Media Management": "📱",
  "Design": "🎨",
  "Video/Photo session": "🎬",
  "SEO": "🔍",
  "CRM": "🤝",
  "Campaigns": "📣",
};

export function ServiceAnalytics() {
  const { isLoading, byService } = useSheetData();

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

  const pieData = byService.map((s, i) => ({
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

                {/* Deliverables row */}
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

                {/* Hours row */}
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 mt-3 mb-1.5">
                  Hours
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
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 100, bottom: 0 }}>
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
        <ChartCard title="Deliverables by Service" subtitle="Planned vs Delivered" height={260} loading={isLoading}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 30, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Planned" fill="#B5B9FE" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Delivered" radius={[3, 3, 0, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
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
    </div>
  );
}
