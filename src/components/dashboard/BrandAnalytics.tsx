"use client";
import { motion } from "framer-motion";
import { Trophy, TrendingDown, TrendingUp } from "lucide-react";
import { useSheetData } from "@/hooks/useSheetData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from "@/components/charts/ChartCard";
import { CustomTooltip } from "@/components/charts/CustomTooltip";
import { fmt, fmtPct, fmtHours, rateColor, getColor, CHART_COLORS } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell, Legend, PieChart, Pie,
} from "recharts";

export function BrandAnalytics() {
  const { isLoading, byBrand } = useSheetData();

  const top = byBrand.slice(0, 5);
  const bottom = [...byBrand].sort((a, b) => a.completionRate - b.completionRate).slice(0, 3);

  const chartData = byBrand.map((b, i) => ({
    name: b.brand.length > 9 ? b.brand.slice(0, 9) + "…" : b.brand,
    fullName: b.brand,
    Planned: b.deliverables,
    Delivered: b.delivered,
    Rate: b.completionRate,
    HPlanned: b.hPlanned,
    HDelivered: b.hDelivered,
    color: CHART_COLORS[i],
  }));

  const pieData = byBrand.map((b, i) => ({ name: b.brand, value: b.delivered, color: CHART_COLORS[i] }));

  const radarMetrics = ["Completion", "H-Efficiency", "Over-Delivery"];
  const radarData = radarMetrics.map((metric) => {
    const entry: Record<string, string | number> = { metric };
    byBrand.slice(0, 5).forEach((b) => {
      entry[b.brand] =
        metric === "Completion" ? b.completionRate
        : metric === "H-Efficiency" ? Math.min(b.hoursEfficiency, 150)
        : Math.min(b.overDeliveryRate, 150);
    });
    return entry;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Top / Bottom rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top brands */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Top Brands by Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {top.map((b, i) => (
              <motion.div
                key={b.brand}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3"
              >
                <span className="w-5 text-xs font-bold text-muted-foreground text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{b.brand}</span>
                    <span className="text-xs text-muted-foreground ml-2">{fmt(b.delivered)} items</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: getColor(i) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((b.delivered / (top[0]?.delivered || 1)) * 100, 100)}%` }}
                      transition={{ delay: i * 0.06 + 0.2, duration: 0.5 }}
                    />
                  </div>
                </div>
                <Badge
                  variant="outline"
                  style={{ borderColor: rateColor(b.completionRate), color: rateColor(b.completionRate) }}
                  className="text-[10px] shrink-0"
                >
                  {fmtPct(b.completionRate)}
                </Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Needs attention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-red-500" /> Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bottom.map((b, i) => (
              <motion.div
                key={b.brand}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between gap-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/30"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{b.brand}</p>
                  <p className="text-xs text-muted-foreground">{fmt(b.delivered)} / {fmt(b.deliverables)} delivered</p>
                </div>
                <Badge variant="danger">{fmtPct(b.completionRate)}</Badge>
              </motion.div>
            ))}
            {bottom.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">All brands performing well</p>}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Deliverables by Brand" subtitle="Planned vs Delivered" height={280} loading={isLoading}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Planned" fill="#93C5FD" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Delivered" radius={[3, 3, 0, 0]}>
                {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Delivery Share" subtitle="Proportion of total deliverables" height={280} loading={isLoading}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip formatter={(v, n) => [fmt(Number(v)), n]} />} />
              <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Hours comparison + Brand metrics table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Hours Investment" subtitle="Planned vs actual hours per brand" height={260} loading={isLoading}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip formatter={(v) => [`${v}h`, ""]} />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="HPlanned" name="Planned h" fill="#BFDBFE" radius={[3, 3, 0, 0]} />
              <Bar dataKey="HDelivered" name="Actual h" fill="#3B82F6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Metrics table */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Scorecard</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="pb-2 text-left font-semibold">Brand</th>
                  <th className="pb-2 text-right font-semibold">Delivered</th>
                  <th className="pb-2 text-right font-semibold">Rate</th>
                  <th className="pb-2 text-right font-semibold">Hours</th>
                  <th className="pb-2 text-right font-semibold">Services</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {byBrand.map((b, i) => (
                  <motion.tr
                    key={b.brand}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-2 font-medium truncate max-w-[100px]">{b.brand}</td>
                    <td className="py-2 text-right">{fmt(b.delivered)}</td>
                    <td className="py-2 text-right">
                      <span style={{ color: rateColor(b.completionRate) }} className="font-semibold">
                        {fmtPct(b.completionRate)}
                      </span>
                    </td>
                    <td className="py-2 text-right">{fmtHours(b.hDelivered)}</td>
                    <td className="py-2 text-right">{b.services}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
