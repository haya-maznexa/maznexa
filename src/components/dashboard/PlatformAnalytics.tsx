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
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
  PieChart, Pie, Cell, ComposedChart, Line,
} from "recharts";

const PLATFORM_ICONS: Record<string, string> = {
  Instagram: "📸", Facebook: "📘", TikTok: "🎵", LinkedIn: "💼",
  X: "𝕏", Snapchat: "👻", Snap: "👻", YouTube: "▶️",
  Pinterest: "📌", Google: "🔍", Offline: "🏢", "-": "❓",
};

export function PlatformAnalytics() {
  const { isLoading, byPlatform } = useSheetData();

  const data = byPlatform.map((p, i) => ({
    name: p.platform,
    short: p.platform.length > 8 ? p.platform.slice(0, 8) : p.platform,
    Planned: p.deliverables,
    Delivered: p.delivered,
    Extra: p.extra,
    Rate: p.completionRate,
    HPlanned: p.hPlanned,
    HDelivered: p.hDelivered,
    Brands: p.brands,
    color: CHART_COLORS[i],
  }));

  const pieData = byPlatform.map((p, i) => ({
    name: p.platform, value: p.delivered, color: CHART_COLORS[i],
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Platform cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {byPlatform.map((p, i) => (
          <motion.div
            key={p.platform}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="group hover:shadow-card-hover transition-all duration-300">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{PLATFORM_ICONS[p.platform] ?? "📡"}</span>
                  <Badge
                    variant="outline"
                    style={{ borderColor: rateColor(p.completionRate), color: rateColor(p.completionRate) }}
                    className="text-[10px]"
                  >
                    {fmtPct(p.completionRate)}
                  </Badge>
                </div>
                <p className="text-sm font-bold text-foreground truncate">{p.platform}</p>
                <p className="text-xs text-muted-foreground">{fmt(p.delivered)} delivered</p>
                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: getColor(i) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((p.delivered / (byPlatform[0]?.delivered || 1)) * 100, 100)}%` }}
                    transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {fmtHours(p.hDelivered)} · {p.brands} brand{p.brands !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Platform Deliverables" subtitle="Planned vs Delivered" height={280} loading={isLoading}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="short" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                content={<CustomTooltip />}
                formatter={(value: unknown, name: string) => [fmt(Number(value)), name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Planned" fill="#93C5FD" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Delivered" radius={[3, 3, 0, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Platform Share" subtitle="Distribution of deliverables" height={280} loading={isLoading}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" outerRadius={90} innerRadius={50} paddingAngle={3} dataKey="value">
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip formatter={(v, n) => [fmt(Number(v)), n]} />} />
              <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion rate bar */}
        <ChartCard title="Completion Rate by Platform" subtitle="% of planned deliverables met" height={260} loading={isLoading}>
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 50, left: 70, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" domain={[0, 110]} tick={{ fontSize: 10 }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={68} />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}%`, "Completion"]} />} />
              <Bar dataKey="Rate" radius={[0, 4, 4, 0]}>
                {data.map((d, i) => <Cell key={i} fill={rateColor(d.Rate)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Platform scorecard */}
        <Card>
          <CardHeader><CardTitle>Platform Scorecard</CardTitle></CardHeader>
          <CardContent className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="pb-2 text-left font-semibold">Platform</th>
                  <th className="pb-2 text-right font-semibold">Planned</th>
                  <th className="pb-2 text-right font-semibold">Delivered</th>
                  <th className="pb-2 text-right font-semibold">Rate</th>
                  <th className="pb-2 text-right font-semibold">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {byPlatform.map((p, i) => (
                  <tr key={p.platform} className="hover:bg-muted/50 transition-colors">
                    <td className="py-2 font-medium">
                      <span className="mr-1.5">{PLATFORM_ICONS[p.platform] ?? "📡"}</span>
                      {p.platform}
                    </td>
                    <td className="py-2 text-right">{fmt(p.deliverables)}</td>
                    <td className="py-2 text-right">{fmt(p.delivered)}</td>
                    <td className="py-2 text-right">
                      <span style={{ color: rateColor(p.completionRate) }} className="font-semibold">
                        {fmtPct(p.completionRate)}
                      </span>
                    </td>
                    <td className="py-2 text-right">{fmtHours(p.hDelivered)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
